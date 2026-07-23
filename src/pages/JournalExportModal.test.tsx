import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExportModal } from "./Journal";

// ── Mocks (using vi.hoisted to handle vitest hoisting) ──

const mockSendPostRequest = vi.hoisted(() => vi.fn());
const mockToast = vi.hoisted(() => vi.fn());

vi.mock("@/services/api", () => ({
  sendPostRequest: (...args: any[]) => mockSendPostRequest(...args),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: mockToast }),
  toast: mockToast,
}));

// Journal.tsx imports useNavigate — provide a mock for the module
vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
  useParams: () => ({}),
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => <a href={to}>{children}</a>,
}));

// ── Helpers ──

function renderModal(selectedIds?: number[]) {
  const onClose = vi.fn();
  const utils = render(<ExportModal onClose={onClose} selectedIds={selectedIds} />);
  return { onClose, ...utils };
}

function createMockResponse(overrides: Record<string, any> = {}) {
  return {
    returnCode: 200,
    returnData: {
      content: btoa("mock-content"),
      filename: "legacy-ledger-2025-01-01.txt",
      entryCount: 5,
      mimeType: "text/plain",
      ...overrides,
    },
  };
}

// ── Tests ──

describe("ExportModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Stub URL globally so all tests can create blob URLs
    vi.stubGlobal("URL", {
      createObjectURL: vi.fn(() => "blob:mock"),
      revokeObjectURL: vi.fn(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // ── Rendering ──

  describe("rendering", () => {
    it("renders the title 'Export Legacy Ledger' when no selectedIds", () => {
      renderModal();
      expect(screen.getByText("Export Legacy Ledger")).toBeInTheDocument();
    });

    it("renders 'Export N Selected Entries' when selectedIds is provided", () => {
      renderModal([1, 2, 3]);
      expect(screen.getByText("Export 3 Selected Entries")).toBeInTheDocument();
    });

    it("shows the correct description for all entries", () => {
      renderModal();
      expect(
        screen.getByText("Choose a format to export all your entries."),
      ).toBeInTheDocument();
    });

    it("shows the correct description for selected entries", () => {
      renderModal([1, 2, 3]);
      expect(
        screen.getByText("Choose a format to export 3 selected journal entries."),
      ).toBeInTheDocument();
    });

    it("renders all three format options (.pdf, .txt, .json)", () => {
      renderModal();
      expect(screen.getByText(".pdf")).toBeInTheDocument();
      expect(screen.getByText(".txt")).toBeInTheDocument();
      expect(screen.getByText(".json")).toBeInTheDocument();
      expect(screen.getByText("Formatted PDF")).toBeInTheDocument();
      expect(screen.getByText("Plain Text")).toBeInTheDocument();
      expect(screen.getByText("Structured Data")).toBeInTheDocument();
    });

    it("renders Cancel and Export buttons", () => {
      renderModal();
      expect(screen.getByText("Cancel")).toBeInTheDocument();
      expect(screen.getByText("Export")).toBeInTheDocument();
    });

    it("does not render selected count in title when selectedIds is empty array", () => {
      renderModal([]);
      expect(screen.getByText("Export Legacy Ledger")).toBeInTheDocument();
    });
  });

  // ── Format selection ──

  describe("format selection", () => {
    it("defaults to .txt format", () => {
      renderModal();
      const txtBtn = screen.getByText(".txt").closest("button");
      expect(txtBtn?.className).toContain("bg-stone-800");
    });

    it("switches to .pdf when clicked", async () => {
      renderModal();
      await userEvent.click(screen.getByText(".pdf"));
      const pdfBtn = screen.getByText(".pdf").closest("button");
      expect(pdfBtn?.className).toContain("bg-stone-800");
    });

    it("switches to .json when clicked", async () => {
      renderModal();
      await userEvent.click(screen.getByText(".json"));
      const jsonBtn = screen.getByText(".json").closest("button");
      expect(jsonBtn?.className).toContain("bg-stone-800");
    });
  });

  // ── Export API call ──

  describe("export API call", () => {
    it("calls sendPostRequest with format='txt' on Export click", async () => {
      mockSendPostRequest.mockResolvedValue(createMockResponse());
      renderModal();
      await userEvent.click(screen.getByText("Export"));
      expect(mockSendPostRequest).toHaveBeenCalledWith("journal", "export-all", {
        format: "txt",
      });
    });

    it("calls sendPostRequest with format='pdf' after switching format", async () => {
      mockSendPostRequest.mockResolvedValue(createMockResponse());
      renderModal();
      await userEvent.click(screen.getByText(".pdf"));
      await userEvent.click(screen.getByText("Export"));
      expect(mockSendPostRequest).toHaveBeenCalledWith("journal", "export-all", {
        format: "pdf",
      });
    });

    it("includes ids when selectedIds are provided", async () => {
      mockSendPostRequest.mockResolvedValue(createMockResponse());
      renderModal([10, 20, 30]);
      await userEvent.click(screen.getByText("Export"));
      expect(mockSendPostRequest).toHaveBeenCalledWith("journal", "export-all", {
        format: "txt",
        ids: [10, 20, 30],
      });
    });

    it("does not include ids when selectedIds is empty", async () => {
      mockSendPostRequest.mockResolvedValue(createMockResponse());
      renderModal([]);
      await userEvent.click(screen.getByText("Export"));
      expect(mockSendPostRequest).toHaveBeenCalledWith("journal", "export-all", {
        format: "txt",
      });
    });

    it("does not include ids when selectedIds is undefined", async () => {
      mockSendPostRequest.mockResolvedValue(createMockResponse());
      renderModal();
      await userEvent.click(screen.getByText("Export"));
      expect(mockSendPostRequest).toHaveBeenCalledWith("journal", "export-all", {
        format: "txt",
      });
    });
  });

  // ── Loading state ──

  describe("loading state", () => {
    it("shows exporting text and disables button while loading", async () => {
      mockSendPostRequest.mockReturnValue(new Promise(() => {}));
      renderModal();
      await userEvent.click(screen.getByText("Export"));
      expect(screen.getByText("Exporting...")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /exporting/i })).toBeDisabled();
    });
  });

  // ── Success ──

  describe("success", () => {
    it("calls onClose after successful export", async () => {
      mockSendPostRequest.mockResolvedValue(createMockResponse());
      const { onClose } = renderModal();
      await userEvent.click(screen.getByText("Export"));
      await waitFor(() => {
        expect(onClose).toHaveBeenCalledOnce();
      });
    });

    it("shows success toast with entry count", async () => {
      mockSendPostRequest.mockResolvedValue(
        createMockResponse({ entryCount: 12 }),
      );
      renderModal();
      await userEvent.click(screen.getByText("Export"));
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Exported",
          description: "Exported 12 entries as .txt",
        });
      });
    });

    it("shows success toast with .pdf format label", async () => {
      mockSendPostRequest.mockResolvedValue(
        createMockResponse({ entryCount: 3 }),
      );
      renderModal();
      await userEvent.click(screen.getByText(".pdf"));
      await userEvent.click(screen.getByText("Export"));
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Exported",
          description: "Exported 3 entries as .pdf",
        });
      });
    });
  });

  // ── Error handling ──

  describe("error handling", () => {
    it("shows error toast when API throws", async () => {
      mockSendPostRequest.mockRejectedValue(new Error("Network failure"));
      renderModal();
      await userEvent.click(screen.getByText("Export"));
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Export Failed",
          description: "Network failure",
          variant: "destructive",
        });
      });
    });

    it("falls back to generic message when error has no message", async () => {
      mockSendPostRequest.mockRejectedValue(new Error());
      renderModal();
      await userEvent.click(screen.getByText("Export"));
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Export Failed",
          description: "Failed to export entries",
          variant: "destructive",
        });
      });
    });

    it("does not show error toast for non-200 response (component ignores it)", async () => {
      mockSendPostRequest.mockResolvedValue({ returnCode: 500, returnMessage: "Server error" });
      renderModal();
      await userEvent.click(screen.getByText("Export"));
      // Component only shows errors for thrown exceptions, not non-200 responses
      expect(mockToast).not.toHaveBeenCalled();
    });
  });

  // ── Cancel button ──

  describe("cancel", () => {
    it("calls onClose when Cancel is clicked", async () => {
      const { onClose } = renderModal();
      await userEvent.click(screen.getByText("Cancel"));
      expect(onClose).toHaveBeenCalledOnce();
    });
  });

  // ── PDF binary handling (without spying on document.createElement) ──

  describe("PDF binary handling", () => {

    it("creates a PDF blob with application/pdf mime type", async () => {
      mockSendPostRequest.mockResolvedValue(
        createMockResponse({
          content: btoa("%PDF-1.4 mock-binary-data"),
          filename: "legacy-ledger-2025-01-01.pdf",
          mimeType: "application/pdf",
        }),
      );
      const { onClose } = renderModal();
      await userEvent.click(screen.getByText(".pdf"));
      await userEvent.click(screen.getByText("Export"));

      // Wait for export to complete
      await waitFor(() => {
        expect(onClose).toHaveBeenCalledOnce();
      });

      // Verify URL.createObjectURL was called with a PDF blob
      expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
      const blobArg = (URL.createObjectURL as any).mock.calls[0][0] as Blob;
      expect(blobArg.type).toBe("application/pdf");
    });

    it("revokes the blob URL after download completes", async () => {
      mockSendPostRequest.mockResolvedValue(
        createMockResponse({
          content: btoa("%PDF-1.4"),
          filename: "export.pdf",
          mimeType: "application/pdf",
        }),
      );
      renderModal();
      await userEvent.click(screen.getByText(".pdf"));
      await userEvent.click(screen.getByText("Export"));

      await waitFor(() => {
        expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock");
      });
    });

    it("generates a text blob for txt format (not PDF)", async () => {
      mockSendPostRequest.mockResolvedValue(
        createMockResponse({
          content: btoa("Hello World"),
          filename: "export.txt",
          mimeType: "text/plain",
        }),
      );
      renderModal();
      await userEvent.click(screen.getByText("Export"));

      await waitFor(() => {
        expect(URL.createObjectURL).toHaveBeenCalled();
      });

      const blobArg = (URL.createObjectURL as any).mock.calls[0][0] as Blob;
      expect(blobArg.type).toBe("text/plain");
    });
  });
});
