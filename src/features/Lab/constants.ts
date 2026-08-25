// LabFlow constants — chapter counts, stage config, passage suggestions
import { Eye, Ear, Heart, BookText } from "lucide-react";

export const STAGE_ICONS: Record<string, any> = {
  look: Eye, listen: Ear, learn: BookText, abide: Heart,
};

export const STAGE_LABELS: Record<string, string> = {
  look: "Look", listen: "Listen", learn: "Learn", abide: "Abide",
};

export const STAGE_PURPOSE: Record<string, string> = {
  look: "Observe carefully — notice details, patterns, and striking elements in the text.",
  listen: "Read slowly and attentively — let the words settle into your heart.",
  learn: "Study deeply — explore the meaning, context, and connections.",
  abide: "Reflect and respond — what is God saying to you through this passage?",
};

export const STAGE_TIME: Record<string, string> = {
  look: "~10 min", listen: "~5 min", learn: "~15 min", abide: "~10 min",
};

export const SUGGESTED_PASSAGES = [
  { ref: "John 1:1", label: "The Word", desc: "In the beginning was the Word" },
  { ref: "Psalm 23:1", label: "The Shepherd", desc: "The LORD is my shepherd" },
  { ref: "Genesis 1:1", label: "Creation", desc: "In the beginning God created" },
  { ref: "Romans 8:28", label: "All Things", desc: "All things work together" },
  { ref: "Philippians 4:13", label: "Strength", desc: "I can do all things" },
  { ref: "Isaiah 40:31", label: "Renewal", desc: "They that wait upon the LORD" },
];

export const MAX_CHAPTERS: Record<string, number> = {
  Genesis: 50, Exodus: 40, Leviticus: 27, Numbers: 36, Deuteronomy: 34,
  Joshua: 24, Judges: 21, Ruth: 4, "1 Samuel": 31, "2 Samuel": 24,
  "1 Kings": 22, "2 Kings": 25, "1 Chronicles": 29, "2 Chronicles": 36,
  Ezra: 10, Nehemiah: 13, Esther: 10, Job: 42, Psalms: 150,
  Proverbs: 31, Ecclesiastes: 12, "Song of Solomon": 8, Isaiah: 66,
  Jeremiah: 52, Lamentations: 5, Ezekiel: 48, Daniel: 12, Hosea: 14,
  Joel: 3, Amos: 9, Obadiah: 1, Jonah: 4, Micah: 7, Nahum: 3,
  Habakkuk: 3, Zephaniah: 3, Haggai: 2, Zechariah: 14, Malachi: 4,
  Matthew: 28, Mark: 16, Luke: 24, John: 21, Acts: 28,
  Romans: 16, "1 Corinthians": 16, "2 Corinthians": 13, Galatians: 6,
  Ephesians: 6, Philippians: 4, Colossians: 4, "1 Thessalonians": 5,
  "2 Thessalonians": 3, "1 Timothy": 6, "2 Timothy": 4, Titus: 3,
  Philemon: 1, Hebrews: 13, James: 5, "1 Peter": 5, "2 Peter": 3,
  "1 John": 5, "2 John": 1, "3 John": 1, Jude: 1, Revelation: 22,
};
