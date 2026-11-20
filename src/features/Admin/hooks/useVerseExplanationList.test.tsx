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

it("requests nine items and replaces the rows when moving between pages", async () => {
  mocks.request.mockImplementation(async (_route, _action, { page, pageSize }) => ({
    returnCode: 200,
    returnData: {
      explanations: Array.from({ length: pageSize }, (_, i) => ({ id: (page - 1) * pageSize + i + 1 })),
      totalCount: 18, totalPages: 2,
    },
  }));
  const { result } = renderHook(useVerseExplanationList);
  await waitFor(() => expect(result.current.data.data.items).toHaveLength(9));
  act(() => result.current.actions.goToPage(2));
  await waitFor(() => expect(result.current.data.data.page).toBe(2));
  expect(mocks.request).toHaveBeenLastCalledWith(
    "bible", "get-all-verses-explanation", expect.objectContaining({ page: 2, pageSize: 9 }),
  );
  expect(result.current.data.data.items.map(item => item.id)).toEqual([10, 11, 12, 13, 14, 15, 16, 17, 18]);
});
