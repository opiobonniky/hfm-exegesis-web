// Bible useBibleNavigation.test — useBibleNavigation.test state and API logic
import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act, mockSendPostRequest, createMockResponse, resetMocks } from "@/test/test-utils";

const { useBibleNavigation } = await import("./useBibleNavigation");
describe("useBibleNavigation", () => {
  beforeEach(() => {
    resetMocks();
  });
  // ── Initialization ────────────────────────────────────────────────────────
  describe("initialization", () => {
    it("starts with loading true and empty books", () => {
      const { result } = renderHook(() => useBibleNavigation());
      expect(result.current.loading).toBe(true);
      expect(result.current.books).toEqual([]);
      expect(result.current.selectedBook).toBeNull();
    });
    it("fetches books on mount", async () => {
      const mockBooks = [
        { id: "gen", name: "Genesis", testament: "Old", chapters: 50 },
        { id: "exo", name: "Exodus", testament: "Old", chapters: 40 },
      ];
      mockSendPostRequest.mockResolvedValue(createMockResponse(mockBooks));
      await act(async () => {
        await new Promise(r => setTimeout(r, 0));
      });
      expect(result.current.books).toHaveLength(2);
      expect(result.current.loading).toBe(false);
  // ── Book selection ────────────────────────────────────────────────────────
  describe("selectBook", () => {
    it("selects a book and resets chapter to 1", async () => {
      const mockBooks = [{ id: "gen", name: "Genesis", testament: "Old", chapters: 50 }];
      const book = result.current.books[0];
      act(() => {
        result.current.selectBook(book);
      expect(result.current.selectedBook).toEqual(book);
      expect(result.current.selectedChapter).toBe(1);
    it("fetches chapter data when book is selected", async () => {
      const mockChapter = {
        bookId: "gen",
        chapter: 1,
        verses: [
          { verse: 1, text: "In the beginning God created the heavens and the earth." },
          { verse: 2, text: "And the earth was formless and void." },
        ],
      };
      mockSendPostRequest
        .mockResolvedValueOnce(createMockResponse(mockBooks))
        .mockResolvedValueOnce(createMockResponse(mockChapter));
        result.current.selectBook(result.current.books[0]);
      expect(result.current.chapterData).toEqual(mockChapter);
      expect(result.current.chapterLoading).toBe(false);
  // ── Chapter navigation ────────────────────────────────────────────────────
  describe("goToChapter", () => {
    it("navigates to a valid chapter", async () => {
        result.current.goToChapter(5);
      expect(result.current.selectedChapter).toBe(5);
    it("ignores chapter out of bounds", async () => {
        result.current.goToChapter(100);
    it("ignores chapter less than 1", async () => {
        result.current.goToChapter(0);
  // ── Error handling ────────────────────────────────────────────────────────
  describe("error handling", () => {
    it("handles book fetch error gracefully", async () => {
      mockSendPostRequest.mockRejectedValue(new Error("Network error"));
    it("handles chapter fetch error gracefully", async () => {
        .mockRejectedValueOnce(new Error("Network error"));
      expect(result.current.chapterData).toBeNull();
});
