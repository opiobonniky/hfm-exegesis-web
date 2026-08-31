// ─── Admin Daily Content Constants ────────────────────────────────────────────

export type ContentType = "verse" | "devotion" | "exegesis";

export const CONTENT_TYPE_LABELS: Record<ContentType, { label: string; plural: string; icon: string }> = {
  verse: { label: "Daily Verse", plural: "Daily Verses", icon: "Sun" },
  devotion: { label: "Daily Devotion", plural: "Daily Devotions", icon: "Sprout" },
  exegesis: { label: "Daily Exegesis", plural: "Daily Exegesis", icon: "BookOpen" },
};

export const TAB_VALUE_MAP: Record<string, ContentType> = {
  verses: "verse",
  devotions: "devotion",
  exegesis: "exegesis",
};

export const CONTENT_TABS = [
  { value: "verses", label: "Daily Verses", icon: "Sun" },
  { value: "devotions", label: "Devotions", icon: "Sprout" },
  { value: "exegesis", label: "Exegesis", icon: "BookOpen" },
] as const;

export const API_ACTIONS = {
  getVerseAll: "get-all-daily-verses",
  addAction: (type: ContentType) => {
    const prefix = type === "verse" ? "daily-verse" : type === "devotion" ? "daily-devotion" : "daily-exegesis";
    return `add-${prefix}`;
  },
  deleteAction: (type: ContentType) => {
    const prefix = type === "verse" ? "daily-verse" : type === "devotion" ? "daily-devotion" : "daily-exegesis";
    return `delete-${prefix}`;
  },
  getAction: (type: ContentType, action: string) => {
    const prefix = type === "verse" ? "daily-verse" : type === "devotion" ? "daily-devotion" : "daily-exegesis";
    if (type === "verse" && action === "get-all") return "get-all-daily-verses";
    return `${action}-${prefix}`;
  },
} as const;

export const DELETE_ID_KEY: Record<ContentType, string> = {
  verse: "verseId",
  devotion: "devotionId",
  exegesis: "exegesisId",
};

export const PAGE_SIZE = 12;

export const EXEGESIS_PAGE_SIZE = 20;

export const DAILY_CONTENT_ADD_ROUTES: Record<string, string> = {
  verses: "/add-daily-verse",
  devotions: "/add-daily-devotion",
  exegesis: "/add-daily-exegesis",
};

export const DAILY_CONTENT_VIEW_ROUTES: Record<string, string> = {
  verses: "/daily-verse-detail",
  devotions: "/daily-devotion-detail",
  exegesis: "/daily-exegesis-detail",
};
