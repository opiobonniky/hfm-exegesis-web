// Only authored UI copy goes here, never Scripture or user-entered text.
const dictionaries = new Map<string, Map<string, string>>();
export const installUiDictionary = (language: string, dictionary: Map<string, string>) => { dictionaries.set(language, dictionary); };
export const hasUiDictionary = (language: string) => dictionaries.has(language);
export const translateUiCopy = (text: string, language: string) => dictionaries.get(language)?.get(text) ?? text;
