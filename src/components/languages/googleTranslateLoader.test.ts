import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('Google Translate loading and recovery', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
    document.body.innerHTML = '<div id="google_translate_element"></div>';
    document.getElementById('google-translate-element-script')?.remove();
    delete window.google;
  });
  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    document.getElementById('google-translate-element-script')?.remove();
    delete window.google;
    delete window.googleTranslateElementInit;
  });

  it('times out a blocked script instead of keeping language switching stuck', async () => {
    const { loadGoogleTranslate } = await import('./googleTranslate');
    const result = loadGoogleTranslate('fr').catch(error => error);
    await vi.advanceTimersByTimeAsync(15_000);
    expect((await result).message).toContain('timed out');
    expect(document.getElementById('google-translate-element-script')).toBeNull();
  });

  it('retries after a script failure and deduplicates concurrent loads', async () => {
    const { loadGoogleTranslate } = await import('./googleTranslate');
    const first = loadGoogleTranslate('fr');
    expect(loadGoogleTranslate('fr')).toBe(first);
    const failure = first.catch(error => error);
    document.getElementById('google-translate-element-script')!.dispatchEvent(new Event('error'));
    expect((await failure).message).toContain('failed to load');

    const retry = loadGoogleTranslate('fr');
    window.google = { translate: { TranslateElement: function () {
      const select = document.createElement('select');
      select.className = 'goog-te-combo';
      document.getElementById('google_translate_element')!.appendChild(select);
    } as never } };
    window.googleTranslateElementInit!();
    await vi.advanceTimersByTimeAsync(100);
    await expect(retry).resolves.toBeUndefined();
  });
});
