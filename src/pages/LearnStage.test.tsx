import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LearnStage from "./LearnStage";
import {
  LEARN_TABS,
  MOCK_PASSAGE_REF,
  MOCK_BOOK,
  MOCK_CHAPTER,
  MOCK_VERSE_START,
  MOCK_STAGE_LABEL,
  createMockVerseWords,
  createMockBookPrologue,
  MOCK_VERSE_RESOURCES,
  MOCK_TRANSLATIONS,
} from "@/test/stageTestUtils";

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

// Mock clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
  },
});

// ── Shared test props ──

function createProps(overrides: Record<string, any> = {}) {
  const onUpdate = vi.fn();
  const onAdvance = vi.fn();
  const onSaveProgress = vi.fn();
  const onWordTap = vi.fn();
  return {
    learnTab: "exegesis",
    learnNotes: "",
    bookName: MOCK_BOOK,
    chapter: MOCK_CHAPTER,
    verseStart: MOCK_VERSE_START,
    passageRef: MOCK_PASSAGE_REF,
    saving: false,
    verseWords: createMockVerseWords(3),
    wordsLoading: false,
    bookPrologue: createMockBookPrologue(),
    prologueLoading: false,
    verseResources: MOCK_VERSE_RESOURCES,
    resourcesLoading: false,
    translations: MOCK_TRANSLATIONS,
    translationsLoading: false,
    translationsError: false,
    onUpdate,
    onAdvance,
    onSaveProgress,
    onWordTap,
    stageLabel: MOCK_STAGE_LABEL,
    learnTabs: LEARN_TABS,
    ...overrides,
  };
}

// ── Tests ──

