// Trivia useTriviaQuestions.test — useTriviaQuestions.test state and API logic
import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act, mockSendPostRequest, createMockResponse, resetMocks } from "@/test/test-utils";

const { useTriviaQuestions } = await import("./useTriviaQuestions");
describe("useTriviaQuestions", () => {
  beforeEach(() => {
    resetMocks();
    mockSendPostRequest.mockResolvedValue(createMockResponse({ content: [] }));
  });
  // ── Initialization ────────────────────────────────────────────────────────
  describe("initialization", () => {
    it("starts with loading true and empty questions", () => {
      const { result } = renderHook(() => useTriviaQuestions());
      expect(result.current.loading).toBe(true);
      expect(result.current.questions).toEqual([]);
    });
    it("fetches questions on mount", async () => {
      await act(async () => {
        await new Promise(r => setTimeout(r, 0));
      });
      expect(mockSendPostRequest).toHaveBeenCalledWith("trivia", "get-all", expect.objectContaining({ page: 0, pageSize: 20 }));
  // ── Data fetching ─────────────────────────────────────────────────────────
  describe("fetchQuestions", () => {
    it("populates questions from API response", async () => {
      const mockQuestions = [
        { id: "1", question: "Who built the ark?", options: ["Noah", "Moses", "Abraham", "David"], correctAnswer: "Noah", category: "Old Testament", difficulty: "easy" },
        { id: "2", question: "How many days did God take to create the world?", options: ["5", "6", "7", "8"], correctAnswer: "6", category: "Genesis", difficulty: "medium" },
      ];
      mockSendPostRequest.mockResolvedValue(createMockResponse({ content: mockQuestions }));
      expect(result.current.questions).toHaveLength(2);
      expect(result.current.questions[0].question).toBe("Who built the ark?");
      expect(result.current.loading).toBe(false);
  // ── Filtering ─────────────────────────────────────────────────────────────
  describe("filtering", () => {
    it("sends category filter in request", async () => {
        result.current.setSelectedCategory("Old Testament");
      expect(mockSendPostRequest).toHaveBeenCalledWith(
        "trivia", "get-all",
        expect.objectContaining({ category: "Old Testament" })
      );
    it("sends difficulty filter in request", async () => {
        result.current.setSelectedDifficulty("hard");
        expect.objectContaining({ difficulty: "hard" })
  // ── CRUD operations ──────────────────────────────────────────────────────
  describe("createQuestion", () => {
    it("calls create API and refreshes list", async () => {
      mockSendPostRequest.mockResolvedValue(createMockResponse({}));
        await result.current.createQuestion({ question: "New question?", options: ["A", "B"], correctAnswer: "A", category: "Test", difficulty: "easy" });
      expect(mockSendPostRequest).toHaveBeenCalledWith("trivia", "add-question", expect.objectContaining({ question: "New question?" }));
  describe("deleteQuestion", () => {
    it("calls delete API and removes question from state", async () => {
      mockSendPostRequest.mockResolvedValueOnce(createMockResponse({ content: [{ id: "1", question: "Q1" }, { id: "2", question: "Q2" }] }));
      mockSendPostRequest.mockResolvedValueOnce(createMockResponse({}));
        await result.current.deleteQuestion("1");
      expect(result.current.questions).toHaveLength(1);
      expect(result.current.questions[0].id).toBe("2");
});
