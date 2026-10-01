import { describe, expect, it } from 'vitest';
import { tt } from './hardcodedTranslate';

describe('hardcodedTranslate', () => {
  it('returns English source text for Google Translate Element', () => {
    expect(tt('My Dashboard')).toBe('My Dashboard');
    expect(tt('Toggle Sidebar')).toBe('Toggle Sidebar');
  });
});
