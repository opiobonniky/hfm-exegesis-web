// useAddDailyDevotion — all state + API logic for AddDailyDevotion page
// Matches app fields: title, content, verse reference, rich content, background, etc.
import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/components/languages/languageProvider";
import { sendPostRequest } from "@/services/api";
import { routes } from "@/components/Routes/routes";
import {
  getBooksByTestament,
  getChaptersForBook,
  getVersesCountForChapter,
  getVerseText,
  setActiveVersion,
} from "@/utilities/bibleUtils";
import { parseStructuredField } from "../helpers/contentDetailHelpers";

export function useAddDailyDevotion() {
  const { t, isRtl } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const editingDevotion = location.state?.devotion as Record<string, any> | undefined;
  const isEditing = !!editingDevotion;

  // Required fields
  const [title, setTitle] = useState(editingDevotion?.title || "");
  const [content, setContent] = useState(editingDevotion?.content || "");

  // Bible reference
  const [testament, setTestament] = useState(editingDevotion?.testament || "");
  const [book, setBook] = useState(editingDevotion?.bookName || "");
  const [chapter, setChapter] = useState(editingDevotion?.chapter?.toString() || "");
  const [verseNumber, setVerseNumber] = useState(editingDevotion?.verseNumber?.toString() || "");
  const [bibleVersion, setBibleVersion] = useState(editingDevotion?.bibleVersion || "BSB");
  const [verseText, setVerseText] = useState("");
  const [isVerseLoading, setIsVerseLoading] = useState(false);

  // Date/time
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const d = editingDevotion?.displayDate ? new Date(editingDevotion.displayDate) : new Date();
    d.setHours(8, 0, 0, 0);
    return d;
  });
  const [selectedTime, setSelectedTime] = useState(() => {
    if (editingDevotion?.displayDate) {
      const d = new Date(editingDevotion.displayDate);
      return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    }
    return "08:00";
  });
  const [published, setPublished] = useState(editingDevotion?.isPublished ?? true);

  // Content fields
  const [explanation, setExplanation] = useState(editingDevotion?.explanation || "");
  const [application, setApplication] = useState(editingDevotion?.application || "");
  const [verseIntroduction, setVerseIntroduction] = useState(editingDevotion?.verseIntroduction || "");
  const [learnMore, setLearnMore] = useState(editingDevotion?.learnMore || "");

  // Background fields
  const [backgroundAuthor, setBackgroundAuthor] = useState(editingDevotion?.backgroundAuthor || "");
  const [backgroundBook, setBackgroundBook] = useState(editingDevotion?.backgroundBook || "");
  const [backgroundContext, setBackgroundContext] = useState(editingDevotion?.backgroundContext || "");

  // Structured fields
  const [wordStudies, setWordStudies] = useState(() => parseStructuredField(editingDevotion?.wordStudies));
  const [practicalApplications, setPracticalApplications] = useState(() => parseStructuredField(editingDevotion?.practicalApplications));
  const [keyThemes, setKeyThemes] = useState(() => parseStructuredField(editingDevotion?.keyThemes));
  const [crossReferences, setCrossReferences] = useState(() => parseStructuredField(editingDevotion?.crossReferences));
  const [finalThoughts, setFinalThoughts] = useState(editingDevotion?.finalThoughts || "");
  const [takeaways, setTakeaways] = useState(() => parseStructuredField(editingDevotion?.takeaways));

  // Derived
  const books = useMemo(() => getBooksByTestament(testament as "Old" | "New"), [testament]);
  const chapters = useMemo(() => getChaptersForBook(book), [book]);
  const maxVerses = useMemo(
    () => (book && chapter ? getVersesCountForChapter(book, Number(chapter)) : 0),
    [book, chapter],
  );
  const testamentOptions = useMemo(() => [
    { value: "Old", label: t.dailyVerse.oldTestament },
    { value: "New", label: t.dailyVerse.newTestament },
  ], [t]);
  const bookOptions = useMemo(
    () => books.map((bookName) => ({ value: bookName, label: bookName })),
    [books],
  );
  const chapterOptions = useMemo(
    () => chapters.map((chapterNumber) => ({
      value: String(chapterNumber),
      label: String(chapterNumber),
    })),
    [chapters],
  );
  const bibleVersionOptions = useMemo(() => [
    { value: "BSB", label: "BSB (Berean Study Bible)" },
    { value: "KJV", label: "KJV (King James)" },
    { value: "ESV", label: "ESV" },
    { value: "NIV", label: "NIV" },
  ], []);

  // Auto-fetch verse text
  useEffect(() => {
    if (!book || !chapter || !verseNumber) { setVerseText(""); return; }
    setIsVerseLoading(true);
    setActiveVersion(bibleVersion).then(() => {
      const text = getVerseText(book, Number(chapter), Number(verseNumber));
      setVerseText(text || "Verse not found.");
      setIsVerseLoading(false);
    });
  }, [book, chapter, verseNumber, bibleVersion]);

  // Sync time with date
  useEffect(() => {
    setSelectedTime(
      `${String(selectedDate.getHours()).padStart(2, "0")}:${String(selectedDate.getMinutes()).padStart(2, "0")}`,
    );
  }, [selectedDate]);

  const handleTimeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const time = e.target.value;
      setSelectedTime(time);
      if (!time) return;
      const [h, m] = time.split(":").map(Number);
      if (isNaN(h) || isNaN(m)) return;
      const nd = new Date(selectedDate);
      nd.setHours(h, m, 0, 0);
      setSelectedDate(nd);
    },
    [selectedDate],
  );

  const saveDisabled = !title.trim() || !content.trim();

  const handleSave = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (saveDisabled) {
      toast({ title: "Missing fields", description: "Title and content are required", variant: "destructive" });
      return;
    }
    const payload: Record<string, any> = {
      title,
      content,
      bookName: book || null,
      chapter: chapter ? Number(chapter) : null,
      verseNumber: verseNumber ? Number(verseNumber) : null,
      bibleVersion: book ? bibleVersion : null,
      displayDate: format(selectedDate, "yyyy-MM-dd"),
      displayTime: selectedDate.toISOString(),
      published,
      ...(isEditing ? { id: editingDevotion?.id } : {}),
      // Rich content fields
      explanation: explanation || null,
      application: application || null,
      verseIntroduction: verseIntroduction || null,
      learnMore: learnMore || null,
      backgroundAuthor: backgroundAuthor || null,
      backgroundBook: backgroundBook || null,
      backgroundContext: backgroundContext || null,
      wordStudies: wordStudies || null,
      practicalApplications: practicalApplications || null,
      keyThemes: keyThemes || null,
      crossReferences: crossReferences || null,
      finalThoughts: finalThoughts || null,
      takeaways: takeaways || null,
    };
    try {
      const res = await sendPostRequest("admin", "add-daily-devotion", payload);
      if (res.returnCode === 200) {
        toast({ title: t.devotions.success, description: t.devotions.devotionSaved });
        navigate(routes.dailyDevotions.path);
      } else {
        toast({ title: t.common.error, description: res.returnMessage || t.devotions.failedToAdd, variant: "destructive" });
      }
    } catch {
      toast({ title: t.common.error, description: t.common.error, variant: "destructive" });
    }
  }, [
    title, content, book, chapter, verseNumber, bibleVersion, selectedDate, published,
    explanation, application, verseIntroduction, learnMore,
    backgroundAuthor, backgroundBook, backgroundContext,
    wordStudies, practicalApplications, keyThemes, crossReferences, finalThoughts, takeaways,
    isEditing, editingDevotion, toast, t, navigate, saveDisabled,
  ]);

  return {
    // Required
    title, setTitle,
    content, setContent,
    // Bible reference
    testament, setTestament,
    book, setBook,
    chapter, setChapter,
    verseNumber, setVerseNumber,
    bibleVersion, setBibleVersion,
    verseText, isVerseLoading,
    books, chapters, maxVerses,
    testamentOptions, bookOptions, chapterOptions, bibleVersionOptions,
    // Date/time/publish
    selectedDate, setSelectedDate,
    selectedTime, handleTimeChange,
    published, setPublished,
    // Content fields
    explanation, setExplanation,
    application, setApplication,
    verseIntroduction, setVerseIntroduction,
    learnMore, setLearnMore,
    // Background
    backgroundAuthor, setBackgroundAuthor,
    backgroundBook, setBackgroundBook,
    backgroundContext, setBackgroundContext,
    // Structured
    wordStudies, setWordStudies,
    practicalApplications, setPracticalApplications,
    keyThemes, setKeyThemes,
    crossReferences, setCrossReferences,
    finalThoughts, setFinalThoughts,
    takeaways, setTakeaways,
    // Derived
    saveDisabled, isEditing,
    pageTitle: isEditing ? "Edit Devotion" : t.devotions.addDevotion,
    saveLabel: isEditing ? "Update Devotion" : t.devotions.saveDevotion,
    // Actions
    handleSave,
    // Helpers
    t, isRtl, navigate,
  };
}

export type AddDailyDevotionPageModel = ReturnType<typeof useAddDailyDevotion>;
