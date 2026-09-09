import { sendPostRequest } from "@/services/api";
import type { JournalDetailEntry } from "../types";

export const getJournalEntry = (id: string | undefined) =>
  sendPostRequest<JournalDetailEntry>("journal", "get", { id });

export const toggleJournalFavorite = (id: number) =>
  sendPostRequest("journal", "toggle-favorite", { id });

export const deleteJournalEntry = (id: number) =>
  sendPostRequest("journal", "delete", { id });

export const exportJournalEntry = (id: number) =>
  sendPostRequest("journal", "export-one", { id, format: "pdf" });
