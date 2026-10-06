import type { VerseActionTarget } from '../types';

type SelectedVerse = VerseActionTarget;

export function getContiguousVerseRange(
  verses: SelectedVerse[],
): VerseActionTarget | null {
  if (verses.length === 0) return null;

  const sorted = [...verses].sort((a, b) => a.verse - b.verse);
  const first = sorted[0];
  const samePassage = sorted.every(
    verse => verse.book === first.book && verse.chapter === first.chapter,
  );
  const contiguous = sorted.every(
    (verse, index) => index === 0 || verse.verse === sorted[index - 1].verse + 1,
  );
  if (!samePassage || !contiguous) return null;

  return {
    book: first.book,
    chapter: first.chapter,
    verse: first.verse,
    verseEnd: sorted[sorted.length - 1].verse,
    text: sorted.map(verse => verse.text).join('\n'),
  };
}
