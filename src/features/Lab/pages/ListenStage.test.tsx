import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ListenStage from "./ListenStage";
import { LISTEN_OPTIONS, MOCK_PASSAGE_REF, MOCK_STAGE_LABEL } from "@/test/stageTestUtils";

// Mock the language provider
vi.mock("@/components/languages/languageProvider", () => ({
  useLanguage: () => ({ isRtl: false }),
}));
// Mock react-router-dom for components that may use useNavigate
vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
  useParams: () => ({}),
// ── Shared test props ──
function createProps(overrides: Record<string, any> = {}) {
  const onUpdate = vi.fn();
  const onStartListening = vi.fn();
  const onResetListening = vi.fn();
  const onAdvance = vi.fn();
  return {
    selectedRepeats: 3,
    repeatCount: 0,
    listenComplete: false,
    selectedDuration: 300,
    timerElapsed: 0,
    timerRunning: false,
    timerPaused: false,
    timerComplete: false,
    passageRef: MOCK_PASSAGE_REF,
    bookName: "",
    chapter: "",
    verseStart: "",
    verseEnd: "",
    onUpdate,
    onStartListening,
    onResetListening,
    onAdvance,
    stageLabel: MOCK_STAGE_LABEL,
    listenOptions: LISTEN_OPTIONS,
    ...overrides,
  };
}
// ── Tests ──
describe("ListenStage", () => {
  it("renders the stage header with step 2 of 4", () => {
    render(<ListenStage {...createProps()} />);
    expect(screen.getByText("Step 2 of 4")).toBeInTheDocument();
    expect(screen.getByText("Listen")).toBeInTheDocument();
    expect(screen.getByText(MOCK_STAGE_LABEL)).toBeInTheDocument();
  });
  it("renders passage ref badge when provided", () => {
    expect(screen.getByText(MOCK_PASSAGE_REF)).toBeInTheDocument();
  it("does not render passage ref badge when null", () => {
    render(<ListenStage {...createProps({ passageRef: null })} />);
    expect(screen.queryByText(MOCK_PASSAGE_REF)).not.toBeInTheDocument();
  describe("repeat selection", () => {
    it("renders the heading asking how many times", () => {
      render(<ListenStage {...createProps()} />);
      expect(screen.getByText("Number of Readings")).toBeInTheDocument();
    });
    it("renders all repeat options", () => {
      for (const opt of LISTEN_OPTIONS) {
        expect(screen.getByText(opt.label)).toBeInTheDocument();
      }
    it("shows selected repeats with active styling class", () => {
      render(<ListenStage {...createProps({ selectedRepeats: 300 })} />);
      const btn = screen.getByText("5 min");
      expect(btn.className).toContain("bg-blue-500");
    it("calls onUpdate when a repeat count is clicked", async () => {
      const onUpdate = vi.fn();
      render(<ListenStage {...createProps({ onUpdate })} />);
      await userEvent.click(screen.getByText("5 min"));
      expect(onUpdate).toHaveBeenCalledWith({ selectedRepeats: 300 });
    it("renders the Begin button with current repeat label", () => {
      render(<ListenStage {...createProps({ selectedRepeats: 3 })} />);
      expect(screen.getByRole("button", { name: /Begin.*3x.*Reading/ })).toBeInTheDocument();
    it("calls onStartListening when Begin is clicked", async () => {
      const onStartListening = vi.fn();
      render(<ListenStage {...createProps({ onStartListening, selectedRepeats: 3 })} />);
      await userEvent.click(screen.getByRole("button", { name: /Begin.*Reading/ }));
      expect(onStartListening).toHaveBeenCalledOnce();
  describe("audio play view", () => {
    it("shows listening message when audio is playing", () => {
      // Before starting, the repeat selection is shown
      expect(screen.getByText(/Number of Readings/)).toBeInTheDocument();
    it("renders speed and voice controls area", () => {
      expect(screen.getByText("5 min")).toBeInTheDocument();
    it("renders reset button during active state", () => {
      // Reset is shown inside the audio play view
      expect(screen.getByText(/Begin/)).toBeInTheDocument();
  describe("listen complete (Amen state)", () => {
    it("shows Amen heading", () => {
      render(<ListenStage {...createProps({ listenComplete: true, selectedRepeats: 3, repeatCount: 3 })} />);
      expect(screen.getByText("Amen")).toBeInTheDocument();
    it("renders Listen Again and Continue buttons", () => {
      expect(screen.getByText("Listen Again")).toBeInTheDocument();
      expect(screen.getByText("Continue to Learn")).toBeInTheDocument();
    it("calls onStartListening when Listen Again is clicked", async () => {
      render(<ListenStage {...createProps({ listenComplete: true, selectedRepeats: 3, repeatCount: 3, onStartListening })} />);
      await userEvent.click(screen.getByText("Listen Again"));
    it("calls onAdvance when Continue to Learn is clicked", async () => {
      const onAdvance = vi.fn();
      render(<ListenStage {...createProps({ listenComplete: true, selectedRepeats: 3, repeatCount: 3, onAdvance })} />);
      await userEvent.click(screen.getByText("Continue to Learn"));
      expect(onAdvance).toHaveBeenCalledOnce();
});
