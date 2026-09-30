import { afterEach, describe, expect, it } from 'vitest';
import { setRuntimeLanguage, tt } from './hardcodedTranslate';

describe('hardcodedTranslate', () => {
  afterEach(() => setRuntimeLanguage('en'));

  it('uses the generated English identity dictionary', () => {
    setRuntimeLanguage('en');
    expect(tt('Cancel')).toBe('Cancel');
  });

  it('falls back to source text when a dictionary entry is missing', () => {
    setRuntimeLanguage('fr');
    expect(tt('__translation_key_that_does_not_exist__')).toBe('__translation_key_that_does_not_exist__');
  });

  it('reuses safe translations from the existing locale JSON', () => {
    setRuntimeLanguage('fr');
    expect(tt('My Dashboard')).not.toBe('My Dashboard');
    expect(tt('Copy')).not.toBe('Copy');
  });

  it('rejects corrupted locale values with mismatched placeholders', () => {
    setRuntimeLanguage('fr');
    expect(tt('Like')).not.toContain('{word}');
  });
});
