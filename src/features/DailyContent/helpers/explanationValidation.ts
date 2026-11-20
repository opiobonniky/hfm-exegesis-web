// Validation for the verse explanation editor. Every visible field must be
// filled; rows that were added with "Add" must be complete too.
import type { ExplanationForm, VerseExplanationStepId } from "../types";
import {
  requiredReferenceError,
  requiredStudyFieldErrors,
  validPassage,
} from "./editorContent";

export interface ExplanationFieldErrors {
  reference: string;
  bibleVersion: string;
  explanationText: string;
  applicationText: string;
  introduction: string;
  backgroundAuthor: string;
  backgroundBook: string;
  backgroundContext: string;
  finalThoughts: string;
  wordStudies: string[];
  practicalApps: string[];
  crossReferences: string[];
  themes: string[];
  takeaways: string[];
}

const filled = (value: unknown) => !!String(value ?? "").trim();

const rowError = (message: string, label: string, index: number) =>
  message ? `${label} ${index + 1}: ${message}` : "";

export function getExplanationFieldErrors(
  form: ExplanationForm,
  // Saved rich content is only re-flagged once the editor changes it.
  { hideRichContent = false }: { hideRichContent?: boolean } = {},
): ExplanationFieldErrors {
  return {
    reference: validPassage(
      form.bookName,
      form.chapter,
      form.verseNumber,
      form.verseEnd,
    )
      ? ""
      : "Select a book, chapter and verse.",
    bibleVersion: filled(form.bibleVersion)
      ? ""
      : "Select a Bible version.",
    explanationText:
      form.exegesis.explanationText.trim().length >= 20
        ? ""
        : "Enter at least 20 characters for the explanation.",
    applicationText: filled(form.exegesis.applicationText)
      ? ""
      : "Enter an application.",
    introduction: filled(form.studyMetadata.introduction)
      ? ""
      : "Enter a verse introduction.",
    backgroundAuthor: filled(form.studyMetadata.backgroundAuthor)
      ? ""
      : "Enter the background author.",
    backgroundBook: filled(form.studyMetadata.backgroundBook)
      ? ""
      : "Enter the background book.",
    backgroundContext: filled(form.studyMetadata.backgroundContext)
      ? ""
      : "Enter the background context.",
    finalThoughts: filled(form.studyMetadata.finalThoughts)
      ? ""
      : "Enter the final thoughts.",
    wordStudies: form.wordStudies.map((row, index) => {
      if (hideRichContent) return "";
      const message = Object.values(requiredStudyFieldErrors(row)).find(Boolean);
      return rowError(message || "", "Word study", index);
    }),
    practicalApps: form.practicalApps.map((row, index) =>
      filled(row.applicationText)
        ? ""
        : `Application ${index + 1}: enter the application or remove the row.`,
    ),
    crossReferences: form.crossReferences.map((row, index) =>
      hideRichContent ? "" : requiredReferenceError(row, index),
    ),
    themes: form.themes.map((row, index) =>
      filled(row.themeName)
        ? ""
        : `Theme ${index + 1}: enter the theme or remove the row.`,
    ),
    takeaways: form.studyMetadata.takeaways.map((item, index) =>
      filled(item)
        ? ""
        : `Takeaway ${index + 1}: enter the takeaway or remove the row.`,
    ),
  };
}

export const hasArrayErrors = (errors: string[]) => errors.some(Boolean);

export function hasExplanationErrors(errors: ExplanationFieldErrors) {
  return (
    [
      errors.reference,
      errors.bibleVersion,
      errors.explanationText,
      errors.applicationText,
      errors.introduction,
      errors.backgroundAuthor,
      errors.backgroundBook,
      errors.backgroundContext,
      errors.finalThoughts,
    ].some(Boolean) ||
    [
      errors.wordStudies,
      errors.practicalApps,
      errors.crossReferences,
      errors.themes,
      errors.takeaways,
    ].some(hasArrayErrors)
  );
}

export function getExplanationStepErrors(
  errors: ExplanationFieldErrors,
): Record<VerseExplanationStepId, string> {
  return {
    reference: errors.reference || errors.bibleVersion,
    exegesis: errors.explanationText || errors.applicationText,
    learnMore:
      errors.introduction ||
      errors.backgroundAuthor ||
      errors.backgroundBook ||
      errors.backgroundContext ||
      errors.wordStudies.find(Boolean) ||
      errors.practicalApps.find(Boolean) ||
      errors.themes.find(Boolean) ||
      errors.crossReferences.find(Boolean) ||
      errors.finalThoughts ||
      errors.takeaways.find(Boolean) ||
      "",
  };
}
