import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AbideStage from "./AbideStage";
import { MOCK_PASSAGE_REF, MOCK_STAGE_LABEL } from "@/test/stageTestUtils";

// Mock the language provider
vi.mock("@/components/languages/languageProvider", () => ({
  useLanguage: () => ({ isRtl: false }),
}));
// ── Shared test props ──
function createProps(overrides: Record<string, any> = {}) {
  const onUpdate = vi.fn();
  const onSaveAbide = vi.fn();
  const onSaveProgress = vi.fn();
  return {
    reflection: "",
    prayer: "",
    appText: "",
    tags: "",
    isPublic: false,
    passageRef: MOCK_PASSAGE_REF,
    saving: false,
    onUpdate,
    onSaveAbide,
    onSaveProgress,
    stageLabel: MOCK_STAGE_LABEL,
    ...overrides,
  };
}
// ── Tests ──
describe("AbideStage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  describe("header", () => {
    it("renders the stage header with step 4 of 4", () => {
      render(<AbideStage {...createProps()} />);
      expect(screen.getByText("Step 4 of 4")).toBeInTheDocument();
      expect(screen.getByText("Abide")).toBeInTheDocument();
      expect(screen.getByText(MOCK_STAGE_LABEL)).toBeInTheDocument();
    });
    it("renders passage ref badge when provided", () => {
      expect(screen.getByText(MOCK_PASSAGE_REF)).toBeInTheDocument();
    it("does not render passage ref badge when null", () => {
      render(<AbideStage {...createProps({ passageRef: null })} />);
      expect(screen.queryByText(MOCK_PASSAGE_REF)).not.toBeInTheDocument();
  describe("reflection textarea", () => {
    it("renders reflection label and placeholder", () => {
      expect(screen.getByText("My Reflection")).toBeInTheDocument();
      const textarea = screen.getByPlaceholderText("Write what God has revealed to you through this study...");
      expect(textarea).toBeInTheDocument();
    it("displays existing reflection text", () => {
      render(<AbideStage {...createProps({ reflection: "God is faithful." })} />);
      expect(screen.getByDisplayValue("God is faithful.")).toBeInTheDocument();
    it("calls onUpdate when reflection changes", async () => {
      const onUpdate = vi.fn();
      render(<AbideStage {...createProps({ onUpdate })} />);
      await userEvent.type(textarea, "G");
      expect(onUpdate).toHaveBeenCalledWith({ reflection: "G" });
  describe("prayer textarea", () => {
    it("renders prayer label and placeholder", () => {
      expect(screen.getByText("My Prayer")).toBeInTheDocument();
      const textarea = screen.getByPlaceholderText("Write your prayer response to what you've read...");
    it("displays existing prayer text", () => {
      render(<AbideStage {...createProps({ prayer: "Lord, thank you." })} />);
      expect(screen.getByDisplayValue("Lord, thank you.")).toBeInTheDocument();
    it("calls onUpdate when prayer changes", async () => {
      await userEvent.type(textarea, "L");
      expect(onUpdate).toHaveBeenCalledWith({ prayer: "L" });
  describe("application textarea", () => {
    it("renders application label and placeholder", () => {
      expect(screen.getByText("Practical Step")).toBeInTheDocument();
      const textarea = screen.getByPlaceholderText("Write one concrete action you will take in response to God's Word...");
    it("displays existing application text", () => {
      render(<AbideStage {...createProps({ appText: "I will pray daily." })} />);
      expect(screen.getByDisplayValue("I will pray daily.")).toBeInTheDocument();
    it("calls onUpdate when application changes", async () => {
      await userEvent.type(textarea, "I");
      expect(onUpdate).toHaveBeenCalledWith({ appText: "I" });
  describe("tags input", () => {
    it("renders tags label and input", () => {
      expect(screen.getByText("Tags")).toBeInTheDocument();
      const input = screen.getByPlaceholderText("#Faith #Grace #John #EternalLife");
      expect(input).toBeInTheDocument();
    it("displays existing tags", () => {
      render(<AbideStage {...createProps({ tags: "#Faith #Hope" })} />);
      expect(screen.getByDisplayValue("#Faith #Hope")).toBeInTheDocument();
    it("calls onUpdate when tags change", async () => {
      await userEvent.type(input, "#");
      expect(onUpdate).toHaveBeenCalledWith({ tags: "#" });
  describe("privacy toggle", () => {
    it('shows "Private" text by default', () => {
      render(<AbideStage {...createProps({ isPublic: false })} />);
      expect(screen.getByText("Private Study")).toBeInTheDocument();
    it('shows "Public" text when isPublic is true', () => {
      render(<AbideStage {...createProps({ isPublic: true })} />);
      expect(screen.getByText("Public Study")).toBeInTheDocument();
    it("calls onUpdate with isPublic toggle on click", async () => {
      render(<AbideStage {...createProps({ onUpdate, isPublic: false })} />);
      await userEvent.click(screen.getByText("Private Study"));
      expect(onUpdate).toHaveBeenCalledWith({ isPublic: true });
    it("calls onUpdate to make private when clicking public", async () => {
      render(<AbideStage {...createProps({ onUpdate, isPublic: true })} />);
      await userEvent.click(screen.getByText("Public Study"));
      expect(onUpdate).toHaveBeenCalledWith({ isPublic: false });
  describe("action buttons", () => {
    it("renders Save and Save Ledger buttons", () => {
      expect(screen.getByText("Save")).toBeInTheDocument();
      expect(screen.getByText("Save Ledger")).toBeInTheDocument();
    it("disables buttons when saving", () => {
      render(<AbideStage {...createProps({ saving: true })} />);
      const savingButtons = screen.getAllByText("Saving...");
      expect(savingButtons).toHaveLength(2);
      savingButtons.forEach((btn) => expect(btn).toBeDisabled());
    it("calls onSaveProgress when Save is clicked", async () => {
      const onSaveProgress = vi.fn();
      render(<AbideStage {...createProps({ onSaveProgress })} />);
      await userEvent.click(screen.getByText("Save"));
      expect(onSaveProgress).toHaveBeenCalledOnce();
    it("calls onSaveAbide when Save Ledger is clicked", async () => {
      const onSaveAbide = vi.fn();
      render(<AbideStage {...createProps({ onSaveAbide })} />);
      await userEvent.click(screen.getByText("Save Ledger"));
      expect(onSaveAbide).toHaveBeenCalledOnce();
});
