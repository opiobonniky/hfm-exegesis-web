import { expect, it } from 'vitest';
import { getBookDesignation } from './useBookOverview';
import { BIBLE_BOOKS } from '../constants';
it('covers all 66 canonical books without shifting the forty-sixth', () => {
  expect(getBookDesignation('1 Corinthians')).toBe('The Forty-Sixth Book of the Bible');
  expect(getBookDesignation('Revelation')).toBe('The Sixty-Sixth Book of the Bible');
  for (const book of BIBLE_BOOKS) expect(getBookDesignation(book.bookName)).toBeTruthy();
  expect(getBookDesignation('not a book')).toBeNull();
});
