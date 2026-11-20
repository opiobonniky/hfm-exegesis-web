import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useVerseExplanationList } from "./useVerseExplanationList";

const mocks = vi.hoisted(() => ({ request: vi.fn(), navigate: vi.fn(), toast: vi.fn() }));
vi.mock("@/features/Admin/services/adminApi", () => ({ adminApi: { request: mocks.request } }));
vi.mock("react-router-dom", () => ({ useNavigate: () => mocks.navigate }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: mocks.toast }) }));
vi.mock("@/components/languages/hardcodedTranslate", () => ({ tt: (text: string) => text }));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.request.mockResolvedValue({
    returnCode: 200,
    returnData: { explanations: [], totalCount: 0, totalPages: 0 },
  });
});
afterEach(cleanup);

it("sends book, chapter and author filters and resets to the first page", async () => {
  const { result } = renderHook(useVerseExplanationList);
  await waitFor(() => expect(result.current.data.loading).toBe(false));

  act(() => result.current.actions.setBookName("John"));
  await waitFor(() =>
    expect(mocks.request).toHaveBeenLastCalledWith(
      "bible",
      "get-all-verses-explanation",
      expect.objectContaining({ page: 1, bookName: "John" }),
    ),
  );

  act(() => result.current.actions.setChapter("3"));
  await waitFor(() =>
    expect(mocks.request).toHaveBeenLastCalledWith(
      "bible",
      "get-all-verses-explanation",
      expect.objectContaining({ page: 1, bookName: "John", chapter: "3" }),
    ),
  );

  act(() => result.current.actions.setCreatorName("John"));
  await waitFor(() =>
    expect(mocks.request).toHaveBeenLastCalledWith(
      "bible",
      "get-all-verses-explanation",
      expect.objectContaining({
        page: 1,
        bookName: "John",
        chapter: "3",
        creatorName: "John",
      }),
    ),
  );

  act(() => result.current.actions.clearFilters());
  await waitFor(() =>
    expect(mocks.request).toHaveBeenLastCalledWith(
      "bible",
      "get-all-verses-explanation",
      expect.not.objectContaining({ bookName: expect.anything(), chapter: expect.anything(), creatorName: expect.anything() }),
    ),
  );
});

it("includes the debounced text search alongside the filters", async () => {
  const { result } = renderHook(useVerseExplanationList);
  act(() => result.current.actions.setSearch("John"));
  await waitFor(() =>
    expect(mocks.request).toHaveBeenLastCalledWith(
      "bible",
      "get-all-verses-explanation",
      expect.objectContaining({ search: "John" }),
    ),
  );
});
