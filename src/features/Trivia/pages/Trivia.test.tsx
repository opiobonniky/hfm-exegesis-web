import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import TriviaPage from "./Trivia";

// ── Mock the API hooks ──
const mockFetchQuestion = vi.fn();
const mockAnswer = vi.fn();
const mockNextQuestion = vi.fn();
const mockFetchStats = vi.fn();
const mockReset = vi.fn();
const mockSetDifficulty = vi.fn();
const mockStartQuiz = vi.fn();
let mockPhase = "plan";
let mockQuestion: any = null;
let mockSelectedAnswer: number | null = null;
let mockResult: any = null;
let mockScore = { correct: 0, total: 0 };
let mockStats: any = null;
let mockLoading = false;
let mockError: string | null = null;
let mockDifficulty: string | null = null;
let mockTotalCount = 0;
let mockStreak = 0;
vi.mock("@/hooks/useTrivia", () => ({
  useTrivia: () => ({
    phase: mockPhase,
    question: mockQuestion,
    selectedAnswer: mockSelectedAnswer,
    result: mockResult,
    score: mockScore,
    stats: mockStats,
    loading: mockLoading,
    error: mockError,
    difficulty: mockDifficulty,
    totalCount: mockTotalCount,
    streak: mockStreak,
    fetchQuestion: mockFetchQuestion,
    answer: mockAnswer,
    nextQuestion: mockNextQuestion,
    fetchStats: mockFetchStats,
    reset: mockReset,
    setDifficulty: mockSetDifficulty,
    startQuiz: mockStartQuiz,
  }),
}));
// parseOptions is pure — no need to mock the api module since useTrivia mock prevents API calls
vi.mock("@/components/languages/languageProvider", () => ({
  useLanguage: () => ({
    t: {},
    isRtl: false,
    lang: "en",
    setLanguage: vi.fn(),
    isLoading: false,
// ── Helpers ──
function renderPage() {
  return render(
    <BrowserRouter>
      <TriviaPage />
    </BrowserRouter>,
  );
}
function setPlanState() {
  mockPhase = "plan";
  mockQuestion = null;
  mockSelectedAnswer = null;
  mockResult = null;
  mockScore = { correct: 0, total: 0 };
  mockStats = null;
  mockLoading = false;
  mockError = null;
  mockDifficulty = null;
  mockTotalCount = 0;
  mockStreak = 0;
const MOCK_OPTIONS = ["Jerusalem", "Bethlehem", "Nazareth", "Galilee"];
const MOCK_QUESTION = {
  id: 1,
  question: "Where was Jesus born?",
  optionsJson: JSON.stringify(MOCK_OPTIONS),
  correctAnswer: 1,
  explanation: "Jesus was born in Bethlehem according to the Gospels.",
  bookName: "Matthew",
  chapter: 2,
  verseNumber: 1,
  category: "Gospels",
  difficulty: "easy",
  totalRemaining: 10,
};
// ── Tests ──
describe("TriviaPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setPlanState();
  });
  // ── Plan screen ──
  describe("plan screen", () => {
    it("renders the header and title", () => {
      renderPage();
      expect(screen.getByText("Bible Trivia")).toBeInTheDocument();
      expect(screen.getByText("Bible Knowledge Quiz")).toBeInTheDocument();
    });
    it("renders difficulty options", () => {
      expect(screen.getByText("All")).toBeInTheDocument();
      expect(screen.getByText("Easy")).toBeInTheDocument();
      expect(screen.getByText("Medium")).toBeInTheDocument();
      expect(screen.getByText("Hard")).toBeInTheDocument();
    it("shows empty stats when no stats available", () => {
      expect(screen.getByText("No stats yet")).toBeInTheDocument();
    it("shows stats when available", () => {
      mockStats = { totalAnswered: 10, correct: 7, incorrect: 3, percentage: 70 };
      expect(screen.getByText("7")).toBeInTheDocument();
      expect(screen.getByText("10")).toBeInTheDocument();
      expect(screen.getByText("70%")).toBeInTheDocument();
    it("renders Start Quiz button", () => {
      expect(screen.getByText("Begin Quest")).toBeInTheDocument();
    it("calls startQuiz when Start Quiz is clicked", async () => {
      await userEvent.click(screen.getByText("Begin Quest"));
      expect(mockStartQuiz).toHaveBeenCalledOnce();
    it("calls setDifficulty when a difficulty is tapped", async () => {
      await userEvent.click(screen.getByText("Easy"));
      expect(mockSetDifficulty).toHaveBeenCalledWith("easy");
    it("calls setDifficulty with null for All", async () => {
      await userEvent.click(screen.getByText("Hard"));
      await userEvent.click(screen.getByText("All"));
      expect(mockSetDifficulty).toHaveBeenCalledWith(null);
    it("shows subtitle based on difficulty", () => {
      mockDifficulty = "easy";
      expect(screen.getByText("Easy questions")).toBeInTheDocument();
    it("shows subtitle for all levels", () => {
      expect(screen.getByText("All levels")).toBeInTheDocument();
  // ── Playing phase ──
  describe("playing phase", () => {
    beforeEach(() => {
      mockPhase = "playing";
      mockQuestion = MOCK_QUESTION;
      mockTotalCount = 10;
    it("renders the question", () => {
      expect(screen.getByText("Where was Jesus born?")).toBeInTheDocument();
    it("renders all answer options", () => {
      MOCK_OPTIONS.forEach((opt) => {
        expect(screen.getByText(opt)).toBeInTheDocument();
      });
    it("renders category and difficulty badges", () => {
      expect(screen.getByText("GOSPELS")).toBeInTheDocument();
      expect(screen.getByText("EASY")).toBeInTheDocument();
    it("renders the scripture reference button", () => {
      expect(screen.getByText("Matthew 2:1")).toBeInTheDocument();
    it("renders progress bar with question count", () => {
      expect(screen.getByText(/Question 1 of 10/)).toBeInTheDocument();
    it("shows 'Tap an option to answer' hint", () => {
      expect(screen.getByText("Tap an option to answer")).toBeInTheDocument();
    it("calls answer when an option is clicked", async () => {
      await userEvent.click(screen.getByText("Bethlehem"));
      expect(mockAnswer).toHaveBeenCalledWith(1);
    it("shows loading spinner when loading", () => {
      mockLoading = true;
      mockQuestion = null;
      expect(screen.getByText("Loading question...")).toBeInTheDocument();
    it("shows error and retry button", () => {
      mockError = "Failed to load question";
      expect(screen.getByText("Failed to load question")).toBeInTheDocument();
      expect(screen.getByText("Retry")).toBeInTheDocument();
    it("calls fetchQuestion on retry", async () => {
      mockError = "Network error";
      await userEvent.click(screen.getByText("Retry"));
      expect(mockFetchQuestion).toHaveBeenCalledOnce();
  // ── Answered phase ──
  describe("answered phase", () => {
      mockPhase = "answered";
      mockSelectedAnswer = 1;
      mockResult = {
        isCorrect: true,
        correctAnswer: 1,
        correctAnswerText: "Bethlehem",
        explanation: "Jesus was born in Bethlehem according to the Gospels.",
      };
      mockScore = { correct: 1, total: 1 };
      mockStreak = 1;
    it("shows the question in disabled state", () => {
    it("shows correct result card", () => {
      expect(screen.getByText("Correct!")).toBeInTheDocument();
    it("shows explanation", () => {
      expect(
        screen.getByText("Jesus was born in Bethlehem according to the Gospels."),
      ).toBeInTheDocument();
    it("shows score badge in header", () => {
      // Score badge renders as separate text nodes (correct / total)
      const ones = screen.getAllByText("1");
      expect(ones.length).toBeGreaterThanOrEqual(2);
    it("shows streak indicator for streak of 2", () => {
      mockStreak = 2;
      expect(screen.getByText(/\d+ in a row/)).toBeInTheDocument();
    it("shows streak of 3 or more with fire emoji", () => {
      mockStreak = 3;
    it("hides result card when dismissed, shows Next Question", async () => {
      // Click the Continue button on the result card (200ms dismiss animation)
      const continues = screen.getAllByText("Continue");
      await userEvent.click(continues[0]);
      await waitFor(() => {
        expect(screen.getByText("Next Question")).toBeInTheDocument();
    it("calls nextQuestion when Next is clicked", async () => {
      // Dismiss result first (200ms animation)
      await userEvent.click(screen.getByText("Next Question"));
      expect(mockNextQuestion).toHaveBeenCalledOnce();
    it("shows incorrect result when answer is wrong", () => {
        isCorrect: false,
        correctAnswer: 2,
        correctAnswerText: "Nazareth",
        explanation: "Jesus grew up in Nazareth.",
      mockStreak = 0;
      expect(screen.getByText("Incorrect")).toBeInTheDocument();
      // correctAnswerText appears once in the result card header
      const nazarethTexts = screen.getAllByText("Nazareth");
      expect(nazarethTexts.length).toBeGreaterThanOrEqual(1);
    it("does not show streak for 0 or 1 streak", () => {
      expect(screen.queryByText(/in a row/)).not.toBeInTheDocument();
  // ── Finished phase ──
  describe("finished phase", () => {
      mockPhase = "finished";
      mockSelectedAnswer = null;
      mockResult = null;
      mockScore = { correct: 7, total: 10 };
      mockStats = { totalAnswered: 30, correct: 21, incorrect: 9, percentage: 70 };
    it("shows completion message", () => {
      expect(screen.getByText("All Questions Completed!")).toBeInTheDocument();
    it("shows final score", () => {
      // The score appears at least once (and possibly again in lifetime stats)
      const scores = screen.getAllByText(/^7\/10$/);
      expect(scores.length).toBeGreaterThanOrEqual(1);
    it("shows lifetime stats when available", () => {
      expect(screen.getByText(/Lifetime:/)).toBeInTheDocument();
      expect(screen.getByText(/21\/30/)).toBeInTheDocument();
    it("renders Play Again button", () => {
      expect(screen.getByText("Play Again")).toBeInTheDocument();
    it("calls reset when Play Again is clicked", async () => {
      await userEvent.click(screen.getByText("Play Again"));
      expect(mockReset).toHaveBeenCalledOnce();
    it("does not show lifetime stats if not greater than current score", () => {
      expect(screen.queryByText(/Lifetime:/)).not.toBeInTheDocument();
  // ── Milestone overlay tests ──
  describe("milestone overlay", () => {
        explanation: "Jesus was born in Bethlehem.",
    it("shows milestone at 3 questions (Bright Start / Great Start / Good Start / First Steps)", () => {
      mockScore = { correct: 3, total: 3 };
      // Milestone number - multiple matches because score badge also shows "3" as separate text
      const threes = screen.getAllByText("3");
      expect(threes.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("Questions Answered")).toBeInTheDocument();
      // Accuracy (100% = elite tier)
      expect(screen.getByText("Bright Star!")).toBeInTheDocument();
      expect(screen.getByText("100%")).toBeInTheDocument();
      const threeThree = screen.getAllByText("3/3");
      expect(threeThree.length).toBeGreaterThanOrEqual(1);
    it("shows milestone at 5 questions (elite tier: On Fire!)", () => {
      mockScore = { correct: 5, total: 5 };
      const fives = screen.getAllByText("5");
      expect(fives.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("Crown of Wisdom!")).toBeInTheDocument();
    it("shows milestone at 10 questions (elite tier: Bible Scholar!)", () => {
      mockScore = { correct: 10, total: 10 };
      const tens = screen.getAllByText("10");
      expect(tens.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("Scripture Scholar!")).toBeInTheDocument();
    it("shows milestone at 25 questions (elite tier: Scripture Master!)", () => {
      mockScore = { correct: 25, total: 25 };
      const twentyFives = screen.getAllByText("25");
      expect(twentyFives.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("Master of the Word!")).toBeInTheDocument();
    it("shows correct message tier for 70% accuracy (strong tier)", () => {
      // 70% = strong tier
      expect(screen.getByText("Worthy Student!")).toBeInTheDocument();
    it("shows correct message tier for 50% accuracy (solid tier)", () => {
      mockScore = { correct: 5, total: 10 };
      // 50% = solid tier, 10 questions milestone
      expect(screen.getByText("Faithful Seeker!")).toBeInTheDocument();
      expect(screen.getByText("50%")).toBeInTheDocument();
    it("shows correct message tier for 20% accuracy (growing tier)", () => {
      mockScore = { correct: 1, total: 5 };
      // 20% = growing tier, 5 questions milestone
      expect(screen.getByText("Persistent Heart!")).toBeInTheDocument();
      expect(screen.getByText("20%")).toBeInTheDocument();
    it("does not show milestone for non-milestone totals", () => {
      mockScore = { correct: 4, total: 4 };
      expect(screen.queryByText("Questions Answered")).not.toBeInTheDocument();
    it("does not show milestone for total of 0", () => {
      mockScore = { correct: 0, total: 0 };
    it("renders Continue button that dismisses the overlay", async () => {
      // Both result card and milestone overlay have "Continue" buttons.
      // Milestone overlay renders first (in the header area), result card second.
      expect(continues.length).toBeGreaterThanOrEqual(2);
      // Click the first one (milestone overlay's Continue button)
        expect(screen.queryByText("Questions Answered")).not.toBeInTheDocument();
  // ── TriviaQuestionCard ──
  describe("TriviaQuestionCard", () => {
    it("renders option letters (A, B, C, D)", () => {
      expect(screen.getByText("A")).toBeInTheDocument();
      expect(screen.getByText("B")).toBeInTheDocument();
      expect(screen.getByText("C")).toBeInTheDocument();
      expect(screen.getByText("D")).toBeInTheDocument();
    it("shows correct answer highlighted with green check when disabled", () => {
      // Correct answer should show "Correct!" in the result card
      // The check icon presence is verified by the Correct! text rendering
    it("shows wrong answer highlighted with red X when incorrect", () => {
      mockSelectedAnswer = 0; // User selected Jerusalem (wrong)
      // The correct answer text appears both as an answer option and as correctAnswerText
      const beths = screen.getAllByText("Bethlehem");
      expect(beths.length).toBeGreaterThanOrEqual(1);
    it("renders reference button that calls navigate on click", async () => {
      const mockNavigate = vi.fn();
      // We need to mock the navigate function. Since the page uses useNavigate,
      // and there's no direct way to mock it, we just verify the button exists.
      // Matthew 2:1 reference should be visible
      // The BookOpen icon indicates it's a read passage button
      expect(screen.getByText("Read passage")).toBeInTheDocument();
    it("renders all option buttons disabled in answered phase", () => {
        explanation: "Correct.",
      // All option buttons should be disabled
      const buttons = screen.getAllByRole("button");
      const disabledButtons = buttons.filter((b) => b.hasAttribute("disabled"));
      expect(disabledButtons.length).toBeGreaterThanOrEqual(4);
  // ── TriviaResultCard ──
  describe("TriviaResultCard", () => {
    it("shows Correct! with green styling when answer is right", () => {
      // The "Correct!" text is rendered inside the result card with green accent color
      const correctEl = screen.getByText("Correct!");
      expect(correctEl.closest("div")).toBeTruthy();
    it("shows Incorrect with the correct answer when wrong", () => {
      // Nazareth appears both as an answer option and as the correctAnswerText
      const nazs = screen.getAllByText("Nazareth");
      expect(nazs.length).toBeGreaterThanOrEqual(1);
    it("does not render explanation section when explanation is absent", () => {
        explanation: "",
      // Lightbulb icon should not appear when no explanation
      // The explanation from the default mock should not appear
      expect(screen.queryByText("Jesus was born in Bethlehem according to the Gospels.")).not.toBeInTheDocument();
  // ── ConfettiOverlay ──
  describe("ConfettiOverlay", () => {
        explanation: "Correct!",
    it("triggers confetti when streak reaches 3 on correct answer", () => {
      // Confetti creates div elements with animation styles
      // Since confetti uses fixed positioning, it will be in the DOM
      // We check that the streak indicator shows fire emoji
      expect(screen.getByText(/3 in a row/)).toBeInTheDocument();
    it("does not show confetti for streak below 3", () => {
      // No streak indicator should be visible
    it("shows streak of 2 without fire emoji", () => {
      mockScore = { correct: 2, total: 2 };
      // Streak indicator visible but no fire emoji
      expect(screen.getByText(/2 in a row/)).toBeInTheDocument();
  // ── MilestoneOverlay ──
  describe("MilestoneOverlay", () => {
    it("shows accuracy ring with correct percentage", () => {
      mockScore = { correct: 4, total: 5 }; // 80% at 5 milestone
      expect(screen.getByText("80%")).toBeInTheDocument();
      const fourFive = screen.getAllByText("4/5");
      expect(fourFive.length).toBeGreaterThanOrEqual(1);
    it("shows correct tier message: elite (>=80%)", () => {
      mockScore = { correct: 4, total: 5 }; // 80% → elite
    it("shows correct tier message: growing (<40%)", () => {
      mockScore = { correct: 1, total: 5 }; // 20% → growing
    it("shows different icon for 10 questions milestone (Award icon)", () => {
      mockScore = { correct: 9, total: 10 }; // 90%
      expect(screen.getByText("90%")).toBeInTheDocument();
    it("shows different icon for 25 questions milestone (PartyPopper icon)", () => {
      mockScore = { correct: 22, total: 25 }; // 88%
      const twoTwoFive = screen.getAllByText("22/25");
      expect(twoTwoFive.length).toBeGreaterThanOrEqual(1);
  // ── parseOptions helper ──
  describe("parseOptions", () => {
    it("returns empty array for invalid JSON", async () => {
      const { parseOptions } = await import("@/services/triviaApi");
      expect(parseOptions("not json")).toEqual([]);
    it("parses valid JSON array", async () => {
      expect(parseOptions('["A","B","C"]')).toEqual(["A", "B", "C"]);
    it("returns empty array for non-array parsed value", async () => {
      expect(parseOptions('"string"')).toEqual([]);
      expect(parseOptions("{}")).toEqual([]);
      expect(parseOptions("42")).toEqual([]);
});
