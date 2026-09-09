import type { DailyExegesisFull } from "../types";

export const DAILY_EXEGESIS_FALLBACK: DailyExegesisFull = {
  id: 0,
  title: "The Word That Leads Us Home",
  passageReference: "John 15:4-5",
  introduction: "Daily Exegesis will appear here once it is published.",
  contextSummary:
    "This placeholder keeps the screen useful while content is being prepared.",
  teachingBody:
    "The Lordsbook Daily Exegesis is designed to give the reader a focused passage, a short explanation, and a clear path into prayer and application.",
  application:
    "Read slowly, ask what the passage reveals about God, and write one faithful response in your journal.",
  prayer: "Lord, open my eyes to Your Word and teach me to abide faithfully today.",
  tags: "daily,exegesis",
  displayDate: new Date().toISOString(),
  createdOn: new Date().toISOString(),
  isPublished: true,
};

export const DAILY_EXEGESIS_SECTIONS = [
  { key: "introduction", title: "Introduction" },
  { key: "contextSummary", title: "Context Summary" },
  { key: "teachingBody", title: "Teaching" },
  { key: "application", title: "Application" },
  { key: "prayer", title: "Prayer" },
] as const;
