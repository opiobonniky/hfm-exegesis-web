import { describe, expect, it, vi } from "vitest";
import { getLanguageOptionLabel } from "./localeUtils";

describe("getLanguageOptionLabel", () => {
  it("adds the language name in the active language", () => {
    const label = getLanguageOptionLabel("de", "fr");

    expect(label).toContain("Deutsch");
    expect(label.toLocaleLowerCase("fr")).toContain("allemand");
  });

  it("does not repeat an identical native and localized name", () => {
    expect(getLanguageOptionLabel("fr", "fr")).toBe("Français");
  });

  it("uses only the native name when localized names are unavailable", () => {
    const displayNames = vi
      .spyOn(Intl, "DisplayNames")
      .mockImplementation(() => {
        throw new Error("unsupported");
      });

    try {
      expect(getLanguageOptionLabel("de", "fr")).toBe("Deutsch");
    } finally {
      displayNames.mockRestore();
    }
  });
});
