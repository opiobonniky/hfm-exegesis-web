import api from "@/services/api";

/** Tier shape returned by the landing module. Mirrors SubscriptionTier. */
export interface LandingTier {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  interval: string;
  maxSlots: number | null;
  features: string[];
  sortOrder: number;
}

export interface LandingVerse {
  bookName: string;
  chapter: number;
  verseNumber: number;
  reference: string;
  bibleVersion: string | null;
  reflection: string | null;
  explanation: string | null;
  learnMore: string | null;
  application: string | null;
  displayDate: string;
}

export interface LandingReadingPlan {
  planId: string;
  title: string;
  description: string | null;
  totalDays: number;
  category: string | null;
  difficulty: string | null;
  questionsEnabled: boolean;
  participants: number;
}

export interface LandingStats {
  activeReadingPlans: number;
  publishedVerses: number;
  publishedDevotions: number;
  verseExplanations: number;
  strongsWords: number;
  bibleTopics: number;
  bookPrologues: number;
}

export interface LandingPayload {
  dailyVerse: LandingVerse | null;
  readingPlans: LandingReadingPlan[];
  tiers: LandingTier[];
  stats: LandingStats | null;
}

interface LandingEnvelope<T> {
  returnCode?: number;
  returnMessage?: string;
  returnData?: T;
}

/**
 * Ask the backend for content that is editable by an admin (daily verse,
 * reading plans, subscription tiers, stats). Always request English: the
 * public pages are translated in the DOM by the Google Translate element
 * (`tt()` marks English source strings), so server-side translations would be
 * translated a second time.
 */
const post = async <T>(request: string, data: object = {}): Promise<T | null> => {
  try {
    const response = await api.post<LandingEnvelope<T>>(
      `/landing/${request}`,
      { ...data, lang: "en" },
    );
    const body = response.data;
    if (body?.returnCode !== 200 || !body.returnData) return null;
    return body.returnData;
  } catch (error) {
    console.error(`❌ POST landing/${request} failed`, error);
    return null;
  }
};

const isTier = (value: unknown): value is LandingTier =>
  !!value && typeof value === "object" && typeof (value as LandingTier).id === "string";

const isPlan = (value: unknown): value is LandingReadingPlan =>
  !!value &&
  typeof value === "object" &&
  typeof (value as LandingReadingPlan).planId === "string";

/**
 * Single call for the whole landing page. Returns null on failure so callers
 * can keep rendering the static fallback instead of an empty page.
 */
export const fetchLandingData = async (limit?: number): Promise<LandingPayload | null> => {
  const data = await post<LandingPayload>("get-landing", limit ? { limit } : {});
  if (!data) return null;
  return {
    dailyVerse: data.dailyVerse ?? null,
    readingPlans: Array.isArray(data.readingPlans)
      ? data.readingPlans.filter(isPlan)
      : [],
    tiers: Array.isArray(data.tiers) ? data.tiers.filter(isTier) : [],
    stats: data.stats ?? null,
  };
};

export const fetchLandingTiers = async (): Promise<LandingTier[]> => {
  const data = await post<{ tiers?: LandingTier[] }>("get-tiers");
  return Array.isArray(data?.tiers) ? data.tiers.filter(isTier) : [];
};

