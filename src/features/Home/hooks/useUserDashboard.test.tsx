import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, cleanup } from "@testing-library/react";
import { useUserDashboard } from "./useUserDashboard";

// ── Mocks ──

vi.mock("react-router-dom", () => ({ useNavigate: () => vi.fn() }));
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ userInfo: { firstName: "Test" } }),
}));
vi.mock("@/components/languages/languageProvider", () => ({
  useLanguage: () => ({ isRtl: false }),
}));

const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => { resolve = r; });
  return { promise, resolve };
};

const ok = (returnData: unknown) => ({ returnCode: 200, returnData } as never);
const failed = { returnCode: 500, returnMessage: "boom", success: false } as never;

const { homeApi, getCurrentSession } = vi.hoisted(() => ({
  homeApi: {
    getTodaysVerse: vi.fn(),
    getUserDashboard: vi.fn(),
    getUserPlans: vi.fn(),
    getJournalStats: vi.fn(),
    getReadHistory: vi.fn(),
    getLatestJournal: vi.fn(),
    getRecentActivity: vi.fn(),
    getTodaysExegesis: vi.fn(),
    getTodaysDevotion: vi.fn(),
  },
  getCurrentSession: vi.fn(),
}));

vi.mock("../services/homeApi", () => ({ homeApi }));
vi.mock("@/services/exegesisApi", () => ({ getCurrentSession }));

const resetApi = () => {
  homeApi.getTodaysVerse.mockReset().mockResolvedValue(ok({ id: 1, bookName: "John", chapter: 3, verseNumber: 16 }));
  homeApi.getUserDashboard.mockReset().mockResolvedValue(ok({ chaptersRead: 12, highlights: 3, notes: 1, favorites: 2 }));
  homeApi.getUserPlans.mockReset().mockResolvedValue(ok([{ planId: "p1" }]));
  homeApi.getJournalStats.mockReset().mockResolvedValue(ok({ totalEntries: 4 }));
  homeApi.getReadHistory.mockReset().mockResolvedValue(ok({ readHistories: [] }));
  homeApi.getLatestJournal.mockReset().mockResolvedValue(ok({ entries: [] }));
  homeApi.getRecentActivity.mockReset().mockResolvedValue(ok([{ id: 7, type: "highlight", book: "John" }]));
  homeApi.getTodaysExegesis.mockReset().mockResolvedValue(ok({ title: "Exegesis" }));
  homeApi.getTodaysDevotion.mockReset().mockResolvedValue(ok({ title: "Devotion" }));
  getCurrentSession.mockReset().mockResolvedValue(null);
};

describe("useUserDashboard loading", () => {
  beforeEach(resetApi);
  afterEach(() => { cleanup(); vi.useRealTimers(); });

  it("stops loading without waiting for the slow deferred requests", async () => {
    // Session / exegesis / devotion never settle: the page must still paint.
    getCurrentSession.mockReturnValue(deferred<null>().promise);
    homeApi.getTodaysExegesis.mockReturnValue(deferred<never>().promise);
    homeApi.getTodaysDevotion.mockReturnValue(deferred<never>().promise);

    const { result } = renderHook(() => useUserDashboard());
    expect(result.current.data.loading).toBe(true);

    await act(async () => { await Promise.resolve(); });

    expect(result.current.data.loading).toBe(false);
    expect(result.current.data.dailyVerse?.bookName).toBe("John");
  });

  it("gives up on the skeleton after the cap when the critical batch is slow", async () => {
    vi.useFakeTimers();
    const stuck = deferred<never>();
    homeApi.getTodaysVerse.mockReturnValue(stuck.promise);

    const { result } = renderHook(() => useUserDashboard());
    expect(result.current.data.loading).toBe(true);

    await act(async () => { await vi.advanceTimersByTimeAsync(1200); });
    expect(result.current.data.loading).toBe(false);

    // Stats still stream in once the slow request finally lands.
    await act(async () => {
      stuck.resolve(ok({ id: 2, bookName: "Psalms", chapter: 23 }));
      await Promise.resolve();
    });
    expect(result.current.data.dailyVerse?.bookName).toBe("Psalms");
    expect(result.current.data.stats.chaptersRead).toBe(12);
  });

  it("still populates the rest of the dashboard when reading plans returns a non-array payload", async () => {
    homeApi.getUserPlans.mockResolvedValue({ returnCode: 200, returnData: { plans: [{ planId: "p9" }] } });

    const { result } = renderHook(() => useUserDashboard());
    await act(async () => { await Promise.resolve(); });

    expect(result.current.data.readingPlans).toHaveLength(1);
    expect(result.current.data.stats.chaptersRead).toBe(12);
    expect(result.current.data.recentActivity).toHaveLength(1);
  });

  it("keeps the dashboard usable when a critical request fails", async () => {
    homeApi.getUserDashboard.mockResolvedValue(failed);
    homeApi.getTodaysVerse.mockResolvedValue(failed);

    const { result } = renderHook(() => useUserDashboard());
    await act(async () => { await Promise.resolve(); });

    expect(result.current.data.loading).toBe(false);
    expect(result.current.data.stats).toEqual({ chaptersRead: 0, highlights: 0, notes: 0, favorites: 0, journalEntries: 0 });
  });

  it("populates deferred cards as they arrive", async () => {
    const session = deferred<{ id: string; completed: boolean }>();
    getCurrentSession.mockReturnValue(session.promise);

    const { result } = renderHook(() => useUserDashboard());
    await act(async () => { await Promise.resolve(); });
    expect(result.current.data.dailyExegesis?.title).toBe("Exegesis");
    expect(result.current.data.dailyDevotion?.title).toBe("Devotion");
    expect(result.current.data.currentSession).toBeNull();

    await act(async () => {
      session.resolve({ id: "s1", completed: false });
      await Promise.resolve();
    });
    expect(result.current.data.currentSession?.id).toBe("s1");
  });
});
