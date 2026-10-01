import { afterEach, describe, expect, it, vi } from 'vitest';
import { applyGoogleLanguage } from './googleTranslate';

describe('applyGoogleLanguage', () => {
  afterEach(() => {
    document.querySelector('.goog-te-combo')?.remove();
    document.cookie = 'googtrans=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
  });

  it('drives the hidden Google selector for French', () => {
    const selector = document.createElement('select');
    selector.className = 'goog-te-combo';
    selector.innerHTML = '<option value=""></option><option value="fr">French</option>';
    const changed = vi.fn();
    selector.addEventListener('change', changed);
    document.body.appendChild(selector);

    expect(applyGoogleLanguage('fr')).toBe(true);
    expect(selector.value).toBe('fr');
    expect(changed).toHaveBeenCalledOnce();
    expect(document.cookie).toContain('googtrans=/en/fr');
  });

  it('maps Filipino to Google\'s tl language code', () => {
    const selector = document.createElement('select');
    selector.className = 'goog-te-combo';
    selector.innerHTML = '<option value=""></option><option value="tl">Filipino</option>';
    document.body.appendChild(selector);

    expect(applyGoogleLanguage('fil')).toBe(true);
    expect(selector.value).toBe('tl');
  });

  it('returns false while the Google selector is not ready', () => {
    expect(applyGoogleLanguage('fr')).toBe(false);
  });
});
