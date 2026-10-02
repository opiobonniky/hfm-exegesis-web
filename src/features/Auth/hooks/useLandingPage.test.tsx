import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, cleanup } from "@testing-library/react";
import { useLandingPage } from "./useLandingPage";
import { LANDING_FEATURED_PLANS } from "../constants/landing";

const { fetchLandingData } = vi.hoisted(() => ({ fetchLandingData: vi.fn() }));

vi.mock("react-router-dom", () => ({ useNavigate: () => vi.fn() }));
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ userInfo: null, loading: false }),
}));
vi.mock("./usePublicNav", () => ({
  usePublicNav: () => ({
    data: {
      menuItems: [],
      scrolled: false,
      mobileMenuOpen: false,
      menuPanelRef: { current: null },
      expandedMobileSection: null,
      activeNavKey: "home",
    },
    actions: {
      setMobileMenuOpen: vi.fn(),
      setExpandedMobileSection: vi.fn(),
      handleMenuClick: vi.fn(),
    },
  }),
}));
vi.mock("@/features/Auth/services/landingService", () => ({ fetchLandingData }));
vi.mock("../utils", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../utils")>();
  return {
    ...actual,
    scrollToSectionId: vi.fn(),
    getActiveSectionId: vi.fn(() => null),
  };
});

beforeEach(() => {
  fetchLandingData.mockReset();
});

afterEach(() => {
  cleanup();
});

describe("useLandingPage reading plans", () => {
  it("shows the curated plans until the request resolves", () => {
    fetchLandingData.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useLandingPage());
    expect(result.current.data.plans).toEqual(LANDING_FEATURED_PLANS);
  });

  it("swaps in backend plans once they arrive", async () => {
    fetchLandingData.mockResolvedValue({
      dailyVerse: null,
      tiers: [],
      stats: null,
      readingPlans: [
        {
          planId: "PLAN-9",
          title: "The Gospel of John",
          description: "Grow in knowing Jesus.",
          totalDays: 21,
          category: "New Testament",
          difficulty: null,
          questionsEnabled: false,
          participants: 40,
        },
      ],
    });

    const { result } = renderHook(() => useLandingPage());

    await waitFor(() => expect(result.current.data.plans).toHaveLength(1));
    expect(result.current.data.plans[0]).toEqual({
      title: "The Gospel of John",
      meta: "New Testament \u00b7 21 days",
      description: "Grow in knowing Jesus.",
    });
    expect(fetchLandingData).toHaveBeenCalledWith(3);
  });

  it("keeps the curated plans when the request fails", async () => {
    fetchLandingData.mockResolvedValue(null);
    const { result } = renderHook(() => useLandingPage());

    await waitFor(() => expect(fetchLandingData).toHaveBeenCalled());
    expect(result.current.data.plans).toEqual(LANDING_FEATURED_PLANS);
  });
});