import { BIBLE_BOOK_CHAPTERS } from '@/features/Bible/constants';

export function canonicalBook(value: string) {
  const name = value.trim().replace(/\s+/g, ' ');
  if (/^psalms?$/i.test(name)) return 'Psalms';
  return Object.keys(BIBLE_BOOK_CHAPTERS).find(book => book.toLowerCase() === name.toLowerCase()) || name;
}

export interface ReferenceEntry {
  bookName: string;
  chapter: number;
  verseNumber: number;
  verseEnd?: number;
  referenceText: string;
  commentary?: string;
}

function unpack(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string' || !value.trim()) return [];
  try { const parsed = JSON.parse(value); if (Array.isArray(parsed)) return parsed; } catch { /* legacy text */ }
  return value.split('\n').map(line => line.trim()).filter(Boolean).map(line => {
    try { const parsed: unknown = JSON.parse(line); if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed; } catch { /* ordinary legacy text */ }
    return line;
  });
}

export function parseReferences(value: unknown): ReferenceEntry[] {
  return unpack(value).map(entry => {
    if (entry && typeof entry === 'object') {
      const row = entry as Record<string, unknown>;
      const embedded = typeof (row.reference || row.ref) === 'string' ? parseReferences(row.reference || row.ref)[0] : undefined;
      const range = String(row.verseNumber || row.verse || '').match(/^(\d+)\s*[-–—]\s*(\d+)$/);
      return { ...row, bookName: canonicalBook(String(row.bookName || embedded?.bookName || '')), chapter: Number(row.chapter || embedded?.chapter || 0),
        verseNumber: Number(range?.[1] || row.verseNumber || row.verse || embedded?.verseNumber || 0), verseEnd: row.verseEnd ? Number(row.verseEnd) : range ? Number(range[2]) : embedded?.verseEnd,
        referenceText: String(row.referenceText || row.text || embedded?.referenceText || '') };
    }
    const line = String(entry);
    // Match the passage before splitting the quotation; verse ranges also use dashes.
    const match = line.match(/^(.+?)\s+(\d+)(?::|\s)(\d+)(?:\s*[-–—]\s*(\d+))?(?:\s*[-–—]\s*|\s+|$)([\s\S]*)$/);
    if (!match) return { bookName: '', chapter: 0, verseNumber: 0, referenceText: line };
    return { bookName: canonicalBook(match[1]), chapter: Number(match[2]), verseNumber: Number(match[3]),
      verseEnd: match[4] ? Number(match[4]) : undefined, referenceText: match[5].trim() };
  });
}

export function parseTakeaways(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(item => String(item ?? ''));
  if (typeof value !== 'string' || !value.trim()) return [];
  try { const parsed: unknown = JSON.parse(value); if (Array.isArray(parsed)) return parseTakeaways(parsed); } catch { /* legacy newline list */ }
  return value.split(/\r?\n/).map(item => item.trim()).filter(Boolean);
}

export const isEmptyReference = (row: ReferenceEntry) => !row.bookName.trim() && !row.chapter && !row.verseNumber && !row.verseEnd && !row.referenceText.trim() && !row.commentary?.trim();
export const nonEmptyReferences = (rows: ReferenceEntry[]) => rows.filter(row => !isEmptyReference(row));
export function referenceError(row: ReferenceEntry, index: number) {
  if (isEmptyReference(row)) return '';
  const missing = [!row.bookName.trim() && 'book', !row.chapter && 'chapter', !row.verseNumber && 'verse'].filter(Boolean);
  if (missing.length) return `Cross reference ${index + 1}: select ${missing.join(', ')}. Your existing text is preserved.`;
  if (!validPassage(row.bookName, row.chapter, row.verseNumber, row.verseEnd)) return `Cross reference ${index + 1}: check the book, chapter and verse range.`;
  return '';
}

export const referenceLabel = (row: { bookName: string; chapter: string | number; verseNumber: string | number; verseEnd?: string | number | null }) =>
  `${row.bookName} ${row.chapter}:${row.verseNumber}${row.verseEnd && Number(row.verseEnd) > Number(row.verseNumber) ? `-${row.verseEnd}` : ''}`;

// JSON preserves multiline quotations, commentary, incomplete drafts and ranges.
export const serializeReferences = (rows: ReferenceEntry[]) => rows.length ? JSON.stringify(rows) : '';

export interface StudyEntry { surfaceText: string; strongsId: string; customDefinition: string; sortOrder?: number }
/** Deliberately permissive: accepts real-world variants such as `G11`, `g11`,
 *  zero-padded `H0853`, suffix letters `H430a`, multiple IDs split by
 *  `/ , ; & +` or a dash, and IDs embedded in extra text. Only input with no
 *  recognizable Strong's token at all is treated as invalid. */
export const STRONGS_ID_TOKEN = /\b[HG]0*\d+[a-z]?\b/gi;
const strongsTokens = (value: string) =>
  [...new Set(value.match(STRONGS_ID_TOKEN)?.map(id => id.toUpperCase()) || [])];
