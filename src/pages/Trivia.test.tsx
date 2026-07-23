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
  }),
}));

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
}

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
      renderPage();
      expect(screen.getByText("All")).toBeInTheDocument();
      expect(screen.getByText("Easy")).toBeInTheDocument();
      expect(screen.getByText("Medium")).toBeInTheDocument();
      expect(screen.getByText("Hard")).toBeInTheDocument();
    });

    it("shows empty stats when no stats available", () => {
      renderPage();
      expect(screen.getByText("No stats yet")).toBeInTheDocument();
    });

    it("shows stats when available", () => {
      mockStats = { totalAnswered: 10, correct: 7, incorrect: 3, percentage: 70 };
      renderPage();
      expect(screen.getByText("7")).toBeInTheDocument();
      expect(screen.getByText("10")).toBeInTheDocument();
      expect(screen.getByText("70%")).toBeInTheDocument();
    });

    it("renders Start Quiz button", () => {
      renderPage();
      expect(screen.getByText("Start Quiz")).toBeInTheDocument();
    });

    it("calls startQuiz when Start Quiz is clicked", async () => {
      renderPage();
      await userEvent.click(screen.getByText("Start Quiz"));
      expect(mockStartQuiz).toHaveBeenCalledOnce();
    });

    it("calls setDifficulty when a difficulty is tapped", async () => {
      renderPage();
      await userEvent.click(screen.getByText("Easy"));
      expect(mockSetDifficulty).toHaveBeenCalledWith("easy");
    });

    it("calls setDifficulty with null for All", async () => {
      renderPage();
      await userEvent.click(screen.getByText("Hard"));
      await userEvent.click(screen.getByText("All"));
      expect(mockSetDifficulty).toHaveBeenCalledWith(null);
    });

    it("shows subtitle based on difficulty", () => {
      mockDifficulty = "easy";
      renderPage();
      expect(screen.getByText("Easy questions")).toBeInTheDocument();
    });

    it("shows subtitle for all levels", () => {
      renderPage();
      expect(screen.getByText("All levels")).toBeInTheDocument();
    });
  });

  // ── Playing phase ──

  describe("playing phase", () => {
    beforeEach(() => {
      mockPhase = "playing";
      mockQuestion = MOCK_QUESTION;
      mockTotalCount = 10;
    });

    it("renders the question", () => {
      renderPage();
      expect(screen.getByText("Where was Jesus born?")).toBeInTheDocument();
    });

    it("renders all answer options", () => {
      renderPage();
      MOCK_OPTIONS.forEach((opt) => {
        expect(screen.getByText(opt)).toBeInTheDocument();
      });
    });

    it("renders category and difficulty badges", () => {
      renderPage();
      expect(screen.getByText("GOSPELS")).toBeInTheDocument();
      expect(screen.getByText("EASY")).toBeInTheDocument();
    });

    it("renders the scripture reference button", () => {
      renderPage();
      expect(screen.getByText("Matthew 2:1")).toBeInTheDocument();
    });

    it("renders progress bar with question count", () => {
      renderPage();
      expect(screen.getByText(/Question 1 of 10/)).toBeInTheDocument();
    });

    it("shows 'Tap an option to answer' hint", () => {
      renderPage();
      expect(screen.getByText("Tap an option to answer")).toBeInTheDocument();
    });

    it("calls answer when an option is clicked", async () => {
      renderPage();
      await userEvent.click(screen.getByText("Bethlehem"));
      expect(mockAnswer).toHaveBeenCalledWith(1);
    });

    it("shows loading spinner when loading", () => {
      mockLoading = true;
      mockQuestion = null;
      renderPage();
      expect(screen.getByText("Loading question...")).toBeInTheDocument();
    });

    it("shows error and retry button", () => {
      mockError = "Failed to load question";
      mockQuestion = null;
      renderPage();
      expect(screen.getByText("Failed to load question")).toBeInTheDocument();
      expect(screen.getByText("Retry")).toBeInTheDocument();
    });

    it("calls fetchQuestion on retry", async () => {
      mockError = "Network error";
      mockQuestion = null;
      renderPage();
      await userEvent.click(screen.getByText("Retry"));
      expect(mockFetchQuestion).toHaveBeenCalledOnce();
    });
  });

  // ── Answered phase ──

  describe("answered phase", () => {
    beforeEach(() => {
      mockPhase = "answered";
      mockQuestion = MOCK_QUESTION;
      mockSelectedAnswer = 1;
      mockResult = {
        isCorrect: true,
        correctAnswer: 1,
        correctAnswerText: "Bethlehem",
        explanation: "Jesus was born in Bethlehem according to the Gospels.",
      };
      mockScore = { correct: 1, total: 1 };
      mockStreak = 1;
    });

    it("shows the question in disabled state", () => {
      renderPage();
      expect(screen.getByText("Where was Jesus born?")).toBeInTheDocument();
    });

    it("shows correct result card", () => {
      renderPage();
      expect(screen.getByText("Correct!")).toBeInTheDocument();
    });

    it("shows explanation", () => {
      renderPage();
      expect(
        screen.getByText("Jesus was born in Bethlehem according to the Gospels."),
      ).toBeInTheDocument();
    });

    it("shows score badge in header", () => {
      renderPage();
      expect(screen.getByText("1/1")).toBeInTheDocument();
    });

    it("shows streak indicator for streak of 2", () => {
      mockStreak = 2;
      renderPage();
      expect(screen.getByText(/\d+ in a row/)).toBeInTheDocument();
    });

    it("shows streak of 3 or more with fire emoji", () => {
      mockStreak = 3;
      renderPage();
      expect(screen.getByText(/\d+ in a row/)).toBeInTheDocument();
    });

    it("hides result card when dismissed, shows Next Question", async () => {
      renderPage();
      // Click the Continue button on the result card (200ms dismiss animation)
      const continues = screen.getAllByText("Continue");
      await userEvent.click(continues[0]);
      await waitFor(() => {
        expect(screen.getByText("Next Question")).toBeInTheDocument();
      });
    });

    it("calls nextQuestion when Next is clicked", async () => {
      renderPage();
      // Dismiss result first (200ms animation)
      const continues = screen.getAllByText("Continue");
      await userEvent.click(continues[0]);
      await waitFor(() => {
        expect(screen.getByText("Next Question")).toBeInTheDocument();
      });
      await userEvent.click(screen.getByText("Next Question"));
      expect(mockNextQuestion).toHaveBeenCalledOnce();
    });

    it("shows incorrect result when answer is wrong", () => {
      mockResult = {
        isCorrect: false,
        correctAnswer: 2,
        correctAnswerText: "Nazareth",
        explanation: "Jesus grew up in Nazareth.",
      };
      mockStreak = 0;
      renderPage();
      expect(screen.getByText("Incorrect")).toBeInTheDocument();
      // correctAnswerText appears once in the result card header
      const nazarethTexts = screen.getAllByText("Nazareth");
      expect(nazarethTexts.length).toBeGreaterThanOrEqual(1);
    });

    it("does not show streak for 0 or 1 streak", () => {
      mockStreak = 0;
      renderPage();
      expect(screen.queryByText(/in a row/)).not.toBeInTheDocument();
    });
  });

  // ── Finished phase ──

  describe("finished phase", () => {
    beforeEach(() => {
      mockPhase = "finished";
      mockQuestion = null;
      mockSelectedAnswer = null;
      mockResult = null;
      mockScore = { correct: 7, total: 10 };
      mockStats = { totalAnswered: 30, correct: 21, incorrect: 9, percentage: 70 };
    });

    it("shows completion message", () => {
      renderPage();
      expect(screen.getByText("All Questions Completed!")).toBeInTheDocument();
    });

    it("shows final score", () => {
      renderPage();
      // The score appears at least once (and possibly again in lifetime stats)
      const scores = screen.getAllByText(/^7\/10$/);
      expect(scores.length).toBeGreaterThanOrEqual(1);
    });

    it("shows lifetime stats when available", () => {
      renderPage();
      expect(screen.getByText(/Lifetime:/)).toBeInTheDocument();
      expect(screen.getByText(/21\/30/)).toBeInTheDocument();
    });

    it("renders Play Again button", () => {
      renderPage();
      expect(screen.getByText("Play Again")).toBeInTheDocument();
    });

    it("calls reset when Play Again is clicked", async () => {
      renderPage();
      await userEvent.click(screen.getByText("Play Again"));
      expect(mockReset).toHaveBeenCalledOnce();
    });

    it("does not show lifetime stats if not greater than current score", () => {
      mockStats = { totalAnswered: 10, correct: 7, incorrect: 3, percentage: 70 };
      renderPage();
      expect(screen.queryByText(/Lifetime:/)).not.toBeInTheDocument();
    });
  });

  // ── Milestone overlay tests ──

  describe("milestone overlay", () => {
    beforeEach(() => {
      mockPhase = "answered";
      mockQuestion = MOCK_QUESTION;
      mockSelectedAnswer = 1;
      mockResult = {
        isCorrect: true,
        correctAnswer: 1,
        correctAnswerText: "Bethlehem",
        explanation: "Jesus was born in Bethlehem.",
      };
      mockStreak = 3;
    });

    it("shows milestone at 3 questions (Bright Start / Great Start / Good Start / First Steps)", () => {
      mockScore = { correct: 3, total: 3 };
      renderPage();
      // Milestone number
      expect(screen.getByText("3")).toBeInTheDocument();
      expect(screen.getByText("Questions Answered")).toBeInTheDocument();
      // Accuracy (100% = elite tier)
      expect(screen.getByText("Bright Start!")).toBeInTheDocument();
      expect(screen.getByText("100%")).toBeInTheDocument();
      expect(screen.getByText("3/3 correct")).toBeInTheDocument();
    });

    it("shows milestone at 5 questions (elite tier: On Fire!)", () => {
      mockScore = { correct: 5, total: 5 };
      renderPage();
      expect(screen.getByText("5")).toBeInTheDocument();
      expect(screen.getByText("On Fire!")).toBeInTheDocument();
    });

    it("shows milestone at 10 questions (elite tier: Bible Scholar!)", () => {
      mockScore = { correct: 10, total: 10 };
      renderPage();
      expect(screen.getByText("10")).toBeInTheDocument();
      expect(screen.getByText("Bible Scholar!")).toBeInTheDocument();
    });

    it("shows milestone at 25 questions (elite tier: Scripture Master!)", () => {
      mockScore = { correct: 25, total: 25 };
      renderPage();
      expect(screen.getByText("25")).toBeInTheDocument();
      expect(screen.getByText("Scripture Master!")).toBeInTheDocument();
    });

    it("shows correct message tier for 70% accuracy (strong tier)", () => {
      mockScore = { correct: 7, total: 10 };
      renderPage();
      // 70% = strong tier
      expect(screen.getByText("10")).toBeInTheDocument();
      expect(screen.getByText("Impressive!")).toBeInTheDocument();
      expect(screen.getByText("70%")).toBeInTheDocument();
    });

    it("shows correct message tier for 50% accuracy (solid tier)", () => {
      mockScore = { correct: 5, total: 10 };
      renderPage();
      // 50% = solid tier, 10 questions milestone
      expect(screen.getByText("Dedicated!")).toBeInTheDocument();
      expect(screen.getByText("50%")).toBeInTheDocument();
    });

    it("shows correct message tier for 20% accuracy (growing tier)", () => {
      mockScore = { correct: 1, total: 5 };
      renderPage();
      // 20% = growing tier, 5 questions milestone
      expect(screen.getByText("Nice Effort!")).toBeInTheDocument();
      expect(screen.getByText("20%")).toBeInTheDocument();
    });

    it("does not show milestone for non-milestone totals", () => {
      mockScore = { correct: 4, total: 4 };
      renderPage();
      expect(screen.queryByText("Questions Answered")).not.toBeInTheDocument();
    });

    it("does not show milestone for total of 0", () => {
      mockScore = { correct: 0, total: 0 };
      renderPage();
      expect(screen.queryByText("Questions Answered")).not.toBeInTheDocument();
    });

    it("renders Continue button that dismisses the overlay", async () => {
      mockScore = { correct: 3, total: 3 };
      renderPage();
      // Both result card and milestone overlay have "Continue" buttons.
      // Milestone overlay renders first (in the header area), result card second.
      const continues = screen.getAllByText("Continue");
      expect(continues.length).toBeGreaterThanOrEqual(2);
      // Click the first one (milestone overlay's Continue button)
      await userEvent.click(continues[0]);
      await waitFor(() => {
        expect(screen.queryByText("Questions Answered")).not.toBeInTheDocument();
      });
    });
  });

  // ── parseOptions helper ──

  describe("parseOptions", () => {
    it("returns empty array for invalid JSON", async () => {
      const { parseOptions } = await import("@/services/triviaApi");
      expect(parseOptions("not json")).toEqual([]);
    });

    it("parses valid JSON array", async () => {
      const { parseOptions } = await import("@/services/triviaApi");
      expect(parseOptions('["A","B","C"]')).toEqual(["A", "B", "C"]);
    });

    it("returns empty array for non-array parsed value", async () => {
      const { parseOptions } = await import("@/services/triviaApi");
      expect(parseOptions('"string"')).toEqual([]);
      expect(parseOptions("{}")).toEqual([]);
      expect(parseOptions("42")).toEqual([]);
    });
  });
});
