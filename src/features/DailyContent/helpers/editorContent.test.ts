import { describe, expect, it } from 'vitest';
import { parseReferences, serializeReferences, parseStudies, serializeStudies, validPassage, collectionError, nonEmptyReferences, parseTakeaways, studyFieldErrors, nonEmptyStudies } from './editorContent';
import { parseList, parseWordStudies } from './contentDetailHelpers';

describe('legacy daily content compatibility', () => {
  it.each(['G11', ' g11 ', '', 'H589/H430', 'G11, G12', 'H0853', 'H430a', 'H7503 (Hebrew)'])('accepts optional or valid IDs: %s', strongsId => {
    const row = { surfaceText: 'Word', strongsId, customDefinition: 'Contextual meaning' };
    expect(collectionError([row], [])).toBe('');
    expect(studyFieldErrors(row).strongsId).toBe('');
  });
  it('ignores blank optional rows and excludes them only from the saved payload', () => {
    const row = { surfaceText: ' ', strongsId: '', customDefinition: '' };
    expect(collectionError([row], [])).toBe('');
    expect(nonEmptyStudies([row])).toEqual([]);
    expect(parseStudies(serializeStudies([row]))).toEqual([row]);
  });
  it('identifies only the actual invalid fields and the row', () => {
    const row = { surfaceText: 'Word', strongsId: 'G11', customDefinition: '' };
    expect(studyFieldErrors(row)).toEqual({ surfaceText: '', strongsId: '', customDefinition: 'Enter the definition or contextual meaning.' });
    expect(collectionError([row], [])).toBe('Word study 1: Enter the definition or contextual meaning.');
    expect(studyFieldErrors({ ...row, strongsId: 'no id here' }).strongsId).not.toBe('');
    expect(studyFieldErrors({ ...row, strongsId: 'no id here' }).surfaceText).toBe('');
  });
  it('ignores truly empty optional cross references, but identifies the exact incomplete row', () => {
    const rows = parseReferences([{ bookName: '', chapter: 0, verseNumber: 0, referenceText: '', commentary: '' }]);
    expect(collectionError([], rows)).toBe('');
    expect(nonEmptyReferences(rows)).toEqual([]);
    rows.push({ bookName: 'Genesis', chapter: 3, verseNumber: 0, referenceText: 'Preserve this text' });
    expect(collectionError([], rows)).toContain('Cross reference 2: select verse');
    expect(nonEmptyReferences(rows)).toHaveLength(1);
  });
  it('accepts legacy reference objects with verse aliases and embedded ranges', () => {
    const rows = parseReferences([{ bookName: 'Psalm', chapter: '46', verse: '1', text: 'Quote' }, { reference: 'Genesis 3:6-10', text: 'Range quote' }]);
    expect(collectionError([], rows)).toBe('');
    expect(rows[0]).toMatchObject({ bookName: 'Psalms', chapter: 46, verseNumber: 1 });
    expect(rows[1]).toMatchObject({ bookName: 'Genesis', chapter: 3, verseNumber: 6, verseEnd: 10 });
  });
  it('preserves JSON takeaway item boundaries and accepts legacy newline lists', () => {
    expect(parseTakeaways('["One\\nparagraph two","Another"]')).toEqual(['One\nparagraph two', 'Another']);
    expect(parseTakeaways('One\r\nTwo')).toEqual(['One', 'Two']);
  });
  it.each(['–', '—', '-'])('hydrates cross-reference selectors from %s separators', dash => {
    const rows = parseReferences(`Psalm 46:1 ${dash} God is our refuge.\nPsalm 37:7 ${dash} Rest in the LORD.\nExodus 14:14 ${dash} The LORD will fight for you.\nIsaiah 2:11 ${dash} The LORD alone shall be exalted.`);
    expect(rows[0]).toMatchObject({ bookName: 'Psalms', chapter: 46, verseNumber: 1, referenceText: 'God is our refuge.' });
    expect(rows[1]).toMatchObject({ bookName: 'Psalms', chapter: 37, verseNumber: 7 });
    expect(rows[2].bookName).toBe('Exodus');
    expect(rows[3].bookName).toBe('Isaiah');
    expect(parseReferences(serializeReferences(rows))).toEqual(rows);
  });
  it('parses ranges without mistaking their dash for the quotation separator', () => {
    expect(parseReferences('Genesis 3:6-10 – A quoted passage')[0]).toMatchObject({ bookName: 'Genesis', chapter: 3, verseNumber: 6, verseEnd: 10, referenceText: 'A quoted passage' });
    expect(parseReferences('Genesis 3:6–10')[0].verseEnd).toBe(10);
  });
  it('preserves multiline quotations, incomplete legacy text, and commentary', () => {
    const rows = [{ bookName: 'Genesis', chapter: 3, verseNumber: 6, verseEnd: 10, referenceText: 'First\nSecond', commentary: 'Keep commentary' }, { bookName: '', chapter: 0, verseNumber: 0, referenceText: 'Unparsed legacy text' }];
    expect(parseReferences(serializeReferences(rows))).toEqual(rows);
    expect(parseList(serializeReferences(rows))[0]).toContain('Genesis 3:6-10 — First\nSecond');
  });
  it('keeps all three word study columns and multiline definitions when reopening', () => {
    const studies = parseStudies('Be still | H7503 | Let go | further detail');
    expect(studies[0]).toEqual({ surfaceText: 'Be still', strongsId: 'H7503', customDefinition: 'Let go | further detail' });
    studies[0].customDefinition += '\nAnother paragraph';
    expect(parseStudies(serializeStudies(studies))).toEqual(studies);
    expect(parseWordStudies(serializeStudies(studies))[0].strongs).toBe('H7503');
    expect(parseStudies([{ surfaceText: 'Know', strongsId: 'H3045', customDefinition: 'Know intimately' }])[0].surfaceText).toBe('Know');
  });
  it('normalizes legacy transliterations and splits compound IDs without dropping definitions', () => {
    const rows = parseStudies("I am God | ʾănî ʾĕlōhîm – Strong's H589/H430 | The covenant God");
    expect(rows.map(row => row.strongsId)).toEqual(['H589', 'H430']);
    expect(rows.every(row => row.surfaceText.includes('ʾănî ʾĕlōhîm') && row.customDefinition === 'The covenant God')).toBe(true);
    expect(parseStudies(serializeStudies(rows))).toEqual(rows);
  });
  it.each([['Genesis', '3', '6', '10', true], ['Genesis', '', '6', '', false], ['', '3', '6', '', false], ['Genesis', '3', '10', '6', false], ['Genesis', '3', '6-10', '', false]])('validates %s %s:%s-%s', (book, chapter, start, end, valid) => {
    expect(validPassage(String(book), String(chapter), String(start), String(end))).toBe(valid);
  });
});