const canonicalStrongsIds = (value: unknown) => Array.isArray(value)
  ? strongsTokens(value.filter((id): id is string => typeof id === 'string').join('/'))
  : [];
const stringValue = (value: unknown) => typeof value === 'string' ? value.trim() : '';
export function studyStrongsText(row: Record<string, unknown>): string {
  const dictionary = row.strongs && typeof row.strongs === 'object'
    ? row.strongs as Record<string, unknown> : undefined;
  return canonicalStrongsIds(row.strongsIds).join('/') || stringValue(row.strongsId) ||
    stringValue(row.strongs) || stringValue(dictionary?.strongsId) || stringValue(row.Strongs);
}
export const isEmptyStudy = (row: StudyEntry) => !row.surfaceText.trim() && !row.strongsId.trim() && !row.customDefinition.trim();
export const nonEmptyStudies = (rows: StudyEntry[]) => rows.filter(row => !isEmptyStudy(row));
export function parseStudies(value: unknown): StudyEntry[] {
  return unpack(value).flatMap(entry => {
    let row: StudyEntry;
    if (entry && typeof entry === 'object') {
      const item = entry as Record<string, unknown>;
      row = { surfaceText: String(item.surfaceText || item.word || ''), strongsId: studyStrongsText(item),
        customDefinition: String(item.customDefinition || item.definition || '') };
      // A shared-study row can link to several IDs. Reopen it as one row so a
      // save does not duplicate the word or split its links.
      if (canonicalStrongsIds(item.strongsIds).length) return [row];
    } else {
      const [surfaceText = '', strongsId = '', ...definition] = String(entry).split('|').map(part => part.trim());
      row = { surfaceText, strongsId, customDefinition: definition.join(' | ') };
    }
    const ids = strongsTokens(row.strongsId);
    if (!ids.length) return [row];
    const transliteration = row.strongsId.match(/^(.*?)\s*[-–—]\s*Strong['’]?s\s+/i)?.[1]?.trim();
    return ids.map(strongsId => ({ ...row, strongsId,
      surfaceText: transliteration ? `${row.surfaceText} · ${transliteration}` : row.surfaceText }));
  });
}
export const serializeStudies = (rows: StudyEntry[]) => rows.length ? JSON.stringify(rows.map((row, sortOrder) => ({
  // Keep daily-content reader field names backward compatible.
  word: row.surfaceText, strongs: row.strongsId, definition: row.customDefinition, sortOrder,
}))) : '';

export function validPassage(book: string, chapter: string | number, start: string | number, end?: string | number | null) {
  const count = BIBLE_BOOK_CHAPTERS[canonicalBook(book) as keyof typeof BIBLE_BOOK_CHAPTERS];
  return !!count && Number.isInteger(Number(chapter)) && Number(chapter) >= 1 && Number(chapter) <= count &&
    Number.isInteger(Number(start)) && Number(start) >= 1 &&
    (!end || (Number.isInteger(Number(end)) && Number(end) >= Number(start)));
}

export function studyFieldErrors(row: StudyEntry) {
  const id = row.strongsId.trim().toUpperCase();
  if (isEmptyStudy(row)) return { surfaceText: '', strongsId: '', customDefinition: '' };
  return {
    surfaceText: row.surfaceText.trim() ? '' : 'Enter the word or surface text.',
    strongsId: id && !strongsTokens(id).length ? 'Use a valid Strong’s ID, for example H7503 or G11, or leave this field empty.' : '',
    customDefinition: row.customDefinition.trim() ? '' : 'Enter the definition or contextual meaning.',
  };
}

export function collectionError(studies: StudyEntry[], references: ReferenceEntry[]) {
  for (const [index, row] of studies.entries()) {
    const error = Object.values(studyFieldErrors(row)).find(Boolean);
    if (error) return `Word study ${index + 1}: ${error}`;
  }
  const invalid = references.map(referenceError).find(Boolean);
  if (invalid) return invalid;
  return '';
}

/** Like studyFieldErrors, but a row that was added must be fully filled. */
export function requiredStudyFieldErrors(row: StudyEntry) {
  const errors = studyFieldErrors(row);
  return {
    surfaceText: row.surfaceText.trim() ? '' : 'Enter the word or surface text.',
    strongsId: errors.strongsId || (row.strongsId.trim() ? '' : 'Enter the Strong’s ID, for example H7503.'),
    customDefinition: row.customDefinition.trim() ? '' : 'Enter the definition or contextual meaning.',
  };
}

/** Like referenceError, but an added row cannot be left blank. */
export function requiredReferenceError(row: ReferenceEntry, index: number) {
  if (isEmptyReference(row)) {
    return `Cross reference ${index + 1}: select a book, chapter and verse, and include the quoted passage.`;
  }
  const error = referenceError(row, index);
  if (error) return error;
  return row.referenceText.trim()
    ? ''
    : `Cross reference ${index + 1}: include the quoted passage.`;
}
