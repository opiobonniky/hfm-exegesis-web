// useAddDailyVerse — all state + API logic for AddDailyVerse page
import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/components/languages/languageProvider";
import { sendPostRequest } from "@/services/api";
import { routes } from "@/components/Routes/routes";
import {
  getVerseText,
  getBooksByTestament,
  getChaptersForBook,
  getVersesCountForChapter,
  setActiveVersion,
} from "@/utilities/bibleUtils";
import { BIBLE_VERSIONS } from "@/assets/bibleVersion/json/bibleVersions";
import type { DailyVersePayload } from "../types";

/** Parse a JSON array/string into newline-separated text for textarea display */
const parseStructuredField = (val: any): string => {
  if (!val) return "";
  if (Array.isArray(val)) {
    return val.map((item: any) => {
      if (typeof item === "object" && item !== null) {
        if (item.word && item.strongs && item.definition) {
          return `${item.word} | ${item.strongs} | ${item.definition}`;
        }
        return JSON.stringify(item);
      }
      return String(item);
    }).join("\n");
  }
  const str = String(val);
  try {
    const p = JSON.parse(str);
    if (Array.isArray(p)) {
      return p.map((item: any) => {
        if (typeof item === "object" && item !== null) {
          if (item.word && item.strongs && item.definition) {
            return `${item.word} | ${item.strongs} | ${item.definition}`;
          }
          return JSON.stringify(item);
        }
        return String(item);
      }).join("\n");
    }
  } catch { /* not JSON */ }
  return str;
};

/** All form fields in one object */
export interface VerseFormFields {
  testament: string;
  book: string;
  chapter: string;
  verseNumber: string;
  bibleVersion: string;
  verseText: string;
  isVerseEditing: boolean;
  explanation: string;
  learnMore: string;
  application: string;
  verseIntroduction: string;
  backgroundAuthor: string;
  backgroundBook: string;
  backgroundContext: string;
  wordStudies: string;
  practicalApplications: string;
  keyThemes: string;
  crossReferences: string;
  finalThoughts: string;
  takeaways: string;
  published: boolean;
  selectedDate: Date;
  selectedTime: string;
}

const EDITING_FIELDS: (keyof VerseFormFields)[] = [
  "testament", "book", "chapter", "verseNumber", "bibleVersion",
  "explanation", "learnMore", "application", "verseIntroduction",
  "backgroundAuthor", "backgroundBook", "backgroundContext",
  "wordStudies", "practicalApplications", "keyThemes", "crossReferences",
  "finalThoughts", "takeaways",
];

