import { tt } from '@/components/languages/hardcodedTranslate';
// ─── Admin Daily Content Constants ────────────────────────────────────────────

export type ContentType = "verse" | "devotion" | "exegesis";

export const CONTENT_TYPE_LABELS: Record<
  ContentType,
  { label: string; plural: string; icon: string }
> = {
  verse: { label: tt("Daily Verse"), plural: "Daily Verses", icon: "Sun" },
  devotion: {
    label: tt("Daily Devotion"),
    plural: "Daily Devotions",
    icon: "Sprout",
  },
  exegesis: {
    label: tt("Daily Exegesis"),
    plural: "Daily Exegesis",
    icon: "BookOpen",
  },
};


export const API_ACTIONS = {
  getVerseAll: "get-all-daily-verses",
  addAction: (type: ContentType) => {
    const prefix =
      type === "verse"
        ? "daily-verse"
        : type === "devotion"
          ? "daily-devotion"
          : "daily-exegesis";
    return `add-${prefix}`;
  },
  deleteAction: (type: ContentType) => {
    const prefix =
      type === "verse"
        ? "daily-verse"
        : type === "devotion"
          ? "daily-devotion"
          : "daily-exegesis";
    return `delete-${prefix}`;
  },
  getAction: (type: ContentType, action: string) => {
    const prefix =
      type === "verse"
        ? "daily-verse"
        : type === "devotion"
          ? "daily-devotion"
          : "daily-exegesis";
    if (type === "verse" && action === "get-all") return "get-all-daily-verses";
    if (type === "devotion" && action === "get-all")
      return "get-all-daily-devotions";
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
