// Lab useLabFlow.test — useLabFlow.test state and API logic
import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act, mockSendPostRequest, createMockResponse, resetMocks } from "@/test/test-utils";

const { useLabFlow } = await import("./useLabFlow");
describe("useLabFlow", () => {
  beforeEach(() => {
    resetMocks();
  });
  // ── Initialization ────────────────────────────────────────────────────────
  describe("initialization", () => {
    it("does not fetch when no planId is provided", () => {
      const { result } = renderHook(() => useLabFlow());
      expect(result.current.loading).toBe(true);
      expect(result.current.stages).toEqual([]);
      expect(result.current.activeStage).toBe(0);
    });
  // ── Data fetching ─────────────────────────────────────────────────────────
  describe("fetchSession", () => {
    it("fetches session data when planId is provided", async () => {
      const mockSession = {
        id: "session-1",
        stages: [
          { type: "look", title: "Look", description: "Read the passage", completed: false },
          { type: "listen", title: "Listen", description: "Hear the word", completed: true },
          { type: "learn", title: "Learn", description: "Study deeply", completed: false },
        ],
        currentStage: 1,
      };
      mockSendPostRequest.mockResolvedValue(createMockResponse(mockSession));
      const { result } = renderHook(() => useLabFlow("session-1"));
      await act(async () => {
        await new Promise(r => setTimeout(r, 0));
      });
      expect(result.current.session).toEqual(mockSession);
      expect(result.current.stages).toHaveLength(3);
      expect(result.current.activeStage).toBe(1);
      expect(result.current.currentStage.title).toBe("Listen");
      expect(result.current.loading).toBe(false);
    it("handles API error gracefully", async () => {
      mockSendPostRequest.mockRejectedValue(new Error("Network error"));
  // ── Save stage ────────────────────────────────────────────────────────────
  describe("saveStage", () => {
    it("saves stage data and advances to next stage", async () => {
          { type: "look", title: "Look", completed: false },
          { type: "listen", title: "Listen", completed: false },
        currentStage: 0,
      mockSendPostRequest.mockResolvedValue(createMockResponse({}));
        await result.current.saveStage({ notes: "My observations" });
      expect(result.current.stages[0].completed).toBe(true);
      expect(result.current.stages[0].data).toEqual({ notes: "My observations" });
    it("does not advance past last stage", async () => {
        await result.current.saveStage({ notes: "Done" });
      expect(result.current.activeStage).toBe(0); // stays at 0
  // ── Navigation ────────────────────────────────────────────────────────────
  describe("goToStage", () => {
    it("navigates to a specific stage", async () => {
          { type: "learn", title: "Learn", completed: false },
      act(() => {
        result.current.goToStage(2);
      expect(result.current.activeStage).toBe(2);
      expect(result.current.currentStage.title).toBe("Learn");
    it("ignores out-of-bounds navigation", async () => {
        stages: [{ type: "look", title: "Look", completed: false }],
        result.current.goToStage(5);
});
