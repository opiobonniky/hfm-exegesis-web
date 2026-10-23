import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from './api';
import { bibleApi, mapFrontendId, mapTranslationId } from './bibleApi';

vi.mock('./api', () => ({ default: { post: vi.fn(), get: vi.fn() } }));

describe('Bible XML edition identity', () => {
  beforeEach(() => vi.clearAllMocks());
  it.each(['WEB', 'WEBSTER', 'BBE', 'GW', 'Amplified', 'EASY', 'KJV', 'French'])(
    'never relabels %s as a different Bible edition', id => {
      expect(mapTranslationId(id)).toBe(id);
      expect(mapFrontendId(id)).toBe(id);
    },
  );
  it('requests chapter content only from the selected XML-backed edition endpoint', async () => {
    const chapters = [{ chapterNumber: 1, verses: [{ verseNumber: 1, text: 'Version-specific text' }] }];
    vi.mocked(api.post).mockResolvedValue({ data: { success: true, data: chapters } });
    expect(await bibleApi.getVersesBatch('French', 'Psalms', [1])).toEqual(chapters);
    expect(api.post).toHaveBeenCalledWith('/translations/French/verses-batch', {
      bookName: 'Psalms', chapters: [1],
    }, { timeout: 60000 });
  });
});
