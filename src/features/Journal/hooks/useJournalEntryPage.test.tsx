import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useJournalEntryPage } from "./useJournalEntryPage";

const mocks = vi.hoisted(() => ({ post: vi.fn(), toast: vi.fn(), entryId: "new", user: { id: "reader" }, params: new URLSearchParams() }));
vi.mock("react-router-dom", () => ({ useNavigate: () => vi.fn(), useParams: () => ({ entryId: mocks.entryId }), useSearchParams: () => [mocks.params] }));
vi.mock("@/services/api", () => ({ sendPostRequest: mocks.post }));
vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => ({ userInfo: mocks.user }) }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: mocks.toast }) }));
vi.mock("@/components/languages/languageProvider", () => ({ useLanguage: () => ({ t: {}, isRtl: false }) }));
vi.mock("@/components/languages/hardcodedTranslate", () => ({ tt: (v: string) => v }));
vi.mock("@/utilities/bibleUtils", () => ({ getBooksByTestament: () => [], getChaptersForBook: () => [], getVerseText: () => "", getVersesCountForChapter: () => 0 }));

describe("Journal editor privacy and drafts", () => {
  beforeEach(() => { vi.clearAllMocks(); sessionStorage.clear(); mocks.entryId = "new"; mocks.params = new URLSearchParams(); mocks.post.mockResolvedValue({ returnCode: 200, returnData: [] }); });

  it("starts private and only restores the current account's draft", async () => {
    sessionStorage.setItem("journal-draft:someone-else:new", JSON.stringify({ content: "Other private writing" }));
    const first = renderHook(useJournalEntryPage);
    expect(first.result.current.data.entry.isPublished).toBe(false);
    expect(first.result.current.data.entry.content).toBe("");
    first.unmount();
    sessionStorage.setItem("journal-draft:reader:new", JSON.stringify({ content: "My writing", observations: "Notice" }));
    const { result } = renderHook(useJournalEntryPage);
    expect(result.current.data.entry.content).toBe("My writing");
    expect(result.current.data.entry.observations).toBe("Notice");
    await act(async () => {});
  });

  it("loads original text for editing and preserves private visibility", async () => {
    mocks.entryId = "7";
    mocks.post.mockImplementation(async (_module, action) => ({ returnCode: 200, returnData: action === "get" ? { title: "Original", content: "Untranslated", observations: "Notes", isPublished: false } : [] }));
    const { result } = renderHook(useJournalEntryPage);
    await waitFor(() => expect(result.current.data.loading).toBe(false));
    expect(mocks.post).toHaveBeenCalledWith("journal", "get", { id: "7", raw: true });
    expect(result.current.data.entry.content).toBe("Untranslated");
    expect(result.current.data.entry.isPrivate).toBe(true);
  });

  it("removes a saved draft after successfully saving a private entry", async () => {
    sessionStorage.setItem("journal-draft:reader:new", JSON.stringify({ content: "Reflection", observations: "Observe" }));
    const { result } = renderHook(useJournalEntryPage);
    await act(async () => result.current.actions.handleSave());
    expect(mocks.post).toHaveBeenCalledWith("journal", "create", expect.objectContaining({ content: "Reflection", observations: "Observe", isPublished: false }));
    expect(sessionStorage.getItem("journal-draft:reader:new")).toBeNull();
  });
});
