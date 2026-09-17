import type { MutableRefObject, RefObject } from "react";
import type { LucideIcon } from "lucide-react";
import type { ChapterHeading } from "@/services/bibleApi";
import type {
  AudioPlayerActions,
  AudioPlayerState,
} from "@/hooks/useAudioPlayer";

// ─── Bible Types ───────────────────────────────────────────────────────────────

export interface BookInfo {
  abbreviation: string;
  name: string;
  testament: "OT" | "NT";
  chapters: number;
  group: string;
}

export interface LibraryBookInfo {
  bookNumber: number;
  bookName: string;
  testament: string;
  chaptersCount: number;
  totalVerses: number;
}

export interface BibleVersion {
  id: string;
  abbreviation: string;
  name: string;
  language: string;
  isAvailable: boolean;
}

export interface BibleChapter {
  book: string;
  chapter: number;
  verses: BibleVerse[];
}

export interface BibleVerse {
  verse: number;
  text: string;
}

export interface Highlight {
  id: number;
  verseNumber: number;
  colorId: number;
  note?: string;
  createdOn: string;
}

export interface Note {
  id: number;
  verseNumber: number;
  note: string;
}

export interface Favorite {
  id: number;
  verseNumber: number;
  createdOn: string;
}

export interface ReadHistoryItem {
  book: string;
  chapter: number;
  lastRead: string;
}

export interface VerseExplanation {
  id?: number;
  bookName: string;
  chapter: number;
  verseNumber: number;
  explanation: string;
  learnMore: string;
  bibleVersion?: string;
  updatedOn?: string;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: "article" | "video" | "commentary";
  url?: string;
  source?: string;
}

export interface Translation {
  id: string;
  name: string;
  abbreviation: string;
}

export type CovenantFilter = "all" | "ot" | "nt";
export type ActivityType = "all" | "highlights" | "notes" | "favorites" | "history";
/** Every study section the Verse Resources page can be routed to. */
export type ResourceSectionKey =
  | "explanation"
  | "commentaries"
  | "crossReferences"
  | "wordStudies"
  | "dictionary"
  | "translations"
  | "interlinear"
  | "topics"
  | "verseReferences"
  | "studyTools"
  | "prologue";

export type TabKey = ResourceSectionKey;

export type VerseActionTarget = {
  book: string;
  chapter: number;
  verse: number;
  text: string;
};

export type LabStage = "look" | "listen" | "learn" | "abide" | "apply";

export interface TranslationOption {
  id: string;
  name: string;
  language?: string;
  copyright?: string;
  isFree?: boolean;
}

export interface ChapterData {
  book: string;
  chapter: number;
  verses: { verse: number; text: string }[];
  testament: string;
}

export interface ReaderHighlight {
  colorId: number;
  note?: string;
}

export interface ExplanationWordStudy {
  word?: string;
  strongs?: string;
  definition?: string;
}

export interface VerseExplanationData {
  verseIntroduction?: string;
  explanation?: string;
  application?: string;
  backgroundAuthor?: string;
  backgroundBook?: string;
  backgroundContext?: string;
  wordStudies?: string;
  practicalApplications?: string;
  keyThemes?: string;
  crossReferences?: string;
  learnMore?: string;
  finalThoughts?: string;
  takeaways?: string;
}

export interface VerseExplanationDrawerProps {
  open: boolean;
  onClose: () => void;
  bookName: string;
  chapter: number;
  verse: number;
  isRtl: boolean;
  title: string;
  loadingLabel: string;
  closeLabel: string;
  loading: boolean;
  explanation: VerseExplanationData | null;
}

export interface EditNoteDialogProps {
  open: boolean;
  mode?: "create" | "edit";
  verseRef?: string;
  text: string;
  saving: boolean;
  deleting?: boolean;
  onTextChange: (value: string) => void;
  onSave: () => void;
  onClose: () => void;
  onDelete?: () => void;
}

export interface ActionButtonProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  onClick: () => void;
  /**
   * How many entries this action leads to, when known. Rendered as a badge.
   * Actions whose section is empty are filtered out by the caller before
   * render, so there is no disabled state here.
   */
  count?: number | null;
}

