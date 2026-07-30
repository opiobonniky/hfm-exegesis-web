import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LearnStage from "./LearnStage";
import {
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

function createProps(overrides: Record<string, any> = {}) {
  const onUpdate = vi.fn();
  const onAdvance = vi.fn();
  const onSaveProgress = vi.fn();
  const onWordTap = vi.fn();
  return {
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
    isPublic: false,
    onUpdate,
    onAdvance,
    onSaveProgress,
    onWordTap,
    stageLabel: MOCK_STAGE_LABEL,
    ...overrides,
  };
}

async function expandCollapsible(sectionTitle: string) {
  const trigger = screen.getByText(sectionTitle);
  await userEvent.click(trigger.closest("button")!);
}

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

  describe("study notes", () => {
    it("renders study notes textarea always visible with placeholder", () => {
      render(<LearnStage {...createProps()} />);
      const textarea = screen.getByPlaceholderText("Write your study notes, observations, and insights...");
      expect(textarea).toBeInTheDocument();
    });

    it("displays existing notes", () => {
      render(<LearnStage {...createProps({ learnNotes: "Jesus is the Word." })} />);
      expect(screen.getByDisplayValue("Jesus is the Word.")).toBeInTheDocument();
    });

    it("calls onUpdate when notes change", async () => {
      const onUpdate = vi.fn();
      render(<LearnStage {...createProps({ onUpdate })} />);
      const textarea = screen.getByPlaceholderText("Write your study notes, observations, and insights...");
      await userEvent.type(textarea, "J");
      expect(onUpdate).toHaveBeenCalledWith({ learnNotes: "J" });
    });
  });

  describe("original language words collapsible", () => {
    it("shows collapsible trigger with word count", () => {
      render(<LearnStage {...createProps({ verseWords: createMockVerseWords(3) })} />);
      expect(screen.getByText("Original Language Words")).toBeInTheDocument();
    });

    it("shows loading spinner when wordsLoading", () => {
      render(<LearnStage {...createProps({ wordsLoading: true, verseWords: [] })} />);
      expect(screen.getByText("Original Language Words")).toBeInTheDocument();
    });

    it("does not render collapsible when no verse words", () => {
      render(<LearnStage {...createProps({ verseWords: [] })} />);
      expect(screen.queryByText("Original Language Words")).not.toBeInTheDocument();
    });

    it("renders verse word content when expanded", async () => {
      render(<LearnStage {...createProps({ verseWords: createMockVerseWords(2) })} />);
      await expandCollapsible("Original Language Words");
      expect(screen.getByText("Word")).toBeInTheDocument();
      expect(screen.getByText("Test")).toBeInTheDocument();
    });

    it("calls onWordTap when a word with Strong's is clicked", async () => {
      const onWordTap = vi.fn();
      render(<LearnStage {...createProps({ onWordTap })} />);
      await expandCollapsible("Original Language Words");
      const wordEl = screen.getByText("Word");
      await userEvent.click(wordEl.closest("div")!);
      expect(onWordTap).toHaveBeenCalledWith("G01", "N-NSM");
    });

    it("shows hint text at bottom when words are present and expanded", async () => {
      render(<LearnStage {...createProps({ verseWords: createMockVerseWords(1) })} />);
      await expandCollapsible("Original Language Words");
      expect(screen.getByText("Tap a word to explore its original meaning")).toBeInTheDocument();
    });
  });

  describe("translation comparison collapsible", () => {
    it("renders translations when expanded", async () => {
      render(<LearnStage {...createProps()} />);
      await expandCollapsible("Translation Comparison");
      expect(screen.getByText("KJV")).toBeInTheDocument();
      expect(screen.getByText("NIV")).toBeInTheDocument();
      expect(screen.getByText("ESV")).toBeInTheDocument();
    });
  });

  describe("commentaries collapsible", () => {
    it("renders commentaries when expanded", async () => {
      render(<LearnStage {...createProps()} />);
      await expandCollapsible("Commentaries");
      expect(screen.getByText("Matthew Henry")).toBeInTheDocument();
      expect(screen.getByText("Commentary on the Whole Bible")).toBeInTheDocument();
      expect(screen.getByText("John Calvin")).toBeInTheDocument();
    });

    it("copies commentary text with attribution to clipboard", async () => {
      const writeText = vi.fn();
      Object.assign(navigator, { clipboard: { writeText } });
      render(<LearnStage {...createProps()} />);
      await expandCollapsible("Commentaries");
      const copyButtons = screen.getAllByTitle("Copy with attribution");
      expect(copyButtons.length).toBe(2);
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

  describe("cross references collapsible", () => {
    it("renders cross-references when expanded", async () => {
      render(<LearnStage {...createProps()} />);
      await expandCollapsible("Cross References");
      expect(screen.getByText("Genesis 1:1")).toBeInTheDocument();
      expect(screen.getByText("Colossians 1:15-20")).toBeInTheDocument();
    });

    it("navigates to Bible Reader when a cross-ref is clicked", async () => {
      render(<LearnStage {...createProps()} />);
      await expandCollapsible("Cross References");
      const genesisRef = screen.getByText("Genesis 1:1");
      await userEvent.click(genesisRef.closest("button")!);
      expect(mockNavigate).toHaveBeenCalledWith(
        "/bible-reader?book=Genesis&chapter=1&verse=1"
      );
    });

    it("navigates to multi-word book references correctly", async () => {
      render(<LearnStage {...createProps()} />);
      await expandCollapsible("Cross References");
      const colRef = screen.getByText("Colossians 1:15-20");
      await userEvent.click(colRef.closest("button")!);
      expect(mockNavigate).toHaveBeenCalledWith(
        "/bible-reader?book=Colossians&chapter=1&verse=15"
      );
    });
  });

  describe("word studies collapsible", () => {
    it("renders word studies when expanded", async () => {
      render(<LearnStage {...createProps()} />);
      await expandCollapsible("Word Studies");
      expect(screen.getByText("Λόγος")).toBeInTheDocument();
      expect(screen.getByText("(Logos)")).toBeInTheDocument();
      expect(screen.getByText("G3056")).toBeInTheDocument();
      expect(screen.getByText("Θεός")).toBeInTheDocument();
    });
  });

  describe("dictionary terms collapsible", () => {
    it("renders dictionary terms when expanded", async () => {
      render(<LearnStage {...createProps()} />);
      await expandCollapsible("Dictionary Terms");
      expect(screen.getByText("Beginning")).toBeInTheDocument();
      expect(screen.getByText("bih-GIN-ing")).toBeInTheDocument();
    });
  });

  describe("related topics collapsible", () => {
    it("renders related topics as badges when expanded", async () => {
      render(<LearnStage {...createProps()} />);
      await expandCollapsible("Related Topics");
      expect(screen.getByText("Deity of Christ")).toBeInTheDocument();
      expect(screen.getByText("Creation")).toBeInTheDocument();
    });
  });

  describe("book prologue collapsible", () => {
    it("renders book prologue with author, audience, date when expanded", async () => {
      render(<LearnStage {...createProps()} />);
      await expandCollapsible("Book Prologue");
      expect(screen.getByText("John the Apostle")).toBeInTheDocument();
      expect(screen.getByText("Early Christians")).toBeInTheDocument();
      expect(screen.getByText("c. AD 90-95")).toBeInTheDocument();
    });

    it("renders main themes as badges when expanded", async () => {
      render(<LearnStage {...createProps()} />);
      await expandCollapsible("Book Prologue");
      expect(screen.getByText("Deity of Christ")).toBeInTheDocument();
      expect(screen.getByText("Belief")).toBeInTheDocument();
      expect(screen.getByText("The Holy Spirit")).toBeInTheDocument();
    });

    it("renders connection to Christ section when expanded", async () => {
      render(<LearnStage {...createProps()} />);
      await expandCollapsible("Book Prologue");
      expect(screen.getByText("Connection to Christ")).toBeInTheDocument();
    });

    it("shows loading spinner when prologueLoading", () => {
      render(<LearnStage {...createProps({ prologueLoading: true, bookPrologue: null })} />);
      // The collapsible trigger is still shown
      expect(screen.getByText("Book Prologue")).toBeInTheDocument();
    });

    it("shows empty state when no prologue is available and expanded", async () => {
      render(<LearnStage {...createProps({ bookPrologue: null, prologueLoading: false })} />);
      await expandCollapsible("Book Prologue");
      expect(screen.getByText(/No book prologue available for John/)).toBeInTheDocument();
    });

    it("renders Open in Reader button in empty state and expanded", async () => {
      render(<LearnStage {...createProps({ bookPrologue: null, prologueLoading: false })} />);
      await expandCollapsible("Book Prologue");
      const readerBtn = screen.getByText(/Open John 1 in Reader/);
      expect(readerBtn).toBeInTheDocument();
    });

    it("navigates to Bible Reader when Open in Reader is clicked", async () => {
      render(<LearnStage {...createProps({ bookPrologue: null, prologueLoading: false })} />);
      await expandCollapsible("Book Prologue");
      await userEvent.click(screen.getByText(/Open John 1 in Reader/));
      expect(mockNavigate).toHaveBeenCalledWith(
        "/bible-reader?book=John&chapter=1&verse=1"
      );
    });
  });

  describe("action buttons", () => {
    it("renders Save and Continue buttons", () => {
      render(<LearnStage {...createProps()} />);
      expect(screen.getByText("Save")).toBeInTheDocument();
      expect(screen.getByText("Continue to Abide")).toBeInTheDocument();
    });

    it('shows "Private" text by default', () => {
      render(<LearnStage {...createProps({ isPublic: false })} />);
      expect(screen.getByText(/Private/)).toBeInTheDocument();
    });

    it('shows "Public" text when isPublic is true', () => {
      render(<LearnStage {...createProps({ isPublic: true })} />);
      expect(screen.getByText(/Public/)).toBeInTheDocument();
    });

    it("calls onUpdate with isPublic toggle on click", async () => {
      const onUpdate = vi.fn();
      render(<LearnStage {...createProps({ isPublic: false, onUpdate })} />);
      await userEvent.click(screen.getByText(/Private/));
      expect(onUpdate).toHaveBeenCalledWith({ isPublic: true });
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
      await userEvent.click(screen.getByText("Save"));
      expect(onSaveProgress).toHaveBeenCalledOnce();
    });
  });
});
