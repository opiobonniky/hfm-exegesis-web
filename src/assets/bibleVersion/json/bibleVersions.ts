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
  /** Lazy-require function – keeps only the active version in memory */
  load: () => Record<string, string>;
}

/**
 * All bundled free versions.
 *
 * Lazy `require()` calls ensure React Native's Metro bundler includes each
 * JSON in the bundle but only parses/holds the selected version in JS memory.
 */
export const BIBLE_VERSIONS: BibleVersion[] = [
  {
    id: 'KJV',
    name: 'King James Version',
    abbreviation: 'KJV',
    description: 'The classic 1769 authorised English translation.',
    year: 1769,
    load: () => require('../json/verses-kjv.json'),
  },
  {
    id: 'WEB',
    name: 'World English Bible',
    abbreviation: 'WEB',
    description: 'A modern public-domain translation in contemporary English.',
    year: 2000,
    load: () => require('../json/verses-web.json'),
  },
  {
    id: 'ASV',
    name: 'American Standard Version',
    abbreviation: 'ASV',
    description: 'The 1901 American revision of the KJV.',
    year: 1901,
    load: () => require('../json/verses-asv.json'),
  },
  {
    id: 'BBE',
    name: 'Bible in Basic English',
    abbreviation: 'BBE',
    description: 'Uses a vocabulary of ~1 000 common words for clarity.',
    year: 1949,
    load: () => require('../json/verses-bbe.json'),
  },
  {
    id: 'YLT',
    name: "Young's Literal Translation",
    abbreviation: 'YLT',
    description: "Robert Young's highly literal 1862 word-for-word translation.",
    year: 1862,
    load: () => require('../json/verses-ylt.json'),
  },
];

/** Default version id used on first launch */
export const DEFAULT_VERSION_ID = 'KJV';

/** Look up a version by id (falls back to KJV if unknown) */
export const getVersionById = (id: string): BibleVersion =>
  BIBLE_VERSIONS.find(v => v.id === id) ??
  BIBLE_VERSIONS.find(v => v.id === DEFAULT_VERSION_ID)!;