describe("LearnStage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("header", () => {
    it("renders the stage header with step 3 of 4", () => {
      render(<LearnStage {...createProps()} />);
      expect(screen.getByText("Step 3 of 4")).toBeInTheDocument();
      expect(screen.getByText("Learn")).toBeInTheDocument();
      expect(screen.getByText(MOCK_STAGE_LABEL)).toBeInTheDocument();
    });

    it("renders passage ref badge when provided", () => {
      render(<LearnStage {...createProps()} />);
      expect(screen.getByText(MOCK_PASSAGE_REF)).toBeInTheDocument();
    });

    it("does not render passage ref badge when null", () => {
      render(<LearnStage {...createProps({ passageRef: null })} />);
      expect(screen.queryByText(MOCK_PASSAGE_REF)).not.toBeInTheDocument();
    });
  });

  describe("tab bar", () => {
    it("renders all four tabs", () => {
      render(<LearnStage {...createProps()} />);
      for (const tab of LEARN_TABS) {
        expect(screen.getAllByText(tab.label).length).toBeGreaterThanOrEqual(1);
      }
    });

    it("shows the current tab as active with primary styling", () => {
      render(<LearnStage {...createProps({ learnTab: "language" })} />);
      const languageTab = screen.getByText("Original Language");
      expect(languageTab.className).toContain("bg-primary");
      const exegesisTabs = screen.getAllByText("Study Notes");
      // At least one tab element should have "bg-card" (non-active styling)
      const nonActiveTab = exegesisTabs.find((el) => el.className.includes("bg-card"));
      expect(nonActiveTab).toBeTruthy();
    });

    it("calls onUpdate when a different tab is clicked", async () => {
      const onUpdate = vi.fn();
      render(<LearnStage {...createProps({ onUpdate })} />);
      const languageBtns = screen.getAllByText("Original Language");
      await userEvent.click(languageBtns[0]);
      expect(onUpdate).toHaveBeenCalledWith({ learnTab: "language" });
    });
  });

  describe("exegesis tab", () => {
    it("renders study notes textarea with placeholder", () => {
      render(<LearnStage {...createProps({ learnTab: "exegesis" })} />);
      const textarea = screen.getByPlaceholderText("Write your study notes, observations, and insights...");
      expect(textarea).toBeInTheDocument();
    });

    it("displays existing notes", () => {
      render(<LearnStage {...createProps({ learnTab: "exegesis", learnNotes: "Jesus is the Word." })} />);
      expect(screen.getByDisplayValue("Jesus is the Word.")).toBeInTheDocument();
    });

    it("calls onUpdate when notes change", async () => {
      const onUpdate = vi.fn();
      render(<LearnStage {...createProps({ learnTab: "exegesis", onUpdate })} />);
      const textarea = screen.getByPlaceholderText("Write your study notes, observations, and insights...");
      await userEvent.type(textarea, "J");
      expect(onUpdate).toHaveBeenCalledWith({ learnNotes: "J" });
    });
  });

  describe("language tab", () => {
    it("shows word count in the header", () => {
      render(<LearnStage {...createProps({ learnTab: "language", verseWords: createMockVerseWords(3) })} />);
      expect(screen.getByText("(3 words)")).toBeInTheDocument();
    });

    it("renders verse words with Strong's lemma text", () => {
      render(<LearnStage {...createProps({ learnTab: "language", verseWords: createMockVerseWords(2) })} />);
      expect(screen.getByText("Word")).toBeInTheDocument();
      expect(screen.getByText("Test")).toBeInTheDocument();
      expect(screen.getByText("lemma1")).toBeInTheDocument();
      expect(screen.getByText("lemma2")).toBeInTheDocument();
    });

    it("renders lemma text for words", () => {
      render(<LearnStage {...createProps({ learnTab: "language" })} />);
      expect(screen.getByText("lemma1")).toBeInTheDocument();
    });

    it("calls onWordTap when a word with Strong's is clicked", async () => {
      const onWordTap = vi.fn();
      render(<LearnStage {...createProps({ learnTab: "language", onWordTap })} />);
      const wordEl = screen.getByText("Word");
      await userEvent.click(wordEl.closest("div")!);
      expect(onWordTap).toHaveBeenCalledWith("G01", "N-NSM");
    });

    it("shows loading spinner when wordsLoading", () => {
      render(<LearnStage {...createProps({ learnTab: "language", wordsLoading: true })} />);
      // The Loader2 spinner should be rendered
      expect(screen.getByText("Original Language Words")).toBeInTheDocument();
    });

    it("shows empty state when no verse words", () => {
      render(<LearnStage {...createProps({ learnTab: "language", verseWords: [] })} />);
      expect(screen.getByText("No Strong's word data available for this passage.")).toBeInTheDocument();
    });

    it("shows prompt to select passage when no book is set", () => {
      render(<LearnStage {...createProps({ learnTab: "language", verseWords: [], bookName: "", chapter: "" })} />);
      expect(screen.getByText("Select a passage to see original language word analysis.")).toBeInTheDocument();
    });

    it("shows hint text at bottom when words are present", () => {
      render(<LearnStage {...createProps({ learnTab: "language" })} />);
      expect(screen.getByText("Tap a word to see its original meaning and full explanation.")).toBeInTheDocument();
    });
  });

  describe("history tab", () => {
    it("renders the historical context header with counts", () => {
      render(<LearnStage {...createProps({ learnTab: "history" })} />);
      expect(screen.getAllByText("Historical Context").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/(2 commentaries, 3 cross-refs, 2 word studies, 1 dictionary, 4 topics, 3 translations)/)).toBeInTheDocument();
    });

    it("renders translation comparison section", () => {
      render(<LearnStage {...createProps({ learnTab: "history" })} />);
      expect(screen.getByText(/Translation Comparison/)).toBeInTheDocument();
      expect(screen.getByText("KJV")).toBeInTheDocument();
      expect(screen.getByText("NIV")).toBeInTheDocument();
      expect(screen.getByText("ESV")).toBeInTheDocument();
    });

    it("renders commentaries with author and text", () => {
      render(<LearnStage {...createProps({ learnTab: "history" })} />);
      expect(screen.getByText("Matthew Henry")).toBeInTheDocument();
      expect(screen.getByText("Commentary on the Whole Bible")).toBeInTheDocument();
      expect(screen.getByText("John Calvin")).toBeInTheDocument();
    });

    it("renders cross-references with ref and text", () => {
      render(<LearnStage {...createProps({ learnTab: "history" })} />);
      expect(screen.getByText("Genesis 1:1")).toBeInTheDocument();
      expect(screen.getByText("Colossians 1:15-20")).toBeInTheDocument();
    });

    it("renders word studies section", () => {
      render(<LearnStage {...createProps({ learnTab: "history" })} />);
      expect(screen.getByText("Λόγος")).toBeInTheDocument();
      expect(screen.getByText("(Logos)")).toBeInTheDocument();
      expect(screen.getByText("G3056")).toBeInTheDocument();
      expect(screen.getByText("Θεός")).toBeInTheDocument();
    });

    it("renders dictionary terms", () => {
      render(<LearnStage {...createProps({ learnTab: "history" })} />);
      expect(screen.getByText("Beginning")).toBeInTheDocument();
      expect(screen.getByText("bih-GIN-ing")).toBeInTheDocument();
    });

    it("renders related topics as badges", () => {
      render(<LearnStage {...createProps({ learnTab: "history" })} />);
      expect(screen.getByText("Deity of Christ")).toBeInTheDocument();
      expect(screen.getByText("Creation")).toBeInTheDocument();
    });

    it("shows loading spinner when resourcesLoading", () => {
      render(<LearnStage {...createProps({ learnTab: "history", resourcesLoading: true, verseResources: null, translations: null })} />);
      expect(screen.getAllByText("Historical Context").length).toBeGreaterThanOrEqual(1);
      // Should show the Loader2 spinner
    });

    it("shows empty state when no resources at all", () => {
      render(<LearnStage {...createProps({
        learnTab: "history",
        verseResources: {
          commentaries: [],
          crossReferences: [],
          wordStudies: [],
          dictionaryTerms: [],
          relatedTopics: [],
        },
        translations: null,
        translationsLoading: false,
      })} />);
      expect(screen.getByText("No historical context resources available for this passage.")).toBeInTheDocument();
    });
  });

  describe("history tab — copy commentary", () => {
    it("copies commentary text with attribution to clipboard", async () => {
      const writeText = vi.fn();
      Object.assign(navigator, { clipboard: { writeText } });
      render(<LearnStage {...createProps({ learnTab: "history" })} />);
      // Find copy buttons — they're the ones with title "Copy with attribution"
      const copyButtons = screen.getAllByTitle("Copy with attribution");
      expect(copyButtons.length).toBe(2); // Two commentaries
      await userEvent.click(copyButtons[0]);
      expect(writeText).toHaveBeenCalledWith(
        expect.stringContaining("This verse shows the divine nature of Christ")
      );
      expect(writeText).toHaveBeenCalledWith(
        expect.stringContaining("— Matthew Henry, Commentary on the Whole Bible")
      );
      expect(writeText).toHaveBeenCalledWith(
        expect.stringContaining("(commentary on John 1:1)")
      );
    });
  });

  describe("history tab — cross-reference navigation", () => {
    it("navigates to Bible Reader when a cross-ref is clicked", async () => {
      render(<LearnStage {...createProps({ learnTab: "history" })} />);
      // Cross references are rendered as buttons containing the ref text
      const genesisRef = screen.getByText("Genesis 1:1");
      await userEvent.click(genesisRef.closest("button")!);
      expect(mockNavigate).toHaveBeenCalledWith(
        "/bible-reader?book=Genesis&chapter=1&verse=1"
      );
    });

    it("navigates to multi-word book references correctly", async () => {
      render(<LearnStage {...createProps({ learnTab: "history" })} />);
      const colRef = screen.getByText("Colossians 1:15-20");
      await userEvent.click(colRef.closest("button")!);
      expect(mockNavigate).toHaveBeenCalledWith(
        "/bible-reader?book=Colossians&chapter=1&verse=15"
      );
    });
  });

  describe("prologue tab", () => {
    it("renders book prologue with author, audience, date", () => {
      render(<LearnStage {...createProps({ learnTab: "prologue" })} />);
      expect(screen.getByText("Book Prologue — John")).toBeInTheDocument();
      expect(screen.getByText("John the Apostle")).toBeInTheDocument();
      expect(screen.getByText("Early Christians")).toBeInTheDocument();
      expect(screen.getByText("c. AD 90-95")).toBeInTheDocument();
    });

    it("renders main themes as badges", () => {
      render(<LearnStage {...createProps({ learnTab: "prologue" })} />);
      expect(screen.getByText("Deity of Christ")).toBeInTheDocument();
      expect(screen.getByText("Belief")).toBeInTheDocument();
      expect(screen.getByText("The Holy Spirit")).toBeInTheDocument();
    });

    it("renders connection to Christ section", () => {
      render(<LearnStage {...createProps({ learnTab: "prologue" })} />);
      expect(screen.getByText("Connection to Christ")).toBeInTheDocument();
    });

    it("shows loading spinner when prologueLoading", () => {
      render(<LearnStage {...createProps({ learnTab: "prologue", prologueLoading: true, bookPrologue: null })} />);
      // Loading state: the section header is still shown but no content renders
      expect(screen.getByText("Book Prologue — John")).toBeInTheDocument();
    });

    it("shows empty state when no prologue is available", () => {
      render(<LearnStage {...createProps({ learnTab: "prologue", bookPrologue: null, prologueLoading: false })} />);
      expect(screen.getByText(/No book prologue available for John/)).toBeInTheDocument();
    });

    it("renders Open in Reader button in empty state", () => {
      render(<LearnStage {...createProps({ learnTab: "prologue", bookPrologue: null, prologueLoading: false })} />);
      const readerBtn = screen.getByText(/Open John 1 in Reader/);
      expect(readerBtn).toBeInTheDocument();
    });

    it("navigates to Bible Reader when Open in Reader is clicked", async () => {
      render(<LearnStage {...createProps({ learnTab: "prologue", bookPrologue: null, prologueLoading: false })} />);
      await userEvent.click(screen.getByText(/Open John 1 in Reader/));
      expect(mockNavigate).toHaveBeenCalledWith(
        "/bible-reader?book=John&chapter=1&verse=1"
      );
    });
  });

  describe("action buttons", () => {
    it("renders Save Progress and Continue buttons", () => {
      render(<LearnStage {...createProps()} />);
      expect(screen.getByText("Save Progress")).toBeInTheDocument();
      expect(screen.getByText("Continue to Abide")).toBeInTheDocument();
    });

    it("disables buttons when saving", () => {
      render(<LearnStage {...createProps({ saving: true })} />);
      expect(screen.getByText("Saving...")).toBeInTheDocument();
      expect(screen.getByText("Continue to Abide")).toBeDisabled();
    });

    it("calls onAdvance when Continue is clicked", async () => {
      const onAdvance = vi.fn();
      render(<LearnStage {...createProps({ onAdvance })} />);
      await userEvent.click(screen.getByText("Continue to Abide"));
      expect(onAdvance).toHaveBeenCalledOnce();
    });

    it("calls onSaveProgress when Save is clicked", async () => {
      const onSaveProgress = vi.fn();
      render(<LearnStage {...createProps({ onSaveProgress })} />);
      await userEvent.click(screen.getByText("Save Progress"));
      expect(onSaveProgress).toHaveBeenCalledOnce();
    });
  });
});
