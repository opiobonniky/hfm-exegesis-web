import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useVerseExplanationList } from "./useVerseExplanationList";

const mocks = vi.hoisted(() => ({ request: vi.fn(), navigate: vi.fn(), toast: vi.fn(), state: null as any }));
vi.mock("@/features/Admin/services/adminApi", () => ({ adminApi: { request: mocks.request } }));
vi.mock("react-router-dom", () => ({
  useNavigate: () => mocks.navigate,
  useLocation: () => ({ state: mocks.state }),
}));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: mocks.toast }) }));
vi.mock("@/components/languages/hardcodedTranslate", () => ({ tt: (text: string) => text }));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.state = null;
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

it("waits for load more, appends nine rows at a time, and stops at the last page", async () => {
  mocks.request.mockImplementation(async (_route, _action, { page, pageSize }) => ({
    returnCode: 200,
    returnData: {
      explanations: Array.from({ length: pageSize }, (_, i) => ({ id: (page - 1) * pageSize + i + 1 })),
      totalCount: 18, totalPages: 2,
    },
  }));
  const { result } = renderHook(useVerseExplanationList);
  await waitFor(() => expect(result.current.data.data.items).toHaveLength(9));
  expect(mocks.request).toHaveBeenCalledTimes(1);
  act(() => {
    result.current.actions.loadMore();
    result.current.actions.loadMore();
  });
  await waitFor(() => expect(result.current.data.data.page).toBe(2));
  expect(mocks.request).toHaveBeenLastCalledWith(
    "bible", "get-all-verses-explanation", expect.objectContaining({ page: 2, pageSize: 9 }),
  );
  expect(result.current.data.data.items.map(item => item.id)).toEqual(Array.from({ length: 18 }, (_, index) => index + 1));
  expect(result.current.data.hasMore).toBe(false);
  act(() => result.current.actions.loadMore());
  expect(mocks.request).toHaveBeenCalledTimes(2);
});

it("replaces the accumulated rows when a filter changes during a next-page request", async () => {
  const response = (id: number) => ({ returnCode: 200, returnData: {
    explanations: [{ id }], totalCount: 18, totalPages: 2,
  } });
  let resolveNext: (value: ReturnType<typeof response>) => void;
  const pending = new Promise<ReturnType<typeof response>>(resolve => { resolveNext = resolve; });
  mocks.request
    .mockResolvedValueOnce(response(1))
    .mockReturnValueOnce(pending)
    .mockResolvedValueOnce(response(99));
  const { result } = renderHook(useVerseExplanationList);
  await waitFor(() => expect(result.current.data.data.items.map(item => item.id)).toEqual([1]));
  act(() => result.current.actions.loadMore());
  await waitFor(() => expect(mocks.request).toHaveBeenCalledTimes(2));
  act(() => result.current.actions.setBookName("John"));
  await waitFor(() => expect(result.current.data.data.items.map(item => item.id)).toEqual([99]));
  await act(async () => { resolveNext(response(10)); });
  expect(result.current.data.data.items.map(item => item.id)).toEqual([99]);
});

it("opens the detail by id and index in router state, not in the URL", async () => {
  const { result } = renderHook(useVerseExplanationList);
  await waitFor(() => expect(result.current.data.loading).toBe(false));

  act(() =>
    result.current.actions.viewItem(
      { id: 7, bookName: "Ecclesiastes", chapter: 3, verseNumber: 11 } as any,
      4,
    ),
  );
  expect(mocks.navigate).toHaveBeenCalledWith("/admin/verse-explanations/detail", {
    state: {
      id: 7,
      bookName: "Ecclesiastes",
      chapter: 3,
      verseNumber: 11,
      verseEnd: null,
      index: 4,
    },
  });

  act(() =>
    result.current.actions.editItem({
      id: 7,
      bookName: "Ecclesiastes",
      chapter: 3,
      verseNumber: 11,
    } as any),
  );
  expect(mocks.navigate).toHaveBeenCalledWith("/admin/add-verse-explanation", {
    state: { explanationId: 7 },
  });
});

it("exposes the row to restore when returning from a detail page", async () => {
  mocks.state = { restoreId: 7, restoreIndex: 4 };
  const { result } = renderHook(useVerseExplanationList);
  await waitFor(() => expect(result.current.data.loading).toBe(false));

  expect(result.current.data.restoreId).toBe(7);
  expect(result.current.data.restoreIndex).toBe(4);
});
