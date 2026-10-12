import { describe, expect, it } from "vitest";
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
});
