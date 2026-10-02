// Constants for Subscription feature
import { tt } from "@/components/languages/hardcodedTranslate";
import type { PlanMatrixCategory } from "./types";

export const SUBSCRIPTION_TIERS = [
  { id: "free", name: "Free", price: 0 },
  { id: "sower", name: "Sower", price: 9.99 },
  { id: "builder", name: "Builder", price: 19.99 },
] as const;

export type SubscriptionTierId = typeof SUBSCRIPTION_TIERS[number]["id"];

export const PUBLIC_PLAN_MATRIX: PlanMatrixCategory[] = [
  {
    category: tt("Reading"),
    items: [{ label: tt("Bible Reader (all translations)"), free: true, legacy: true, covenant: true }],
  },
  {
    category: tt("Study Tools"),
    items: [
      { label: tt("Basic Search"), free: true, legacy: true, covenant: true },
      { label: tt("Strong's / Topics / Lemma Search"), free: false, legacy: true, covenant: true },
      { label: tt("Cross-Translation Search"), free: false, legacy: true, covenant: true },
      { label: tt("Exegesis Lab (full 4 stages)"), free: false, legacy: true, covenant: true },
      { label: tt("Reading Plans with progress"), free: false, legacy: true, covenant: true },
    ],
  },
  {
    category: tt("Journaling"),
    items: [
      { label: tt("Basic Notes"), free: true, legacy: true, covenant: true },
      { label: tt("Legacy Ledger (full journal)"), free: false, legacy: true, covenant: true },
      { label: tt("Journal Export"), free: false, legacy: true, covenant: true },
    ],
  },
  {
    category: tt("Sermons & Analytics"),
    items: [
      { label: tt("Explain Bible & Study Notes"), free: false, legacy: true, covenant: true },
      { label: tt("Prayers & Reflection"), free: false, legacy: false, covenant: true },
      { label: tt("Advanced Analytics"), free: false, legacy: false, covenant: true },
      { label: tt("Early Access Features"), free: false, legacy: false, covenant: true },
    ],
  },
];

export const PLAN_TIER_NAMES = [tt("Free Reader"), tt("Legacy Sower"), tt("Covenant Sower")];

export const FEATURED_TIER_INDEX = 1;
