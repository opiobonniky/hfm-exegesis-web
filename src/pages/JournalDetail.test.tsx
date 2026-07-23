import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import JournalDetailPage from "./JournalDetail";

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

vi.mock("@/components/languages/languageProvider", () => ({
  useLanguage: () => ({
    t: {
      common: { error: "Error", share: "Share", edit: "Edit", delete: "Delete", copy: "Copy", cancel: "Cancel" },
      journal: {
        backToJournal: "Back to Journal",
        journalEntry: "Journal Entry",
        entryNotFound: "Entry not found",
        failedToLoadEntry: "Failed to load entry",
      },
    },
    isRtl: false,
    lang: "en",
    setLanguage: vi.fn(),
    isLoading: false,
  }),
}));

vi.mock("@/utilities/bibleUtils", () => ({
  getVerseText: vi.fn(() => "For God so loved the world..."),
}));

vi.mock("@/components/Routes/routes", () => ({
  routes: {
    journal: { path: "/journal" },
    newJournalEntry: { path: "/journal/new" },
  },
}));

// ── Mock entry data ──

const MOCK_ENTRY = {
  id: 1,
  title: "My Journal Entry",
  content: "Today I studied the Bible...",
  bookName: "John",
  chapter: 3,
  verseNumber: 16,
  category: "study",
  mood: "grateful",
  prayers: "Lord, guide me.",
  gratitude: "Thankful for family.",
  learnings: "God's love is unconditional.",
  application: "Show love to others.",
  isPublished: false,
  isFavorite: true,
  tags: "bible,study,prayer",
  createdOn: "2025-06-15T10:30:00.000Z",
  updatedOn: "2025-06-15T14:00:00.000Z",
};

// ── Helpers ──

function renderDetail(entryId: string = "1") {
  return render(
    <MemoryRouter initialEntries={[`/journal/view/${entryId}`]}>
      <Routes>
        <Route path="/journal/view/:entryId" element={<JournalDetailPage />} />
        <Route path="/journal" element={<div>Journal List Page</div>} />
        <Route path="/journal/entry/:entryId" element={<div>Edit Entry Page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

function createMockPdfResponse() {
  return {
    returnCode: 200,
    returnData: {
      content: btoa("%PDF-1.4 mock-data"),
      filename: "john-2025-06-15.pdf",
      mimeType: "application/pdf",
    },
  };
}

describe("JournalDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSendPostRequest.mockResolvedValue({
      returnCode: 200,
      returnData: MOCK_ENTRY,
    });
    vi.stubGlobal("URL", {
      createObjectURL: vi.fn(() => "blob:mock-pdf"),
      revokeObjectURL: vi.fn(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // ── Loading state ──

  describe("loading state", () => {
    it("shows loading skeleton while fetching", () => {
      mockSendPostRequest.mockReturnValue(new Promise(() => {}));
      renderDetail();
      expect(document.querySelector(".animate-pulse")).toBeTruthy();
    });
  });

  // ── Journal entry rendering ──

  describe("rendering", () => {
    it("renders the journal entry title", async () => {
      renderDetail();
      expect(await screen.findByText("My Journal Entry")).toBeInTheDocument();
    });

    it("renders the journal entry content", async () => {
      renderDetail();
      expect(
        await screen.findByText("Today I studied the Bible..."),
      ).toBeInTheDocument();
    });

    it("renders the PDF download button", async () => {
      renderDetail();
      const pdfBtn = await screen.findByTitle("Download PDF");
      expect(pdfBtn).toBeInTheDocument();
    });

    it("renders other action buttons (favorite, share, copy)", async () => {
      renderDetail();
      expect(await screen.findByTitle("Favorite")).toBeInTheDocument();
      expect(await screen.findByTitle("Share")).toBeInTheDocument();
      expect(await screen.findByTitle("Copy")).toBeInTheDocument();
    });
  });

  // ── PDF download interaction ──

  describe("PDF download", () => {
    it("calls sendPostRequest with correct params on download click", async () => {
      mockSendPostRequest.mockResolvedValueOnce({
        returnCode: 200,
        returnData: MOCK_ENTRY,
      });
      renderDetail();
      await screen.findByText("My Journal Entry");

      mockSendPostRequest.mockResolvedValueOnce(createMockPdfResponse());
      await userEvent.click(screen.getByTitle("Download PDF"));

      expect(mockSendPostRequest).toHaveBeenCalledWith("journal", "export-one", {
        id: 1,
        format: "pdf",
      });
    });

    it("shows generating toast before download", async () => {
      mockSendPostRequest.mockResolvedValueOnce({
        returnCode: 200,
        returnData: MOCK_ENTRY,
      });
      renderDetail();
      await screen.findByText("My Journal Entry");

      mockSendPostRequest.mockResolvedValueOnce(createMockPdfResponse());
      await userEvent.click(screen.getByTitle("Download PDF"));

      expect(mockToast).toHaveBeenCalledWith({
        title: "Generating PDF...",
      });
    });

    it("shows success toast after download", async () => {
      mockSendPostRequest.mockResolvedValueOnce({
        returnCode: 200,
        returnData: MOCK_ENTRY,
      });
      renderDetail();
      await screen.findByText("My Journal Entry");

      mockSendPostRequest.mockResolvedValueOnce(createMockPdfResponse());
      await userEvent.click(screen.getByTitle("Download PDF"));

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Downloaded",
        });
      });
    });

    it("creates a PDF blob with correct mime type", async () => {
      mockSendPostRequest.mockResolvedValueOnce({
        returnCode: 200,
        returnData: MOCK_ENTRY,
      });
      renderDetail();
      await screen.findByText("My Journal Entry");

      mockSendPostRequest.mockResolvedValueOnce(createMockPdfResponse());
      await userEvent.click(screen.getByTitle("Download PDF"));

      await waitFor(() => {
        expect(URL.createObjectURL).toHaveBeenCalled();
      });

      const blobArg = (URL.createObjectURL as any).mock.calls[0][0] as Blob;
      expect(blobArg.type).toBe("application/pdf");
    });

    it("shows error toast on API failure", async () => {
      mockSendPostRequest.mockResolvedValueOnce({
        returnCode: 200,
        returnData: MOCK_ENTRY,
      });
      renderDetail();
      await screen.findByText("My Journal Entry");

      mockSendPostRequest.mockRejectedValueOnce(new Error("PDF generation failed"));
      await userEvent.click(screen.getByTitle("Download PDF"));

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Error",
          variant: "destructive",
        });
      });
    });

    it("revokes the blob URL after download", async () => {
      mockSendPostRequest.mockResolvedValueOnce({
        returnCode: 200,
        returnData: MOCK_ENTRY,
      });
      renderDetail();
      await screen.findByText("My Journal Entry");

      mockSendPostRequest.mockResolvedValueOnce(createMockPdfResponse());
      await userEvent.click(screen.getByTitle("Download PDF"));

      await waitFor(() => {
        expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-pdf");
      });
    });
  });

  // ── Error state ──

  describe("error state", () => {
    it("shows error toast when entry fetch fails", async () => {
      mockSendPostRequest.mockResolvedValueOnce({
        returnCode: 404,
        returnMessage: "Entry not found",
      });
      renderDetail();

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Error",
          description: "Entry not found",
          variant: "destructive",
        });
      });
    });
  });
});
