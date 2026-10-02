import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, cleanup } from "@testing-library/react";
import { usePublicPlanTiers } from "./usePublicPlanTiers";
import { PLAN_TIER_NAMES } from "../constants";

const { fetchLandingTiers } = vi.hoisted(() => ({
  fetchLandingTiers: vi.fn(),
}));

vi.mock("@/features/Auth/services/landingService", () => ({ fetchLandingTiers }));

const tier = (overrides: Record<string, unknown> = {}) => ({
  id: "legacy_sower",
  name: "Legacy Sower",
  description: "Full study toolkit",
  price: 3.99,
  currency: "usd",
  interval: "month",
  maxSlots: 1000,
  features: ["Reading plans"],
  sortOrder: 2,
  ...overrides,
});

beforeEach(() => {
  fetchLandingTiers.mockReset();
});

afterEach(() => {
  cleanup();
});

describe("usePublicPlanTiers", () => {
  it("keeps static names until tiers arrive", () => {
    fetchLandingTiers.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => usePublicPlanTiers());
    expect(result.current.data.tierNames).toEqual(PLAN_TIER_NAMES);
    expect(result.current.data.hasLiveTiers).toBe(false);
  });

  it("overrides names and pricing from the backend", async () => {
    fetchLandingTiers.mockResolvedValue([
      tier({ id: "free", name: "Free Reader", description: null, price: 0, interval: "none", maxSlots: null }),
      tier(),
    ]);

    const { result } = renderHook(() => usePublicPlanTiers());

    await waitFor(() => expect(result.current.data.hasLiveTiers).toBe(true));
    expect(result.current.data.tierOverrides.legacy_sower).toMatchObject({
      name: "Legacy Sower",
      monthlyPrice: 399,
      slotLimit: 1000,
    });
    expect(result.current.data.tierOverrides.free).toEqual({
      name: "Free Reader",
      slotLimit: null,
    });
    expect(result.current.data.tierNames[0]).toBe("Free Reader");
  });

  it("stays on static values when the request fails", async () => {
    fetchLandingTiers.mockResolvedValue([]);
    const { result } = renderHook(() => usePublicPlanTiers());

    await waitFor(() => expect(fetchLandingTiers).toHaveBeenCalled());
    expect(result.current.data.tierNames).toEqual(PLAN_TIER_NAMES);
    expect(result.current.data.tierOverrides).toEqual({});
  });
});