export interface VerseActionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  target: VerseActionTarget | null;
  isRtl: boolean;
  labels: Record<string, string>;
  onExplain: () => void;
  onStartLab: (stage: LabStage) => void;
  onOpenResources: (tab: ResourceSectionKey) => void;
  onDevotional: () => void;
  onStudyTools: () => void;
  onStrongs: () => void;
  onTrivia: () => void;
  onListen: () => void;
  onHighlight: () => void;
  onNote: () => void;
  onJournal: () => void;
  onFavorite: () => void;
  onSearch: () => void;
  onShare: () => void;
  onCopy: () => void;
}

export type HeadingsByChapter = Record<string, ChapterHeading[]>;

export interface BibleReaderHeaderProps {
  bookName: string;
  chapter: number;
  backLabel: string;
  selectBookChapterLabel: string;
  searchLabel: string;
  listenLabel: string;
  stopLabel: string;
  isRtl: boolean;
  audioActive: boolean;
  translations: TranslationOption[];
  selectedTranslationId: string;
  translationOpen: boolean;
  translationSearch: string;
  fontSize: number;
  onBack: () => void;
  onToggleSidebar: () => void;
  onBookOverview: () => void;
  onAudioToggle: () => void;
  onTranslationSelect: (id: string) => void;
  onTranslationOpenChange: (open: boolean) => void;
  onTranslationSearchChange: (search: string) => void;
  onFontSizeChange: (size: number) => void;
  onSearch: () => void;
}

export interface BibleReaderBodyProps {
  scrollRef: RefObject<HTMLDivElement>;
  fontSize: number;
  sidebarOpen: boolean;
  isRtl: boolean;
  books: { bookNumber: number; bookName: string; maxChapter: number }[];
  selectedBook: string;
  selectedChapter: number;
  booksLoading: boolean;
  chapters: ChapterData[];
  headingsByChapter?: HeadingsByChapter;
  audioVerseKey?: string | null;
  selectedVerses: string[];
  highlights: Record<string, ReaderHighlight>;
  favorites: Set<string>;
  verseNotes: Record<string, string>;
  /**
   * True while a verse overlay (action sheet, explanation drawer, note or
   * highlight dialog) is open. The floating verse toolbar is hidden then, so it
   * never floats on top of — or behind — the panel covering the same verse.
   */
  verseToolbarHidden: boolean;
  chapterRefs: MutableRefObject<Record<string, HTMLDivElement>>;
  verseRefs: MutableRefObject<Record<string, HTMLSpanElement | null>>;
  loading: boolean;
  loadError: string | null;
  loadingMore: boolean;
  hasMore: boolean;
  loadMoreRef: RefObject<HTMLDivElement>;
  audioActive: boolean;
  audioState: AudioPlayerState;
  audioActions: AudioPlayerActions;
  hasSelection: boolean;
  selectedVerseCount: number;
  canGoPrev: boolean;
  canGoNext: boolean;
  onFontSizeChange: (size: number) => void;
  onCloseSidebar: () => void;
  onSelectChapter: (book: string, chapter: number) => void;
  onBookOverview: () => void;
  onToggleVerse: (key: string) => void;
  onToggleHighlight: (
    book: string,
    chapter: number,
    verse: number,
    colorId: number,
  ) => void;
  onToggleFavorite: (book: string, chapter: number, verse: number) => void;
  onExplainVerse: (book: string, chapter: number, verse: number) => void;
  onOpenVerseActions: (book: string, chapter: number, verse: number) => void;
  onRetryLoad: () => void;
  onLoadMore: () => void;
  onMultiHighlight: () => void;
  onMultiNote: () => void;
  onMultiFavorite: () => void;
  onMultiCopy: () => void;
  onMultiShare: () => void;
  onMultiListen: () => void;
  onMultiClear: () => void;
  onPrev: () => void;
  onNext: () => void;
  onScrollTop: () => void;
  onScrollBottom: () => void;
  onBookmark: () => void;
  onAudioToggle: () => void;
  onMore: () => void;
}

export interface AudioControlBarProps {
  audioState: AudioPlayerState;
  audioActions: AudioPlayerActions;
  bookName: string;
  chapter: number;
}

export interface ApiBaseUrlIndicatorProps {
  apiBaseUrl: string;
  visible: boolean;
}
