// bookProloguesApi — admin service for fetching and persisting book prologues
// for the single-page add/edit editor.
import { sendPostRequest } from "@/services/api";
import type { KeyScriptureEntry, PrologueEditorForm } from "../types";

export interface PrologueApiPayload {
  bookName: string;
  title: string;
  content: string;
  author: string;
  authorDetail: string;
  audience: string;
  dateWritten: string;
  locationWritten: string;
  purpose: string;
  keyTheme: string;
  summary: string;
  background: string;
  lessons: string;
  chapters: number | null;
  christConnection: string;
  applications: string[];
  keyScripture: {
    bookName: string;
    chapter: number | null;
    verse: number | null;
    translation: string;
    reference: string;
    text: string;
  }[];
  mainThemes: string[];
  keyPeople: string[];
  keyVerses: string[];
  isPublished: boolean;
}

export interface PrologueReadModel {
  bookName: string;
  title?: string;
  content?: string;
  author?: string;
  authorDetail?: string;
  audience?: string;
  dateWritten?: string;
  locationWritten?: string;
  purpose?: string;
  keyTheme?: string;
  summary?: string;
  background?: string;
  lessons?: string;
  chapters?: number;
  christConnection?: string;
  applications?: string[];
  keyScripture?: {
    bookName?: string;
    chapter?: number | null;
    verse?: number | null;
    translation?: string;
    reference?: string;
    text?: string;
  }[];
  mainThemes?: string[];
  keyPeople?: string[];
  keyVerses?: string[];
  isPublished?: boolean;
}

const coerceKeyScripture = (ks?: PrologueReadModel["keyScripture"]): KeyScriptureEntry[] =>
  (ks || []).map((s) => ({
    bookName: s?.bookName || "",
    chapter: s?.chapter ?? null,
    verse: s?.verse ?? null,
    translation: s?.translation || "",
    reference: s?.reference || "",
    text: s?.text || "",
  }));

/** Build the editor form from a read model (mapping keyScripture + content). */
export const prologueToForm = (d: PrologueReadModel | null): PrologueEditorForm | null => {
  if (!d) return null;
  return {
    bookName: d.bookName || "",
    title: d.title || "",
    content: (d as PrologueReadModel).content || d.summary || "",
    author: d.author || "",
    authorDetail: d.authorDetail || "",
    audience: d.audience || "",
    dateWritten: d.dateWritten || "",
    locationWritten: d.locationWritten || "",
    purpose: d.purpose || "",
    keyTheme: d.keyTheme || "",
    summary: d.summary || "",
    background: d.background || "",
    lessons: d.lessons || "",
    chapters: d.chapters ? String(d.chapters) : "",
    christConnection: d.christConnection || "",
    applications: d.applications || [],
    keyScriptures: coerceKeyScripture(d.keyScripture),
    mainThemes: d.mainThemes || [],
    keyPeople: d.keyPeople || [],
    keyVerses: d.keyVerses || [],
    isPublished: d.isPublished ?? true,
  };
};

/** Load a single prologue for prefilling the editor (used in edit mode). */
export const fetchBookPrologue = async (
  bookName: string,
): Promise<PrologueEditorForm | null> => {
  const res = await sendPostRequest<PrologueReadModel>(
    "book-prologues",
    "get",
    { bookName },
  );
  if (res.returnCode !== 200 || !res.returnData) return null;
  return prologueToForm(res.returnData);
};

/** Build the upsert payload from the editor form, mapping array fields. */
export const buildProloguePayload = (
  form: PrologueEditorForm,
): PrologueApiPayload => {
  const keyScripture = form.keyScriptures
    .map((s) => ({
      bookName: s.bookName.trim(),
      chapter: s.chapter,
      verse: s.verse,
      translation: s.translation.trim(),
      reference: (s.reference || "").trim(),
      text: (s.text || "").trim(),
    }))
    .filter((s) => s.bookName && s.text);
  return {
    bookName: form.bookName,
    title: form.title,
    content: form.content,
    author: form.author,
    authorDetail: form.authorDetail,
    audience: form.audience,
    dateWritten: form.dateWritten,
    locationWritten: form.locationWritten,
    purpose: form.purpose,
    keyTheme: form.keyTheme,
    summary: form.summary,
    background: form.background,
    lessons: form.lessons,
    chapters: form.chapters ? parseInt(form.chapters, 10) : null,
    christConnection: form.christConnection,
    applications: form.applications.filter(Boolean),
    keyScripture,
    mainThemes: form.mainThemes.filter(Boolean),
    keyPeople: form.keyPeople.filter(Boolean),
    keyVerses: form.keyVerses.filter(Boolean),
    isPublished: form.isPublished,
  };
};

/** Persist the prologue (upsert — create or update). */
export const upsertBookPrologue = async (
  form: PrologueEditorForm,
): Promise<{ ok: boolean; message?: string }> => {
  const payload = buildProloguePayload(form);
  const res = await sendPostRequest<unknown>(
    "book-prologues",
    "admin/upsert",
    payload,
  );
  if (res.returnCode === 200 || res.status === 200) return { ok: true };
  return { ok: false, message: res.returnMessage || "Failed to save" };
};
