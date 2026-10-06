import { describe, expect, it } from 'vitest';
import { getContiguousVerseRange } from './selectedVerseRange';

const verse = (chapter: number, number: number) => ({
  book: 'John',
  chapter,
  verse: number,
  text: `Verse ${number}`,
});

describe('getContiguousVerseRange', () => {
  it('preserves the full sorted range', () => {
    expect(
      getContiguousVerseRange([verse(3, 18), verse(3, 16), verse(3, 17)]),
    ).toMatchObject({ verse: 16, verseEnd: 18 });
  });

  it('supports one selected verse', () => {
    expect(getContiguousVerseRange([verse(3, 16)])).toMatchObject({
      verse: 16,
      verseEnd: 16,
    });
  });

  it('rejects selections with gaps or multiple chapters', () => {
    expect(getContiguousVerseRange([verse(3, 16), verse(3, 18)])).toBeNull();
    expect(getContiguousVerseRange([verse(3, 16), verse(4, 1)])).toBeNull();
  });
});
