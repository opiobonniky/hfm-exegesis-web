import { describe, expect, it } from "vitest";
import { filterBibleTranslationsByLanguage } from "./freeBibleTranslations";

describe("Bible picker language filtering", () => {
  const catalog = [
    { id: "KJV", language: "en" },
    { id: "Berean", language: "en" },
    { id: "French", language: "fr" },
    { id: "Arabic", language: "ar" },
    { id: "Tagalog", language: "tl" },
  ];

  it.each([
    ["en", ["KJV", "Berean"]],
    ["fr", ["French"]],
    ["ar", ["Arabic"]],
    ["fil", ["Tagalog"]],
    ["vi", []],
  ])("shows only editions matching %s", (language, expected) => {
    expect(filterBibleTranslationsByLanguage(catalog, language).map(t => t.id)).toEqual(expected);
  });

  it("uses metadata for editions absent from the static list", () => {
    expect(filterBibleTranslationsByLanguage([{ id: "Telugu", language: "te" }], "te"))
      .toEqual([{ id: "Telugu", language: "te" }]);
  });

  it("supports legacy options without language metadata", () => {
    expect(filterBibleTranslationsByLanguage([{ id: "KJV" }, { id: "French" }], "fr"))
      .toEqual([{ id: "French" }]);
  });
});
