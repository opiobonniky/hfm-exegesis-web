import { sendPostRequest } from "@/services/api";

export interface ShareableJournal {
  id: number;
  title?: string | null;
  content?: string | null;
  observations?: string | null;
  gratitude?: string | null;
  learnings?: string | null;
  application?: string | null;
  prayers?: string | null;
  tags?: string | null;
  bookName?: string | null;
  chapter?: number | null;
  verseNumber?: number | null;
}

export function journalShareText(entries: ShareableJournal[]) {
  return entries.map(e => [e.title, e.bookName ? `${e.bookName} ${e.chapter ?? ""}${e.verseNumber != null ? `:${e.verseNumber}` : ""}` : "", e.content,
    e.observations && `Observations: ${e.observations}`, e.gratitude && `Gratitude: ${e.gratitude}`, e.learnings && `Learnings: ${e.learnings}`,
    e.application && `Application: ${e.application}`, e.prayers && `Prayer requests: ${e.prayers}`, e.tags && `Tags: ${e.tags}`,
  ].filter(Boolean).join("\n\n")).join("\n\n──────────\n\n");
}

export async function shareJournalEntries(entries: ShareableJournal[]): Promise<"shared" | "copied" | "cancelled"> {
  if (!entries.length) throw new Error("Select at least one entry");
  const text = journalShareText(entries);
  if (navigator.share) {
    try { await navigator.share({ title: entries.length === 1 ? entries[0].title || "Journal" : "Journal", text }); return "shared"; }
    catch (error) { if (error instanceof DOMException && error.name === "AbortError") return "cancelled"; throw error; }
  }
  if (!navigator.clipboard?.writeText) throw new Error("Sharing is not supported in this browser");
  await navigator.clipboard.writeText(text); return "copied";
}

export async function downloadJournalPdf(ids: number[]) {
  if (!ids.length) throw new Error("Select at least one entry");
  const res = await sendPostRequest("ledger", "export-all", { ids, format: "pdf" });
  if (res.returnCode !== 200 || !res.returnData?.content) throw new Error(res.returnMessage || "Export failed");
  const bytes = Uint8Array.from(atob(res.returnData.content), c => c.charCodeAt(0));
  const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
  const link = document.createElement("a"); link.href = url; link.download = res.returnData.filename || "journal.pdf";
  document.body.appendChild(link); link.click(); link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
