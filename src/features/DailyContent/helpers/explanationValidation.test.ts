import { describe, expect, it } from "vitest";
import type { ExplanationForm } from "../types";
import {
  getExplanationFieldErrors,
  getExplanationStepErrors,
  hasExplanationErrors,
} from "./explanationValidation";

const completeForm: ExplanationForm = {
  bookName: "John",
  chapter: "3",
  verseNumber: "16",
  verseEnd: "",
  bibleVersion: "BSB",
  exegesis: {
    explanationText: "A full explanation with enough detail to publish.",
    applicationText: "Apply this truth daily.",
  },
  studyMetadata: {
    introduction: "Intro",
    backgroundAuthor: "Author",
    backgroundBook: "Book",
    backgroundContext: "Context",
    finalThoughts: "Final thoughts",
    takeaways: ["Remember this"],
  },
  wordStudies: [],
  practicalApps: [],
  crossReferences: [],
  themes: [],
};

describe("getExplanationFieldErrors", () => {
  it("flags every empty field", () => {
    const errors = getExplanationFieldErrors({
      ...completeForm,
      bibleVersion: "",
      exegesis: { explanationText: "", applicationText: "" },
      studyMetadata: {
        introduction: "",
        backgroundAuthor: "",
        backgroundBook: "",
        backgroundContext: "",
        finalThoughts: "",
        takeaways: [],
      },
    });
    expect(hasExplanationErrors(errors)).toBe(true);
    expect(errors.bibleVersion).toBeTruthy();
    expect(errors.explanationText).toContain("20 characters");
    expect(errors.applicationText).toBeTruthy();
    expect(errors.introduction).toBeTruthy();
    expect(errors.backgroundAuthor).toBeTruthy();
    expect(errors.backgroundBook).toBeTruthy();
    expect(errors.backgroundContext).toBeTruthy();
    expect(errors.finalThoughts).toBeTruthy();
    expect(getExplanationStepErrors(errors).learnMore).toBeTruthy();
  });

  it("accepts a fully filled form with no added rows", () => {
    const errors = getExplanationFieldErrors(completeForm);
    expect(hasExplanationErrors(errors)).toBe(false);
    expect(getExplanationStepErrors(errors).learnMore).toBe("");
  });

  it("requires each added row to be filled", () => {
    const errors = getExplanationFieldErrors({
      ...completeForm,
      wordStudies: [{ strongsId: "", surfaceText: "", customDefinition: "", sortOrder: 0 }],
      practicalApps: [{ applicationText: "", sortOrder: 0 }],
      crossReferences: [{ bookName: "", chapter: 0, verseNumber: 0, referenceText: "", commentary: "", sortOrder: 0 }],
      themes: [{ themeName: "", sortOrder: 0 }],
      studyMetadata: { ...completeForm.studyMetadata, takeaways: [""] },
    });
    expect(errors.wordStudies[0]).toContain("Word study 1");
    expect(errors.practicalApps[0]).toContain("Application 1");
    expect(errors.crossReferences[0]).toContain("Cross reference 1");
    expect(errors.themes[0]).toContain("Theme 1");
    expect(errors.takeaways[0]).toContain("Takeaway 1");
    expect(hasExplanationErrors(errors)).toBe(true);
  });

  it("accepts complete added rows and respects the saved-content grace", () => {
    const errors = getExplanationFieldErrors({
      ...completeForm,
      wordStudies: [{ strongsId: "H3045", surfaceText: "Know", customDefinition: "Know intimately", sortOrder: 0 }],
      practicalApps: [{ applicationText: "Pray", sortOrder: 0 }],
      crossReferences: [{ bookName: "Romans", chapter: 5, verseNumber: 1, referenceText: "Quoted text", commentary: "", sortOrder: 0 }],
      themes: [{ themeName: "Trust", sortOrder: 0 }],
    });
    expect(hasExplanationErrors(errors)).toBe(false);

    const legacy = getExplanationFieldErrors({
      ...completeForm,
      wordStudies: [{ strongsId: "", surfaceText: "", customDefinition: "", sortOrder: 0 }],
      crossReferences: [{ bookName: "", chapter: 0, verseNumber: 0, referenceText: "", commentary: "", sortOrder: 0 }],
    }, { hideRichContent: true });
    expect(hasExplanationErrors(legacy)).toBe(false);
  });
});
