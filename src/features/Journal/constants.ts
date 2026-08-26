// ─── Journal Constants ────────────────────────────────────────────────────────

export const CATEGORIES = [
  { value: "all", key: "categoryAll" },
  { value: "general", key: "categoryGeneral" },
  { value: "study", key: "categoryStudy" },
  { value: "prayer", key: "categoryPrayer" },
  { value: "gratitude", key: "categoryGratitude" },
  { value: "reflection", key: "categoryReflection" },
  { value: "application", key: "categoryApplication" },
];

export const MOODS = [
  { value: "happy", key: "moodHappy", emoji: "😊" },
  { value: "grateful", key: "moodGrateful", emoji: "🙏" },
  { value: "peaceful", key: "moodPeaceful", emoji: "🕊️" },
  { value: "thoughtful", key: "moodThoughtful", emoji: "🤔" },
  { value: "motivated", key: "moodMotivated", emoji: "💪" },
  { value: "hopeful", key: "moodHopeful", emoji: "🌟" },
  { value: "challenged", key: "moodChallenged", emoji: "🧗" },
  { value: "blessed", key: "moodBlessed", emoji: "✨" },
];

export const MOOD_EMOJIS: Record<string, string> = {
  happy: "😊", grateful: "🙏", peaceful: "🕊️", thoughtful: "🤔",
  motivated: "💪", hopeful: "🌟", challenged: "🧗", blessed: "✨",
};

export const CATEGORY_COLORS: Record<string, string> = {
  study: "bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300",
  prayer: "bg-violet-100 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300",
  gratitude: "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300",
  reflection: "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300",
  application: "bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300",
  general: "bg-muted text-muted-foreground",
};

export const BOOK_NAMES = [
  "Genesis","Exodus","Leviticus","Numbers","Deuteronomy","Joshua","Judges","Ruth",
  "1 Samuel","2 Samuel","1 Kings","2 Kings","1 Chronicles","2 Chronicles","Ezra","Nehemiah",
  "Esther","Job","Psalms","Proverbs","Ecclesiastes","Song of Solomon","Isaiah","Jeremiah",
  "Lamentations","Ezekiel","Daniel","Hosea","Joel","Amos","Obadiah","Jonah","Micah","Nahum",
  "Habakkuk","Zephaniah","Haggai","Zechariah","Malachi","Matthew","Mark","Luke","John","Acts",
  "Romans","1 Corinthians","2 Corinthians","Galatians","Ephesians","Philippians","Colossians",
  "1 Thessalonians","2 Thessalonians","1 Timothy","2 Timothy","Titus","Philemon","Hebrews",
  "James","1 Peter","2 Peter","1 John","2 John","3 John","Jude","Revelation",
];

export const TESTAMENTS = [
  { value: "Old", labelKey: "oldTestament" },
  { value: "New", labelKey: "newTestament" },
];

export function getCategoryLabel(t: any, catValue: string): string {
  if (catValue === "all") return t.journal?.categoryAll || "All";
  const cat = CATEGORIES.find((c) => c.value === catValue);
  return (t.journal as any)?.[cat?.key || ""] || catValue;
}

export function getRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
