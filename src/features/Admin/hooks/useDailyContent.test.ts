// Admin useDailyContent.test — useDailyContent.test state and API logic
import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";

const mockSendPostRequest = vi.fn();
vi.mock("@/services/api", () => ({
  sendPostRequest: (...args: any[]) => mockSendPostRequest(...args),
}));
const { useDailyContent } = await import("./useDailyContent");
function createMockResponse(data: any, returnCode = 200) {
  return { returnCode, returnData: data, returnMessage: "OK", success: true };
}
describe("useDailyContent", () => {
  beforeEach(() => {
    mockSendPostRequest.mockReset();
    mockSendPostRequest.mockResolvedValue(createMockResponse({ content: [] }));
  });
  describe("initialization", () => {
    it("starts with loading true and empty items", () => {
      const { result } = renderHook(() => useDailyContent("verse"));
      expect(result.current.loading).toBe(true);
      expect(result.current.items).toEqual([]);
    });
    it("fetches items when fetchItems is called for verse type", async () => {
      await act(async () => {
        await result.current.refresh();
      });
      expect(mockSendPostRequest).toHaveBeenCalledWith("admin", "get-all-daily-verses", expect.objectContaining({ page: 0, size: 20 }));
    it("uses correct endpoint for devotion type", async () => {
      const { result } = renderHook(() => useDailyContent("devotion"));
      expect(mockSendPostRequest).toHaveBeenCalledWith("admin", "get-all-daily-devotions", expect.anything());
    it("uses correct endpoint for exegesis type", async () => {
      const { result } = renderHook(() => useDailyContent("exegesis"));
      expect(mockSendPostRequest).toHaveBeenCalledWith("admin", "get-all-daily-exegesis", expect.anything());
  describe("fetchItems", () => {
    it("populates items from API response", async () => {
      const mockItems = [
        { id: "1", title: "John 3:16", status: "published", date: "2024-01-01" },
        { id: "2", title: "Psalm 23", status: "draft", date: "2024-01-02" },
      ];
      mockSendPostRequest.mockResolvedValue(createMockResponse({ content: mockItems }));
      expect(result.current.items).toHaveLength(2);
      expect(result.current.loading).toBe(false);
  describe("filtering", () => {
    it("sends search query in request", async () => {
        result.current.setSearchQuery("John");
      expect(mockSendPostRequest).toHaveBeenCalledWith(
        "admin", "get-all-daily-verses",
        expect.objectContaining({ search: "John" })
      );
    it("sends status filter in request", async () => {
        result.current.setSelectedStatus("published");
        expect.objectContaining({ status: "published" })
  describe("createItem", () => {
    it("calls create API and refreshes list", async () => {
      mockSendPostRequest.mockResolvedValue(createMockResponse({}));
        await result.current.createItem({ title: "New Verse", reference: "Romans 8:28" });
      expect(mockSendPostRequest).toHaveBeenCalledWith("admin", "add-daily-verse", { title: "New Verse", reference: "Romans 8:28" });
  describe("deleteItem", () => {
    it("calls delete API and removes item from state", async () => {
      mockSendPostRequest.mockResolvedValueOnce(createMockResponse({ content: [{ id: "1", title: "Item 1" }] }));
      expect(result.current.items).toHaveLength(1);
      mockSendPostRequest.mockResolvedValueOnce(createMockResponse({}));
        await result.current.deleteItem("1");
      expect(result.current.items).toHaveLength(0);
      expect(mockSendPostRequest).toHaveBeenCalledWith("admin", "delete-daily-verse", { id: "1" });
});
