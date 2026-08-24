import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LookStage from "./LookStage";
import { LOOK_PROMPTS, MOCK_PASSAGE_REF, MOCK_STAGE_LABEL, createMockVerseWords } from "@/test/stageTestUtils";
import type { Verse } from "@/services/bibleApi";

const MOCK_VERSES: Verse[] = [
  { verseNumber: 1, text: "In the beginning was the Word, and the Word was with God, and the Word was God." },
  { verseNumber: 2, text: "He was with God in the beginning." },
  { verseNumber: 3, text: "Through him all things were made." },
];
const MOCK_VERSE_WORDS = createMockVerseWords(3);
// ── Shared test props ──
function createProps(overrides: Record<string, any> = {}) {
  const onUpdate = vi.fn();
  const onAdvance = vi.fn();
  const onSaveProgress = vi.fn();
  const onWordTap = vi.fn();
  return {
    lookNotes: "",
    currentPromptIdx: 0,
    passageRef: MOCK_PASSAGE_REF,
    passageVerses: [],
    versesLoading: false,
    verseWords: [],
    wordsLoading: false,
    onWordTap,
    saving: false,
    onUpdate,
    onAdvance,
    onSaveProgress,
    stageLabel: MOCK_STAGE_LABEL,
    lookPrompts: LOOK_PROMPTS,
    ...overrides,
  };
}
// ── Tests ──
describe("LookStage", () => {
  it("renders the stage header with step 1 of 4", () => {
    render(<LookStage {...createProps()} />);
    expect(screen.getByText("Step 1 of 4")).toBeInTheDocument();
    expect(screen.getByText("Look")).toBeInTheDocument();
    expect(screen.getByText(MOCK_STAGE_LABEL)).toBeInTheDocument();
  });
  it("renders the passage ref badge when provided", () => {
    expect(screen.getByText(MOCK_PASSAGE_REF)).toBeInTheDocument();
  it("does not render passage ref badge when null", () => {
    render(<LookStage {...createProps({ passageRef: null })} />);
    expect(screen.queryByText(MOCK_PASSAGE_REF)).not.toBeInTheDocument();
  it("renders the current prompt text", () => {
    expect(screen.getByText(LOOK_PROMPTS[0])).toBeInTheDocument();
  it("shows prompt counter with current/total", () => {
    expect(screen.getByText(`${LOOK_PROMPTS.length}`)).toBeInTheDocument();
  it("shows updated prompt counter when on second prompt", () => {
    render(<LookStage {...createProps({ currentPromptIdx: 1 })} />);
  it("renders the observations textarea with placeholder", () => {
    const textarea = screen.getByPlaceholderText("Write what you observe in response to the prompt above...");
    expect(textarea).toBeInTheDocument();
  it("displays existing notes in the textarea", () => {
    render(<LookStage {...createProps({ lookNotes: "God is revealed as creator." })} />);
    expect(screen.getByDisplayValue("God is revealed as creator.")).toBeInTheDocument();
  it("calls onUpdate when textarea changes", async () => {
    const onUpdate = vi.fn();
    render(<LookStage {...createProps({ onUpdate })} />);
    await userEvent.type(textarea, "A");
    expect(onUpdate).toHaveBeenCalledWith({ lookNotes: "A" });
  it("calls onUpdate with previous prompt index on left arrow click", async () => {
    render(<LookStage {...createProps({ onUpdate, currentPromptIdx: 1 })} />);
    await userEvent.click(screen.getByTestId("look-prev-prompt"));
    expect(onUpdate).toHaveBeenCalledWith({ currentPromptIdx: 0 });
  it("calls onUpdate with next prompt index on right arrow click", async () => {
    await userEvent.click(screen.getByTestId("look-next-prompt"));
    expect(onUpdate).toHaveBeenCalledWith({ currentPromptIdx: 1 });
  it("disables left arrow on first prompt", () => {
    render(<LookStage {...createProps({ currentPromptIdx: 0 })} />);
    expect(screen.getByTestId("look-prev-prompt")).toBeDisabled();
  it("disables right arrow on last prompt", () => {
    const lastIdx = LOOK_PROMPTS.length - 1;
    render(<LookStage {...createProps({ currentPromptIdx: lastIdx })} />);
    expect(screen.getByTestId("look-next-prompt")).toBeDisabled();
  it("renders Save Progress and Continue buttons", () => {
    expect(screen.getByText("Save")).toBeInTheDocument();
    expect(screen.getByText("Continue")).toBeInTheDocument();
  it("disables buttons when saving", () => {
    render(<LookStage {...createProps({ saving: true })} />);
    expect(screen.getByText("Saving...")).toBeInTheDocument();
    expect(screen.getByText("Continue")).toBeDisabled();
  it("calls onAdvance when Continue is clicked", async () => {
    const onAdvance = vi.fn();
    render(<LookStage {...createProps({ onAdvance })} />);
    await userEvent.click(screen.getByText("Continue"));
    expect(onAdvance).toHaveBeenCalledOnce();
  it("calls onSaveProgress when Save is clicked", async () => {
    const onSaveProgress = vi.fn();
    render(<LookStage {...createProps({ onSaveProgress })} />);
    await userEvent.click(screen.getByText("Save"));
    expect(onSaveProgress).toHaveBeenCalledOnce();
  // ── Verse display card tests ──
  it("shows loading spinner when versesLoading is true", () => {
    render(<LookStage {...createProps({ versesLoading: true })} />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  it("renders verse numbers and text when passageVerses is provided", () => {
    render(<LookStage {...createProps({ passageVerses: MOCK_VERSES })} />);
    // Each verse number should be rendered
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    // Each verse text should be rendered
    expect(screen.getByText("In the beginning was the Word, and the Word was with God, and the Word was God.")).toBeInTheDocument();
    expect(screen.getByText("He was with God in the beginning.")).toBeInTheDocument();
    expect(screen.getByText("Through him all things were made.")).toBeInTheDocument();
  it("shows error message when passageRef is set but verses are empty", () => {
    render(<LookStage {...createProps({ passageVerses: [] })} />);
    expect(screen.getByText("Could not load passage text.")).toBeInTheDocument();
  it("does not show verses card or error when passageRef is null", () => {
    render(<LookStage {...createProps({ passageRef: null, passageVerses: [] })} />);
    expect(screen.queryByText("Could not load passage text.")).not.toBeInTheDocument();
    // The prompt card and textarea should still render
    expect(screen.getByPlaceholderText("Write what you observe in response to the prompt above...")).toBeInTheDocument();
  // ── Strong's word click tests ──
  it("renders Strong's words section with word count", () => {
    render(<LookStage {...createProps({ passageVerses: MOCK_VERSES, verseWords: MOCK_VERSE_WORDS })} />);
    expect(screen.getByText("Original Language Words")).toBeInTheDocument();
    expect(screen.getByText("3 words available for quick lookup")).toBeInTheDocument();
    expect(screen.getByText("Word")).toBeInTheDocument();
    expect(screen.getByText("Test")).toBeInTheDocument();
    expect(screen.getByText("Sample")).toBeInTheDocument();
  it("shows Strong's lemma text for words with data", () => {
    // Each mock word has lemma text
    expect(screen.getByText("lemma1")).toBeInTheDocument();
    expect(screen.getByText("lemma2")).toBeInTheDocument();
    expect(screen.getByText("lemma3")).toBeInTheDocument();
  it("calls onWordTap with strongsId and morphology when a word is clicked", async () => {
    const onWordTap = vi.fn();
    render(<LookStage {...createProps({ passageVerses: MOCK_VERSES, verseWords: MOCK_VERSE_WORDS, onWordTap })} />);
    // First word has surfaceText="Word", strongsId="G01", morphology="N-NSM"
    const wordEl = screen.getByText("Word");
    await userEvent.click(wordEl.closest("div")!);
    expect(onWordTap).toHaveBeenCalledWith("G01", "N-NSM");
  it("calls onWordTap for each clickable word", async () => {
    // Click each word by its surfaceText
    await userEvent.click(screen.getByText("Word").closest("div")!);
    await userEvent.click(screen.getByText("Test").closest("div")!);
    await userEvent.click(screen.getByText("Sample").closest("div")!);
    expect(onWordTap).toHaveBeenCalledTimes(3);
    expect(onWordTap).toHaveBeenCalledWith("G02", null);
    expect(onWordTap).toHaveBeenCalledWith("G03", null);
  it("shows lemma text for words", () => {
  it("shows empty state when no Strong's words are available", () => {
    render(<LookStage {...createProps({ passageVerses: MOCK_VERSES, verseWords: [] })} />);
    // Strong's words section only shows when verseWords has data
    expect(screen.queryByText("Original Language Words")).not.toBeInTheDocument();
  it("shows hint text when words are present", () => {
    expect(screen.getByText("Click a word to explore its original meaning")).toBeInTheDocument();
});
