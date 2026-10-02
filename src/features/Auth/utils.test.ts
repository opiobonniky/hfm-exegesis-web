import { describe, it, expect } from "vitest";
import {
  buildTierOverrides,
  formatPlanMeta,
  mapLandingPlans,
  resolveTierNames,
} from "./utils";
import type { LandingReadingPlan, LandingTier } from "@/features/Auth/services/landingService";

const plan = (overrides: Partial<LandingReadingPlan> = {}): LandingReadingPlan => ({
  planId: "PLAN-1",
  title: "Romans: Righteousness by Faith",
  description: "Follow Paul's argument.",
  totalDays: 30,
  category: "New Testament",
  difficulty: "beginner",
  questionsEnabled: false,
  participants: 12,
  ...overrides,
});

const tier = (overrides: Partial<LandingTier> = {}): LandingTier => ({
  id: "legacy_sower",
  name: "Legacy Sower",
  description: "Full study toolkit",
  price: 33.33,
  currency: "usd",
  interval: "year",
  maxSlots: 1000,
  features: ["Reading plans"],
  sortOrder: 2,
  ...overrides,
});

describe("formatPlanMeta", () => {
  it("joins the category and the day count", () => {
    expect(formatPlanMeta(plan())).toBe("New Testament \u00b7 30 days");
  });

  it("drops the separator when the plan has no category", () => {
    expect(formatPlanMeta(plan({ category: null }))).toBe("30 days");
  });
});

describe("mapLandingPlans", () => {
  it("maps api plans onto the landing card shape", () => {
    const result = mapLandingPlans([plan()]);
    expect(result).toEqual([
      {
        title: "Romans: Righteousness by Faith",
        meta: "New Testament \u00b7 30 days",
        description: "Follow Paul's argument.",
      },
    ]);
  });

  it("supplies a default description when the plan has none", () => {
    const result = mapLandingPlans([plan({ description: null })]);
    expect(result?.[0].description).toBe("Open this plan to see the daily passages.");
  });

  it("returns null so callers keep curated copy for empty payloads", () => {
    expect(mapLandingPlans([])).toBeNull();
    expect(mapLandingPlans(null)).toBeNull();
    expect(mapLandingPlans([plan({ title: "   " })])).toBeNull();
  });
});

describe("buildTierOverrides", () => {
  it("converts yearly prices into a monthly cent amount", () => {
    const overrides = buildTierOverrides([tier()]);
    expect(overrides.legacy_sower).toMatchObject({
      name: "Legacy Sower",
      description: "Full study toolkit",
      monthlyPrice: 278,
      slotLimit: 1000,
    });
  });

  it("prefers the monthly row when Stripe publishes one", () => {
    const overrides = buildTierOverrides([
      tier(),
      tier({ id: "legacy_sower_monthly", interval: "month", price: 3.99 }),
    ]);
    expect(overrides.legacy_sower.monthlyPrice).toBe(399);
    expect(overrides.legacy_sower.name).toBe("Legacy Sower");
  });

  it("keeps a zero-priced free tier free", () => {
    const overrides = buildTierOverrides([
      tier({ id: "free", name: "Free", description: null, price: 0, interval: "none", maxSlots: null }),
    ]);
    expect(overrides.free).toEqual({ name: "Free", slotLimit: null });
  });

  it("ignores malformed tiers and empty payloads", () => {
    expect(buildTierOverrides([])).toEqual({});
    expect(buildTierOverrides(null)).toEqual({});
    expect(buildTierOverrides([tier({ price: Number.NaN })])).toEqual({});
  });
});

describe("resolveTierNames", () => {
  const fallbacks = ["Free Reader", "Legacy Sower", "Covenant Sower"];

  it("replaces the fallback names with backend names by tier id", () => {
    const names = resolveTierNames(
      [
        tier({ id: "free", name: "Free", price: 0, interval: "none" }),
        tier({ id: "covenant_sower", name: "Covenant Supporter" }),
      ],
      fallbacks,
    );
    expect(names).toEqual(["Free", "Legacy Sower", "Covenant Supporter"]);
  });

  it("keeps every fallback when nothing came back", () => {
    expect(resolveTierNames([], fallbacks)).toEqual(fallbacks);
  });
});