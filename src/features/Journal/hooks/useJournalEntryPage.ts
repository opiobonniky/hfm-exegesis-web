import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEventHandler,
} from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import type { Translations } from "@/components/languages/type";
import { useLanguage } from "@/components/languages/languageProvider";
import { useToast } from "@/hooks/use-toast";
import { sendPostRequest } from "@/services/api";
import {
  getBooksByTestament,
  getChaptersForBook,
  getVerseText,
  getVersesCountForChapter,
} from "@/utilities/bibleUtils";
import type { JournalEntryFormData } from "../types";

export interface JournalEntryData extends Omit<JournalEntryFormData, "id"> {
  isPrivate: boolean;
}

export interface JournalEntryTemplate {
  id: number | string;
  name: string;
  prompts: string[];
  description?: string;
  emoji?: string;
}

export type JournalTestament = "" | "all" | "Old" | "New";

export interface JournalEntryPageModel {
  t: Translations;
  isRtl: boolean;
  isEditing: boolean;
  isNewEntry: boolean;
  entry: JournalEntryData;
  loading: boolean;
  saving: boolean;
  wordCount: number;
  testament: JournalTestament;
  books: string[];
  chapters: number[];
  verses: number[];
  verseText: string;
  templates: JournalEntryTemplate[];
  showTemplates: boolean;
  goBack: (path?: string) => void;
  handleSave: () => Promise<void>;
  setShowTemplates: (open: boolean) => void;
  handleApplyTemplate: (template: JournalEntryTemplate) => void;
  handleTitleChange: ChangeEventHandler<HTMLInputElement>;
  handleContentChange: ChangeEventHandler<HTMLTextAreaElement>;
  handleCategoryChange: (category: string) => void;
  handleMoodChange: (mood: string) => void;
  handleLearningsChange: ChangeEventHandler<HTMLTextAreaElement>;
  handleApplicationChange: ChangeEventHandler<HTMLTextAreaElement>;
  handleGratitudeChange: ChangeEventHandler<HTMLTextAreaElement>;
  handlePrayersChange: ChangeEventHandler<HTMLTextAreaElement>;
  handleTagsChange: ChangeEventHandler<HTMLInputElement>;
  handleFavoriteChange: (isFavorite: boolean) => void;
  handlePublishedChange: (isPublished: boolean) => void;
  handleTestamentChange: (testament: string) => void;
  handleBookChange: (bookName: string) => void;
  handleChapterChange: (chapter: string) => void;
  handleVerseChange: (verseNumber: string) => void;
  handleOpenBibleReader: () => void;
}

interface DailyExegesisData {
  title?: string;
  introduction?: string;
  contextSummary?: string;
  teachingBody?: string;
  prayer?: string;
  application?: string;
  tags?: string;
}

const DEFAULT_ENTRY: JournalEntryData = {
  title: "",
  content: "",
  mood: "neutral",
  tags: "",
  bookName: "",
  chapter: "",
  verseNumber: "",
  isPrivate: true,
  prayers: "",
  application: "",
  learnings: "",
  category: "general",
  gratitude: "",
  isFavorite: false,
  isPublished: true,
};

function getTestamentForBook(book: string): "Old" | "New" {
  return getBooksByTestament("Old").includes(book) ? "Old" : "New";
}

function getInitialEntry(
  isNewEntry: boolean,
  searchParams: URLSearchParams,
): JournalEntryData {
  if (!isNewEntry) return DEFAULT_ENTRY;

  const reflection = searchParams.get("reflection");
  const promptText = searchParams.get("promptText");
  const content = searchParams.get("source") === "daily-exegesis" && reflection
    ? reflection
    : promptText || "";

  return {
    ...DEFAULT_ENTRY,
    title: searchParams.get("title") || "",
    bookName: searchParams.get("book") || "",
    chapter: searchParams.get("chapter") || "",
    verseNumber: searchParams.get("verse") || "",
    content,
    prayers: searchParams.get("prayer") || "",
    application: searchParams.get("application") || "",
    tags: searchParams.get("tags") || "",
  };
}