export function useAddDailyVerse() {
  const { toast } = useToast();
  const { t, isRtl } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const editingVerse = location.state?.verse as Record<string, any> | undefined;
  const isEditing = !!editingVerse;

  const [testament, setTestament] = useState(editingVerse?.testament || "");
  const [book, setBook] = useState(editingVerse?.bookName || "");
  const [chapter, setChapter] = useState(editingVerse?.chapter?.toString() || "");
  const [verseNumber, setVerseNumber] = useState(editingVerse?.verseNumber?.toString() || "");
  const [bibleVersion, setBibleVersion] = useState(editingVerse?.bibleVersion || "BSB");
  const [published, setPublished] = useState(editingVerse?.published ?? true);
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const d = editingVerse?.displayDate ? new Date(editingVerse.displayDate) : new Date();
    d.setHours(8, 0, 0, 0);
    return d;
  });
  const [selectedTime, setSelectedTime] = useState(() => {
    if (editingVerse?.displayDate) {
      const d = new Date(editingVerse.displayDate);
      return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    }
    return "08:00";
  });

  // Content fields
  const [verseText, setVerseText] = useState(editingVerse?.verseText || "");
  const [isVerseEditing, setIsVerseEditing] = useState(false);
  const [isVerseLoading, setIsVerseLoading] = useState(false);
  const [explanation, setExplanation] = useState(editingVerse?.explanation || "");
  const [learnMore, setLearnMore] = useState(editingVerse?.learnMore || "");
  const [application, setApplication] = useState(editingVerse?.application || "");
  const [verseIntroduction, setVerseIntroduction] = useState(editingVerse?.verseIntroduction || "");

  // Background fields
  const [backgroundAuthor, setBackgroundAuthor] = useState(editingVerse?.backgroundAuthor || "");
  const [backgroundBook, setBackgroundBook] = useState(editingVerse?.backgroundBook || "");
  const [backgroundContext, setBackgroundContext] = useState(editingVerse?.backgroundContext || "");

  // Structured fields (parse JSON arrays to newline-separated text)
  const [wordStudies, setWordStudies] = useState(() => parseStructuredField(editingVerse?.wordStudies));
  const [practicalApplications, setPracticalApplications] = useState(() => parseStructuredField(editingVerse?.practicalApplications));
  const [keyThemes, setKeyThemes] = useState(() => parseStructuredField(editingVerse?.keyThemes));
  const [crossReferences, setCrossReferences] = useState(() => parseStructuredField(editingVerse?.crossReferences));
  const [finalThoughts, setFinalThoughts] = useState(editingVerse?.finalThoughts || "");
  const [takeaways, setTakeaways] = useState(() => parseStructuredField(editingVerse?.takeaways));

  // Conflict dialog
  const [conflictDialog, setConflictDialog] = useState<{
    open: boolean;
    conflict: any;
    payload: any;
  }>({ open: false, conflict: null, payload: null });

  const books = useMemo(() => getBooksByTestament(testament as "Old" | "New"), [testament]);
  const chapters = useMemo(() => getChaptersForBook(book), [book]);
  const maxVerses = useMemo(
    () => (book && chapter ? getVersesCountForChapter(book, Number(chapter)) : 0),
    [book, chapter],
  );

  const TESTAMENTS = useMemo(
    () => [
      { value: "Old", label: t.dailyVerse.oldTestament },
      { value: "New", label: t.dailyVerse.newTestament },
    ],
    [t],
  );

  useEffect(() => {
    if (!book || !chapter || !verseNumber || isVerseEditing) {
      if (!isVerseEditing) setVerseText("");
      return;
    }
    setIsVerseLoading(true);
    setActiveVersion(bibleVersion).then(() => {
      const text = getVerseText(book, Number(chapter), Number(verseNumber));
      setVerseText(text || "Verse not found.");
      setIsVerseLoading(false);
    });
  }, [book, chapter, verseNumber, bibleVersion, isVerseEditing]);

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
      const newDate = new Date(selectedDate);
      newDate.setHours(h, m, 0, 0);
      setSelectedDate(newDate);
    },
    [selectedDate],
  );

  const saveDisabled =
    isVerseLoading ||
    !verseText.trim() ||
    !explanation.trim() ||
    !application.trim() ||
    !verseIntroduction.trim();

  const handleSave = useCallback(async () => {
    if (!book || !chapter || !verseNumber) {
      toast({ title: "Missing fields", description: "Please fill all required fields", variant: "destructive" });
      return;
    }
    const payload: DailyVersePayload = {
      bookName: book,
      chapter: Number(chapter),
      verseNumber: Number(verseNumber),
      bibleVersion,
      verseText: verseText || null,
      explanation,
      learnMore: learnMore || undefined,
      application,
      verseIntroduction,
      backgroundAuthor: backgroundAuthor || undefined,
      backgroundBook: backgroundBook || undefined,
      backgroundContext: backgroundContext || undefined,
      wordStudies: wordStudies || undefined,
      practicalApplications: practicalApplications || undefined,
      keyThemes: keyThemes || undefined,
      crossReferences: crossReferences || undefined,
      finalThoughts: finalThoughts || undefined,
      takeaways: takeaways || undefined,
      displayDate: format(selectedDate, "yyyy-MM-dd"),
      displayTime: selectedDate.toISOString(),
      published,
      ...(isEditing ? { id: editingVerse?.id } : {}),
    };
    try {
      const res = await sendPostRequest("admin", "add-daily-verse", payload);
      if (res.returnCode === 200) {
        toast({ title: t.dailyVerse.toastSuccess, description: res.returnMessage || t.dailyVerse.verseAdded });
        setTimeout(() => navigate(routes.dailyVerse.path), 2000);
      } else if (res.returnCode === 409) {
        setConflictDialog({ open: true, conflict: res.returnData?.conflicts?.[0], payload });
      } else {
        toast({ title: t.dailyVerse.toastSaveFailedDesc, description: res.returnMessage, variant: "destructive" });
      }
    } catch (err) {
      toast({ title: t.dailyVerse.toastSaveErrorDesc, description: t.dailyVerse.toastSaveErrorDesc, variant: "destructive" });
      console.error(err);
    }
  }, [
    book, chapter, verseNumber, bibleVersion, verseText, explanation, learnMore,
    application, verseIntroduction, backgroundAuthor, backgroundBook, backgroundContext,
    wordStudies, practicalApplications, keyThemes, crossReferences, finalThoughts,
    takeaways, selectedDate, published, isEditing, editingVerse, toast, t, navigate,
  ]);

  const handleConflictUpdate = useCallback(async () => {
    const c = conflictDialog.conflict;
    if (!c) return;
    setConflictDialog({ open: false, conflict: null, payload: null });
    try {
      const res = await sendPostRequest("admin", "add-daily-verse", { id: c.existing.id, ...conflictDialog.payload });
      if (res.returnCode === 200) {
        toast({ title: t.dailyVerse.toastUpdated, description: t.dailyVerse.toastUpdateSuccessDesc });
      } else {
        toast({ title: t.dailyVerse.toastUpdateFailedDesc, description: res.returnMessage, variant: "destructive" });
      }
    } catch {
      toast({ title: t.dailyVerse.toastUpdateFailedDesc, description: t.dailyVerse.toastUpdateFailedDesc, variant: "destructive" });
    }
  }, [conflictDialog, toast, t]);

  return {
    // State
    testament, setTestament,
    book, setBook,
    chapter, setChapter,
    verseNumber, setVerseNumber,
    bibleVersion, setBibleVersion,
    published, setPublished,
    selectedDate, setSelectedDate,
    selectedTime, handleTimeChange,
    verseText, setVerseText, isVerseEditing, setIsVerseEditing, isVerseLoading,
    explanation, setExplanation,
    learnMore, setLearnMore,
    application, setApplication,
    verseIntroduction, setVerseIntroduction,
    backgroundAuthor, setBackgroundAuthor,
    backgroundBook, setBackgroundBook,
    backgroundContext, setBackgroundContext,
    wordStudies, setWordStudies,
    practicalApplications, setPracticalApplications,
    keyThemes, setKeyThemes,
    crossReferences, setCrossReferences,
    finalThoughts, setFinalThoughts,
    takeaways, setTakeaways,
    // Derived
    books, chapters, maxVerses, TESTAMENTS,
    saveDisabled, isEditing,
    // Actions
    handleSave, handleConflictUpdate,
    // Conflict dialog
    conflictDialog, setConflictDialog,
    // Helpers
    t, isRtl,
  };
}
