// ─── Strongs Dictionary Types ─────────────────────────────────────────────────

export interface StrongWord {
  strongsId: string;
  originalWord: string;
  transliteration: string;
  shortDefinition: string;
  fullDefinition: string;
  partOfSpeech: string;
  language: string;
  occurrences: number;
}
