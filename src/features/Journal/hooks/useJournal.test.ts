// Journal useJournal.test — useJournal.test state and API logic
import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act, mockSendPostRequest, createMockResponse, createMockError, resetMocks } from "@/test/test-utils";

// Must import after mocks are set up
const { useJournal } = await import("./useJournal");
describe("useJournal", () => {
  beforeEach(() => {
    resetMocks();
    mockSendPostRequest.mockResolvedValue(createMockResponse({ entries: [], totalEntries: 0 }));
  });
  // ── Initialization ────────────────────────────────────────────────────────
  describe("initialization", () => {
    it("starts with loading true and empty entries", () => {
      const { result } = renderHook(() => useJournal());
      expect(result.current.loading).toBe(true);
      expect(result.current.entries).toEqual([]);
    });
    it("fetches entries on mount", async () => {
      await act(async () => {
        await new Promise(r => setTimeout(r, 0));
      });
      expect(mockSendPostRequest).toHaveBeenCalledWith("journal", "get-all", expect.objectContaining({ page: 0, pageSize: 20 }));
    it("fetches templates on mount", async () => {
      mockSendPostRequest
        .mockResolvedValueOnce(createMockResponse({ entries: [] }))
        .mockResolvedValueOnce(createMockResponse([{ id: "1", name: "Test Template" }]));
      expect(result.current.templates).toEqual([{ id: "1", name: "Test Template" }]);
  // ── Data fetching ─────────────────────────────────────────────────────────
  describe("fetchEntries", () => {
    it("populates entries from API response", async () => {
      const mockEntries = [
        { id: "1", title: "Journal Entry 1", content: "Content 1", createdOn: "2024-01-01" },
        { id: "2", title: "Journal Entry 2", content: "Content 2", createdOn: "2024-01-02" },
      ];
      mockSendPostRequest.mockResolvedValue(createMockResponse({ entries: mockEntries }));
      expect(result.current.entries).toHaveLength(2);
      expect(result.current.entries[0].title).toBe("Journal Entry 1");
      expect(result.current.loading).toBe(false);
    it("handles empty response gracefully", async () => {
      mockSendPostRequest.mockResolvedValue(createMockResponse({ entries: [] }));
    it("handles API error without crashing", async () => {
      mockSendPostRequest.mockRejectedValue(new Error("Network error"));
  // ── Filtering ─────────────────────────────────────────────────────────────
  describe("filtering", () => {
    it("sends search query in request", async () => {
        result.current.setSearchQuery("prayer");
      expect(mockSendPostRequest).toHaveBeenCalledWith(
        "journal", "get-all",
        expect.objectContaining({ search: "prayer" })
      );
    it("sends mood filter in request", async () => {
        result.current.setSelectedMood("grateful");
        expect.objectContaining({ mood: "grateful" })
    it("does not send mood when set to 'all'", async () => {
        result.current.setSelectedMood("all");
        expect.not.objectContaining({ mood: "all" })
  // ── Pagination ────────────────────────────────────────────────────────────
  describe("pagination", () => {
    it("sends page number in request", async () => {
        result.current.setPage(2);
        expect.objectContaining({ page: 2 })
  // ── CRUD operations ──────────────────────────────────────────────────────
  describe("createEntry", () => {
    it("calls create API and refreshes list", async () => {
      mockSendPostRequest.mockResolvedValue(createMockResponse({}));
        await result.current.createEntry({ title: "New Entry", content: "Hello" });
      expect(mockSendPostRequest).toHaveBeenCalledWith("journal", "create", { title: "New Entry", content: "Hello" });
      // Should refresh after creation (initial fetch + templates + create + refresh)
      expect(mockSendPostRequest.mock.calls.length).toBeGreaterThanOrEqual(3);
  describe("deleteEntry", () => {
    it("calls delete API and removes entry from state", async () => {
      mockSendPostRequest.mockResolvedValueOnce(createMockResponse({ entries: [{ id: "1", title: "Entry 1" }] }));
      expect(result.current.entries).toHaveLength(1);
      mockSendPostRequest.mockResolvedValueOnce(createMockResponse({}));
        await result.current.deleteEntry("1");
      expect(result.current.entries).toHaveLength(0);
      expect(mockSendPostRequest).toHaveBeenCalledWith("journal", "delete", { entryId: "1" });
  // ── Refresh ───────────────────────────────────────────────────────────────
  describe("refresh", () => {
    it("re-fetches data when refresh is called", async () => {
      const callCount = mockSendPostRequest.mock.calls.length;
        result.current.refresh();
      expect(mockSendPostRequest.mock.calls.length).toBeGreaterThan(callCount);
});
