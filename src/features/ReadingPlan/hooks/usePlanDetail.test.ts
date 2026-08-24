// ReadingPlan usePlanDetail.test — usePlanDetail.test state and API logic
import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act, mockSendPostRequest, createMockResponse, resetMocks } from "@/test/test-utils";

const { usePlanDetail } = await import("./usePlanDetail");
describe("usePlanDetail", () => {
  beforeEach(() => {
    resetMocks();
  });
  // ── Initialization ────────────────────────────────────────────────────────
  describe("initialization", () => {
    it("does not fetch when no planId is provided", () => {
      const { result } = renderHook(() => usePlanDetail());
      expect(result.current.loading).toBe(true);
      expect(result.current.plan).toBeNull();
      expect(result.current.readings).toEqual([]);
    });
  // ── Data fetching ─────────────────────────────────────────────────────────
  describe("fetchPlan", () => {
    it("fetches plan data when planId is provided", async () => {
      const mockPlan = {
        id: "plan-1",
        title: "30 Day Bible Plan",
        description: "Read through the Bible",
        duration: 30,
        difficulty: "medium",
        days: [
          { day: 1, reference: "Genesis 1-3", completed: false },
          { day: 2, reference: "Genesis 4-6", completed: true },
        ],
      };
      mockSendPostRequest.mockResolvedValue(createMockResponse(mockPlan));
      const { result } = renderHook(() => usePlanDetail("plan-1"));
      await act(async () => {
        await new Promise(r => setTimeout(r, 0));
      });
      expect(result.current.plan).toEqual(mockPlan);
      expect(result.current.readings).toHaveLength(2);
      expect(result.current.loading).toBe(false);
    it("calculates progress correctly", async () => {
        title: "Test Plan",
          { day: 1, reference: "Gen 1", completed: true },
          { day: 2, reference: "Gen 2", completed: true },
          { day: 3, reference: "Gen 3", completed: false },
          { day: 4, reference: "Gen 4", completed: false },
      expect(result.current.completedCount).toBe(2);
      expect(result.current.progress).toBe(50);
    it("handles API error gracefully", async () => {
      mockSendPostRequest.mockRejectedValue(new Error("Network error"));
  // ── Toggle complete ───────────────────────────────────────────────────────
  describe("toggleComplete", () => {
    it("toggles reading day completion", async () => {
          { day: 1, reference: "Gen 1", completed: false },
          { day: 2, reference: "Gen 2", completed: false },
      mockSendPostRequest.mockResolvedValue(createMockResponse({}));
        await result.current.toggleComplete(1);
      expect(result.current.readings[0].completed).toBe(true);
      expect(result.current.completedCount).toBe(1);
    it("does not toggle when no user is authenticated", async () => {
      const mockPlan = { id: "plan-1", days: [{ day: 1, completed: false }] };
      // The mock auth has user.id = "user-1", so this should work
      // But if we test without auth, it should not call API
  // ── Refresh ───────────────────────────────────────────────────────────────
  describe("refresh", () => {
    it("re-fetches plan data", async () => {
      const mockPlan = { id: "plan-1", days: [] };
      const callCount = mockSendPostRequest.mock.calls.length;
        result.current.refresh();
      expect(mockSendPostRequest.mock.calls.length).toBeGreaterThan(callCount);
});
