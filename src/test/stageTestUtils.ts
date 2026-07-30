import type { StrongsWordData } from "@/services/strongsApi";
import type { BookPrologue } from "@/services/bookProloguesApi";
import type { VerseResourceData, TranslationComparisonEntry } from "@/services/verseResourcesApi";

// ── LookStage ──

export const LOOK_PROMPTS = [
  "What does this passage reveal about God's character?",
  "What does this passage reveal about humanity?",
  "How does this passage point to Christ?",
];

// ── ListenStage ──

export const LISTEN_OPTIONS = [
  { label: "2 min", value: 120 },
  { label: "5 min", value: 300 },
  { label: "10 min", value: 600 },
  { label: "20 min", value: 1200 },
];

// ── LearnStage ──

export const LEARN_TABS = [
  { key: "exegesis", label: "Study Notes" },
  { key: "language", label: "Original Language" },
  { key: "history", label: "Historical Context" },
  { key: "prologue", label: "Book Prologue" },
];

export function createMockVerseWords(count = 3): StrongsWordData[] {
  return Array.from({ length: count }, (_, i) => ({
    verseNumber: i + 1,
    wordOrder: i,
    surfaceText: ["Word", "Test", "Sample"][i] || "Word",
    strongsId: `G0${i + 1}`,
    lemma: `lemma${i + 1}`,
    morphology: i === 0 ? "N-NSM" : null,
    hasData: true,
  }));
}

export function createMockBookPrologue(): BookPrologue {
  return {
    bookName: "John",
    author: "John the Apostle",
    audience: "Early Christians",
    dateWritten: "c. AD 90-95",
    locationWritten: "Ephesus",
    purpose: "That you may believe that Jesus is the Christ, the Son of God.",
    keyTheme: "Believe and have life in His name",
    summary: "The Gospel of John presents Jesus as the divine Son of God.",
    mainThemes: ["Deity of Christ", "Belief", "Eternal Life", "The Holy Spirit"],
    christConnection: "Jesus is presented as the eternal Word made flesh.",
  };
}

export const MOCK_VERSE_RESOURCES: VerseResourceData = {
  id: 0,
  bookName: "John",
  chapter: 1,
  verseStart: 1,
  verseEnd: null,
  interlinearWords: [],
  commentaries: [
    {
      author: "Matthew Henry",
      title: "Commentary on the Whole Bible",
      text: "This verse shows the divine nature of Christ and His eternal existence with the Father.",
    },
    {
      author: "John Calvin",
      title: "Commentary on John",
      text: "The beginning here mentioned is that which was before all ages.",
    },
  ],
  crossReferences: [
    { ref: "Genesis 1:1", text: "In the beginning God created the heavens and the earth." },
    { ref: "1 John 1:1", text: "That which was from the beginning..." },
    { ref: "Colossians 1:15-20", text: "He is the image of the invisible God." },
  ],
  wordStudies: [
    {
      word: "Λόγος",
      transliteration: "Logos",
      meaning: "Word, reason, divine expression — the agent of creation and revelation.",
      strongs: "G3056",
    },
    {
      word: "Θεός",
      transliteration: "Theos",
      meaning: "God, deity — the Supreme Being.",
      strongs: "G2316",
    },
  ],
  dictionaryTerms: [
    {
      term: "Beginning",
      pronunciation: "bih-GIN-ing",
      definition: "The starting point of creation; the eternal moment before time.",
      description: "The starting point of creation; the eternal moment before time.",
    },
  ],
  relatedTopics: [
    { name: "Deity of Christ" },
    { name: "Creation" },
    { name: "Eternal Life" },
    { name: "Trinity" },
  ],
};

export const MOCK_TRANSLATIONS: TranslationComparisonEntry[] = [
  { version: "King James Version", abbreviation: "KJV", text: "In the beginning was the Word, and the Word was with God, and the Word was God." },
  { version: "New International Version", abbreviation: "NIV", text: "In the beginning was the Word, and the Word was with God, and the Word was God." },
  { version: "English Standard Version", abbreviation: "ESV", text: "In the beginning was the Word, and the Word was with God, and the Word was God." },
];

// ── Common test helpers ──

export const MOCK_PASSAGE_REF = "John 1:1";
export const MOCK_BOOK = "John";
export const MOCK_CHAPTER = "1";
export const MOCK_VERSE_START = "1";
export const MOCK_STAGE_LABEL = "Read and reflect on the passage.";
