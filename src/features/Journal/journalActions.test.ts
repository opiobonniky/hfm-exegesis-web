import { afterEach, describe, expect, it, vi } from "vitest";
import { downloadJournalPdf, journalShareText, shareJournalEntries } from "./journalActions";
import { sendPostRequest } from "@/services/api";
vi.mock("@/services/api", () => ({ sendPostRequest: vi.fn() }));
afterEach(() => { vi.restoreAllMocks(); });
describe("Journal export and sharing", () => {
  it("includes every rich reflection field in shared text", () => {
    const text = journalShareText([{ id: 1, title: "Hope", content: "Reflection", observations: "Observe", gratitude: "Thanks", learnings: "Learn", application: "Act", prayers: "Pray", tags: "hope", bookName: "Romans", chapter: 8, verseNumber: 28 }]);
    for (const field of ["Hope", "Reflection", "Observe", "Thanks", "Learn", "Act", "Pray", "hope", "Romans 8:28"]) expect(text).toContain(field);
  });
  it("never exports the whole archive for an empty selection", async () => {
    vi.mocked(sendPostRequest).mockClear(); await expect(downloadJournalPdf([])).rejects.toThrow("Select"); expect(sendPostRequest).not.toHaveBeenCalled();
  });
  it("uses a clipboard fallback without publishing the entry", async () => {
    const share = Object.getOwnPropertyDescriptor(navigator, "share"), clipboard = Object.getOwnPropertyDescriptor(navigator, "clipboard");
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "share", { value: undefined, configurable: true }); Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    try { expect(await shareJournalEntries([{ id: 1, content: "Private prayer" }])).toBe("copied"); expect(writeText).toHaveBeenCalledWith("Private prayer"); }
    finally { if (share) Object.defineProperty(navigator, "share", share); else delete navigator.share; if (clipboard) Object.defineProperty(navigator, "clipboard", clipboard); else delete (navigator as unknown as Record<string, unknown>).clipboard; }
  });
});
