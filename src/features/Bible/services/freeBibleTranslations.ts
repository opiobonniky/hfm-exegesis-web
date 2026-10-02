/**
 * Free Bible translation IDs grouped by language code.
 *
 * When the user selects a language in the app/web, only Bible translations
 * matching that language are shown in the picker.
 */

export const FREE_BIBLE_IDS_BY_LANGUAGE: Record<string, string[]> = {
  en: ["Berean", "KJV", "NKJ", "ASV", "YLT", "Darby", "GW", "EASY", "TL"],
  es: ["Spanish"],
  fr: ["French"],
  ar: ["Arabic"],
  de: ["German"],
  pt: ["Portuguese"],
  hi: ["Hindi"],
  bn: ["Bengali"],
  ur: ["Urdu"],
  sw: ["Swahili"],
  it: ["Italian"],
  el: ["GreekModern1904"],
  ru: ["Russian"],
  fil: ["Tagalog"],
  ta: ["Tamil2017"],
  te: ["Telugu2019"],
  mr: ["MarathiIRVMAR"],
  gu: ["Gujarati2017"],
  kn: ["KannadaIRV"],
  ml: ["MalayalamBCS"],
  pa: ["PunjabiIRV"],
  ne: ["Nepali2012"],
  ja: ["Japanese"],
  ko: ["Korean"],
  zh: ["ChineseSimplified"],
  yo: ["Yoruba"],
  id: ["Indonesian"],
  pl: ["Polish"],
  ro: ["Romanian"],
  tl: ["Tagalog"],
  tr: ["Turkish"],
  uk: ["Ukrainian"],
  vi: ["Vietnamese"],
};

export const PREFERRED_BIBLE_BY_LANGUAGE: Record<string, string> =
  Object.fromEntries(
    Object.entries(FREE_BIBLE_IDS_BY_LANGUAGE).map(([language, ids]) => [
      language,
      ids[0],
    ]),
  );

export function getPreferredBibleId(langCode: string): string {
  return PREFERRED_BIBLE_BY_LANGUAGE[langCode] || PREFERRED_BIBLE_BY_LANGUAGE.en;
}

export function getBibleCatalogLanguage(langCode: string): string {
  return langCode === "fil" ? "tl" : langCode;
}

/**
 * Get free Bible IDs for a specific language code.
 * Falls back to English if the language has no mapped translations.
 */
export function getFreeBibleIdsForLanguage(langCode: string): string[] {
  return FREE_BIBLE_IDS_BY_LANGUAGE[langCode] || FREE_BIBLE_IDS_BY_LANGUAGE.en;
}
