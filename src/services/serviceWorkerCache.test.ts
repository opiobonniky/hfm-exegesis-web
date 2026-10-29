import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { expect, it, vi } from 'vitest';

function worker() {
  const handlers: Record<string, (event: any) => void> = {};
  const self = { location: { hostname: 'app.example', origin: 'https://app.example' }, addEventListener: (name: string, fn: any) => { handlers[name] = fn; }, clients: { claim: vi.fn() } };
  runInNewContext(readFileSync('public/sw.js', 'utf8'), { self, URL, console, importScripts: vi.fn(), firebase: { initializeApp: vi.fn(), messaging: () => ({ onBackgroundMessage: vi.fn() }) } });
  return handlers;
}
it.each(['/journal/entries', '/subscriptions/status', '/auth/profile', '/media/private.png?sig=abc', '/uploads/profile.jpg', '/api/other'])('never intercepts private/API response %s', path => {
  const handlers = worker(); const respondWith = vi.fn();
  handlers.fetch({ request: { method: 'GET', url: `https://app.example${path}`, destination: '', headers: { has: () => false } }, respondWith });
  expect(respondWith).not.toHaveBeenCalled();
});
it('never caches bearer requests or third-party media', () => {
  const handlers = worker();
  for (const [url, bearer] of [['https://app.example/assets/private.js', true], ['https://other.example/private.png', false]] as const) {
    const respondWith = vi.fn();
    handlers.fetch({ request: { method: 'GET', url, destination: 'script', headers: { has: () => bearer } }, respondWith });
    expect(respondWith).not.toHaveBeenCalled();
  }
});
