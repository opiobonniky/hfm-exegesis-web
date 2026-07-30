/**
 * bibleVersions.ts
 *
 * Registry of free / public-domain Bible versions that can be bundled with
 * the app.  Each version ships as a JSON file whose keys follow the same
 * convention used by the existing KJV file:
 *
 *   "<Book> <chapter>:<verse>"  →  "<verse text>"
 *
 * IMPORTANT: Data is loaded lazily via getVersionData() so importing this
 * module does NOT block the main thread with 35MB of JSON parsing.
 * --------------------------------------------------------------------
 * HOW TO ADD A NEW VERSION
 * --------------------------------------------------------------------
 * 1. Place its JSON file in  assets/bibleVersion/json/
 * 2. Add an entry to BIBLE_VERSIONS below with a loader function.
 * 3. That's it – the rest of the app picks it up automatically.
 * --------------------------------------------------------------------
 */

// Lazy loaders — each version's data is imported only on first access
const lazyLoaders: Record<string, () => Promise<Record<string, string>>> = {
  BSB: () => import('../json/verses-bsb.json').then(m => m.default ?? m),
  KJV: () => import('../json/verses-kjv.json').then(m => m.default ?? m),
  WEB: () => import('../json/verses-web.json').then(m => m.default ?? m),
  ASV: () => import('../json/verses-asv.json').then(m => m.default ?? m),
  YLT: () => import('../json/verses-ylt.json').then(m => m.default ?? m),
  DARBY: () => import('../json/verses-darby.json').then(m => m.default ?? m),
  WEBSTER: () => import('../json/verses-webster.json').then(m => m.default ?? m),
  BBE: () => import('../json/verses-bbe.json').then(m => m.default ?? m),
};

// Synchronous cache populated on first access for each version
const dataCache: Record<string, Record<string, string>> = {};

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
  /**
   * Backward-compatible synchronous data accessor.
   * Returns the cached data if loaded, or undefined if not yet loaded.
   * @deprecated Use getData() for guaranteed async loading.
   */
  readonly data?: Record<string, string>;
  /** Lazy data accessor – loads the JSON on first call */
  getData(): Promise<Record<string, string>>;
}

/**
 * All bundled free versions, ordered by popularity.
 *
 * Each version has a `getData()` method that lazily loads the JSON
 * data on first call, avoiding 35MB of synchronous imports at startup.
 */
/** Create a BibleVersion with a lazy `data` getter for backward compatibility */
function makeVersion(
  fields: Omit<BibleVersion, 'data' | 'getData'> & { id: string },
): BibleVersion {
  return {
    ...fields,
    get data() {
      return dataCache[fields.id];
    },
    getData: () => loadVersionData(fields.id),
  };
}

export const BIBLE_VERSIONS: BibleVersion[] = [
  makeVersion({
    id: 'BSB',
    name: 'Berean Standard Bible',
    abbreviation: 'BSB',
    description: 'A 2022 revision combining readability with accuracy (CC BY 4.0).',
    year: 2022,
  }),
  makeVersion({
    id: 'KJV',
    name: 'King James Version',
    abbreviation: 'KJV',
    description: 'The classic 1769 authorised English translation.',
    year: 1769,
  }),
  makeVersion({
    id: 'WEB',
    name: 'World English Bible',
    abbreviation: 'WEB',
    description: 'A modern public-domain translation in contemporary English.',
    year: 2000,
  }),
  makeVersion({
    id: 'ASV',
    name: 'American Standard Version',
    abbreviation: 'ASV',
    description: 'The 1901 American revision of the KJV.',
    year: 1901,
  }),
  makeVersion({
    id: 'YLT',
    name: "Young's Literal Translation",
    abbreviation: 'YLT',
    description: "Robert Young's highly literal 1862 word-for-word translation.",
    year: 1862,
  }),
  makeVersion({
    id: 'DARBY',
    name: 'Darby Translation',
    abbreviation: 'DBY',
    description: "J. N. Darby's precise 1890 literal translation from Hebrew and Greek.",
    year: 1890,
  }),
  makeVersion({
    id: 'WEBSTER',
    name: 'Webster Bible',
    abbreviation: 'WBS',
    description: "Noah Webster's 1833 revision of the KJV with modernised language.",
    year: 1833,
  }),
  makeVersion({
    id: 'BBE',
    name: 'Bible in Basic English',
    abbreviation: 'BBE',
    description: 'Uses a vocabulary of ~1 000 common words for clarity.',
    year: 1949,
  }),
];

/** Default version id used on first launch */
export const DEFAULT_VERSION_ID = 'BSB';

/** Look up a version by id (falls back to BSB if unknown) */
export const getVersionById = (id: string): BibleVersion =>
  BIBLE_VERSIONS.find(v => v.id === id) ??
  BIBLE_VERSIONS.find(v => v.id === DEFAULT_VERSION_ID)!;

/**
 * Lazy load and cache a version's data.
 * Called automatically by getData() on each BibleVersion.
 */
async function loadVersionData(id: string): Promise<Record<string, string>> {
  if (dataCache[id]) return dataCache[id];
  const loader = lazyLoaders[id];
  if (!loader) throw new Error(`Unknown Bible version: ${id}`);
  const data = await loader();
  dataCache[id] = data;
  return data;
}

/**
 * Preload a version's data into the cache.
 * Call this early (e.g. in a splash screen or app init) to avoid
 * loading delay later.
 */
export const preloadVersion = async (id: string): Promise<void> => {
  await loadVersionData(id);
};
