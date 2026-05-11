/**
 * bibleVersions.ts
 *
 * Registry of free / public-domain Bible versions that can be bundled with
 * the app.  Each version ships as a JSON file whose keys follow the same
 * convention used by the existing KJV file:
 *
 *   "<Book> <chapter>:<verse>"  →  "<verse text>"
 *
 * --------------------------------------------------------------------
 * HOW TO ADD A NEW VERSION
 * --------------------------------------------------------------------
 * 1. Place its JSON file in  assets/bibleVersion/json/
 * 2. Add an entry to BIBLE_VERSIONS below.
 * 3. That's it – the rest of the app picks it up automatically.
 * --------------------------------------------------------------------
 */

// Static imports for all Bible versions (web version)
import versesBsb from '../json/verses-bsb.json';
import versesKjv from '../json/verses-kjv.json';
import versesWeb from '../json/verses-web.json';
import versesAsv from '../json/verses-asv.json';
import versesYlt from '../json/verses-ylt.json';
import versesDarby from '../json/verses-darby.json';
import versesWebster from '../json/verses-webster.json';
import versesBbe from '../json/verses-bbe.json';

export interface BibleVersion {
  /** Short identifier stored in AsyncStorage / state */
  id: string;
  /** Human-readable name shown in the UI */
  name: string;
  /** 1–4 letter abbreviation badge shown next to chapter/verse references */
  abbreviation: string;
  /** One-sentence description shown in the picker */
  description: string;
  /** Year of publication / translation */
  year: number;
  /** Data accessor – returns the verse data for this version */
  data: Record<string, string>|any;
}

/**
 * All bundled free versions, ordered by popularity.
 *
 * Static imports ensure all versions are available in the bundle.
 * The active version system in bibleUtils.ts manages memory usage.
 */
export const BIBLE_VERSIONS: BibleVersion[] = [
  // 1. BSB — default; fast-growing modern translation, highly accurate
  {
    id: 'BSB',
    name: 'Berean Standard Bible',
    abbreviation: 'BSB',
    description: 'A 2022 revision combining readability with accuracy (CC BY 4.0).',
    year: 2022,
    data: versesBsb,
  },
  // 2. KJV — most historically beloved and widely memorised English Bible
  {
    id: 'KJV',
    name: 'King James Version',
    abbreviation: 'KJV',
    description: 'The classic 1769 authorised English translation.',
    year: 1769,
    data: versesKjv,
  },
  // 3. WEB — modern public-domain translation for contemporary readers
  {
    id: 'WEB',
    name: 'World English Bible',
    abbreviation: 'WEB',
    description: 'A modern public-domain translation in contemporary English.',
    year: 2000,
    data: versesWeb,
  },
  // 4. ASV — respected scholarly revision, foundation for many later versions
  {
    id: 'ASV',
    name: 'American Standard Version',
    abbreviation: 'ASV',
    description: 'The 1901 American revision of the KJV.',
    year: 1901,
    data: versesAsv,
  },
  // 5. YLT — beloved by word-for-word study readers
  {
    id: 'YLT',
    name: "Young's Literal Translation",
    abbreviation: 'YLT',
    description: "Robert Young's highly literal 1862 word-for-word translation.",
    year: 1862,
    data: versesYlt,
  },
  // 6. DARBY — popular with Plymouth Brethren and prophecy/dispensation students
  {
    id: 'DARBY',
    name: 'Darby Translation',
    abbreviation: 'DBY',
    description: "J. N. Darby's precise 1890 literal translation from Hebrew and Greek.",
    year: 1890,
    data: versesDarby,
  },
  // 7. WEBSTER — Noah Webster's KJV revision with modernised vocabulary
  {
    id: 'WEBSTER',
    name: 'Webster Bible',
    abbreviation: 'WBS',
    description: "Noah Webster's 1833 revision of the KJV with modernised language.",
    year: 1833,
    data: versesWebster,
  },
  // 8. BBE — simple ~1 000-word vocabulary; great for new readers and ESL
  {
    id: 'BBE',
    name: 'Bible in Basic English',
    abbreviation: 'BBE',
    description: 'Uses a vocabulary of ~1 000 common words for clarity.',
    year: 1949,
    data: versesBbe,
  },
];

/** Default version id used on first launch */
export const DEFAULT_VERSION_ID = 'BSB';

/** Look up a version by id (falls back to BSB if unknown) */
export const getVersionById = (id: string): BibleVersion =>
  BIBLE_VERSIONS.find(v => v.id === id) ??
  BIBLE_VERSIONS.find(v => v.id === DEFAULT_VERSION_ID)!;