export function useJournalEntryPage(): JournalEntryPageModel {
  const navigate = useNavigate();
  const { entryId } = useParams<{ entryId: string }>();
  const [searchParams] = useSearchParams();
  const { t, isRtl } = useLanguage();
  const { toast } = useToast();
  const isEditing = Boolean(entryId && entryId !== "new");
  const isNewEntry = entryId === "new" || !entryId;
  const [testament, setTestament] = useState<JournalTestament>("");
  const [entry, setEntry] = useState<JournalEntryData>(() =>
    getInitialEntry(isNewEntry, searchParams),
  );
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [books, setBooks] = useState<string[]>([]);
  const [chapters, setChapters] = useState<number[]>([]);
  const [verses, setVerses] = useState<number[]>([]);
  const [verseText, setVerseText] = useState("");
  const [templates, setTemplates] = useState<JournalEntryTemplate[]>([]);
  const allBooks = useMemo(
    () => getBooksByTestament("Old").concat(getBooksByTestament("New")),
    [],
  );
  const wordCount = entry.content.trim()
    ? entry.content.trim().split(/\s+/).length
    : 0;

  const fetchEntry = useCallback(async () => {
    setLoading(true);
    try {
      const response = await sendPostRequest<JournalEntryData>("journal", "get", {
        id: entryId,
      });
      if (response.returnCode === 200 && response.returnData) {
        setEntry(response.returnData);
      }
    } finally {
      setLoading(false);
    }
  }, [entryId]);

  const fetchTemplates = useCallback(async () => {
    try {
      const response = await sendPostRequest<JournalEntryTemplate[]>(
        "journal",
        "templates/get-all",
        { isActive: true },
      );
      if (response.returnCode === 200 && response.returnData) {
        setTemplates(response.returnData);
      }
    } catch {
      // The dialog provides local fallback templates when the request fails.
    }
  }, []);

  useEffect(() => {
    if (isEditing) void fetchEntry();
  }, [fetchEntry, isEditing]);

  useEffect(() => {
    setBooks(
      testament === "Old" || testament === "New"
        ? getBooksByTestament(testament)
        : allBooks,
    );
  }, [allBooks, testament]);

  useEffect(() => {
    if (entry.bookName) {
      setChapters(getChaptersForBook(entry.bookName));
      setTestament(getTestamentForBook(entry.bookName));
    }
  }, [entry.bookName]);

  useEffect(() => {
    if (entry.bookName && entry.chapter) {
      const verseCount = getVersesCountForChapter(
        entry.bookName,
        Number.parseInt(entry.chapter, 10),
      );
      setVerses(Array.from({ length: verseCount }, (_, index) => index + 1));
    } else {
      setVerses([]);
    }
  }, [entry.bookName, entry.chapter]);

  useEffect(() => {
    if (entry.bookName && entry.chapter && entry.verseNumber) {
      setVerseText(
        getVerseText(
          entry.bookName,
          Number.parseInt(entry.chapter, 10),
          Number.parseInt(entry.verseNumber, 10),
        ) || "",
      );
    } else {
      setVerseText("");
    }
  }, [entry.bookName, entry.chapter, entry.verseNumber]);

  useEffect(() => {
    if (
      isNewEntry &&
      searchParams.get("source") === "daily-exegesis" &&
      searchParams.get("date")
    ) {
      void sendPostRequest<DailyExegesisData>("bible", "get-exegesis-by-date", {
        date: searchParams.get("date"),
      })
        .then((response) => {
          if (response.returnCode !== 200 || !response.returnData) return;
          const data = response.returnData;
          const content = [
            data.introduction,
            data.contextSummary,
            data.teachingBody,
          ]
            .filter(Boolean)
            .join("\n\n");
          setEntry((previous) => ({
            ...previous,
            title: data.title || previous.title,
            content: content || previous.content,
            prayers: data.prayer || previous.prayers,
            application: data.application || previous.application,
            learnings:
              data.contextSummary || data.introduction || previous.learnings,
            tags: data.tags || previous.tags,
          }));
        })
        .catch(() => undefined);
    }
  }, [isNewEntry, searchParams]);

  useEffect(() => {
    if (isNewEntry) void fetchTemplates();
  }, [fetchTemplates, isNewEntry]);

  const handleSave = useCallback(async () => {
    if (!entry.title.trim() && !entry.content.trim()) {
      toast({ title: "Title or content required", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const response = await sendPostRequest(
        "journal",
        isEditing ? "update" : "create",
        { ...entry, id: isEditing ? entryId : undefined },
      );
      if (response.returnCode === 200) {
        toast({ title: isEditing ? "Updated" : "Created" });
        navigate("/journal");
      } else {
        toast({
          title: response.returnMessage || "Failed",
          variant: "destructive",
        });
      }
    } catch {
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }, [entry, entryId, isEditing, navigate, toast]);

  const handleApplyTemplate = useCallback((template: JournalEntryTemplate) => {
    if (template.prompts.length) {
      const prompts = template.prompts.join("\n\n");
      setEntry((previous) => ({
        ...previous,
        content: previous.content
          ? `${previous.content}\n\n${prompts}`
          : prompts,
      }));
    }
    setShowTemplates(false);
  }, []);

  const goBack = useCallback(() => navigate("/journal"), [navigate]);
  const handleTitleChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => setEntry((previous) => ({ ...previous, title: event.target.value })),
    [],
  );
  const handleContentChange: ChangeEventHandler<HTMLTextAreaElement> = useCallback(
    (event) => setEntry((previous) => ({ ...previous, content: event.target.value })),
    [],
  );
  const handleCategoryChange = useCallback(
    (category: string) => setEntry((previous) => ({ ...previous, category })),
    [],
  );
  const handleMoodChange = useCallback(
    (mood: string) => setEntry((previous) => ({ ...previous, mood })),
    [],
  );
  const handleLearningsChange: ChangeEventHandler<HTMLTextAreaElement> = useCallback(
    (event) => setEntry((previous) => ({ ...previous, learnings: event.target.value })),
    [],
  );
  const handleApplicationChange: ChangeEventHandler<HTMLTextAreaElement> = useCallback(
    (event) => setEntry((previous) => ({ ...previous, application: event.target.value })),
    [],
  );
  const handleGratitudeChange: ChangeEventHandler<HTMLTextAreaElement> = useCallback(
    (event) => setEntry((previous) => ({ ...previous, gratitude: event.target.value })),
    [],
  );
  const handlePrayersChange: ChangeEventHandler<HTMLTextAreaElement> = useCallback(
    (event) => setEntry((previous) => ({ ...previous, prayers: event.target.value })),
    [],
  );
  const handleTagsChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => setEntry((previous) => ({ ...previous, tags: event.target.value })),
    [],
  );
  const handleFavoriteChange = useCallback(
    (isFavorite: boolean) => setEntry((previous) => ({ ...previous, isFavorite })),
    [],
  );
  const handlePublishedChange = useCallback(
    (isPublished: boolean) => setEntry((previous) => ({ ...previous, isPublished })),
    [],
  );
  const handleTestamentChange = useCallback((value: string) => {
    setTestament(value as JournalTestament);
    setEntry((previous) => ({
      ...previous,
      bookName: "",
      chapter: "",
      verseNumber: "",
    }));
  }, []);
  const handleBookChange = useCallback((bookName: string) => {
    setEntry((previous) => ({
      ...previous,
      bookName,
      chapter: "",
      verseNumber: "",
    }));
  }, []);
  const handleChapterChange = useCallback((chapter: string) => {
    setEntry((previous) => ({ ...previous, chapter, verseNumber: "" }));
  }, []);
  const handleVerseChange = useCallback((verseNumber: string) => {
    setEntry((previous) => ({ ...previous, verseNumber }));
  }, []);
  const handleOpenBibleReader = useCallback(() => {
    if (entry.bookName && entry.chapter && entry.verseNumber) {
      navigate(
        `/bible-reader?book=${entry.bookName}&chapter=${entry.chapter}`,
      );
    }
  }, [entry.bookName, entry.chapter, entry.verseNumber, navigate]);

  return {
    t,
    isRtl,
    isEditing,
    isNewEntry,
    entry,
    loading,
    saving,
    wordCount,
    testament,
    books,
    chapters,
    verses,
    verseText,
    templates,
    showTemplates,
    goBack,
    handleSave,
    setShowTemplates,
    handleApplyTemplate,
    handleTitleChange,
    handleContentChange,
    handleCategoryChange,
    handleMoodChange,
    handleLearningsChange,
    handleApplicationChange,
    handleGratitudeChange,
    handlePrayersChange,
    handleTagsChange,
    handleFavoriteChange,
    handlePublishedChange,
    handleTestamentChange,
    handleBookChange,
    handleChapterChange,
    handleVerseChange,
    handleOpenBibleReader,
  };
}
