/**
 * Free Bible translation IDs grouped by language code.
 *
 * When the user selects a language in the app/web, only Bible translations
 * matching that language are shown in the picker.
 */

export const FREE_BIBLE_IDS_BY_LANGUAGE: Record<string, string[]> = {
  en: ["Berean", "BSB", "KJV", "NIV", "ESV", "WEB", "GW", "ASV", "YLT"],
  es: ["SpanishRVR1960"],
  fr: ["French"],
  ar: ["ArabicSVD"],
  de: ["GermanLuther1912"],
  pt: ["PortugueseARC"],
  hi: ["HindiIRV"],
  bn: ["BengaliBSI"],
  ur: ["UrduURD"],
  sw: ["SwahiliSUV"],
  it: ["ItalianRiveduta"],
  el: ["GreekModern1904"],
  ru: ["RussianSynodal"],
  fil: ["Tagalog"],
  ta: ["Tamil2017"],
  te: ["Telugu2019"],
  mr: ["MarathiIRVMAR"],
  gu: ["Gujarati2017"],
  kn: ["KannadaIRV"],
  ml: ["MalayalamBCS"],
  pa: ["PunjabiIRV"],
  ne: ["Nepali2012"],
};

/**
 * Get free Bible IDs for a specific language code.
 * Falls back to English if the language has no mapped translations.
 */
export function getFreeBibleIdsForLanguage(langCode: string): string[] {
  return FREE_BIBLE_IDS_BY_LANGUAGE[langCode] || FREE_BIBLE_IDS_BY_LANGUAGE.en;
}
