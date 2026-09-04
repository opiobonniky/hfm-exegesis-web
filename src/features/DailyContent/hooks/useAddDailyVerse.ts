// useAddDailyVerse — all state + API logic for AddDailyVerse page
import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/components/languages/languageProvider";
import { sendPostRequest } from "@/services/api";
import { bibleApi } from "@/services/bibleApi";
import { routes } from "@/components/Routes/routes";
import {
  getBooksByTestament,
  getChaptersForBook,
} from "@/utilities/bibleUtils";
import { BIBLE_VERSIONS } from "@/assets/bibleVersion/json/bibleVersions";
import type { DailyVersePayload } from "../types";
import { parseStructuredField } from "../helpers/contentDetailHelpers";

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

/** Plain-text fields derived from an existing verse explanation */
export interface MappedExplanationFields {
  explanation: string;
  application: string;
  verseIntroduction: string;
  learnMore: string;
  backgroundAuthor: string;
  backgroundBook: string;
  backgroundContext: string;
  finalThoughts: string;
  wordStudies: string;
  practicalApplications: string;
  keyThemes: string;
  crossReferences: string;
}

/** Shape of the records nested inside a VerseExplanation returned by the API */
interface VerseExplanationRecord {
  exegesis?: { explanationText?: string; applicationText?: string };
  studyMetadata?: {
    introduction?: string;
    backgroundAuthor?: string;
    backgroundBook?: string;
    backgroundContext?: string;
    finalThoughts?: string;
  };
  wordStudies?: Array<{ surfaceText?: string; strongsId?: string; customDefinition?: string }>;
  practicalApps?: Array<{ applicationText?: string }>;
  themes?: Array<{ themeName?: string }>;
  crossReferences?: Array<{
    bookName?: string;
    chapter?: number;
    verseNumber?: number;
    referenceText?: string;
  }>;
}

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

  // Auto-populate from an existing verse explanation (loaded when a verse is picked)
  const [explanationSource, setExplanationSource] = useState<MappedExplanationFields | null>(null);
  const [explanationLoading, setExplanationLoading] = useState(false);
  const [explanationApplied, setExplanationApplied] = useState(false);
  const [explanationError, setExplanationError] = useState(false);

  const books = useMemo(() => getBooksByTestament(testament as "Old" | "New"), [testament]);
  const chapters = useMemo(() => getChaptersForBook(book), [book]);

  // Fetch the chapter's verse list from the backend (reliable for every book,
  // including BSB's "Psalm" vs "Psalms" naming) to populate the verse count.
  const [verseCount, setVerseCount] = useState(0);
  const [chapterVerses, setChapterVerses] = useState<Record<number, string>>({});
  useEffect(() => {
    let active = true;
    if (!book || !chapter) {
      setVerseCount(0);
      setChapterVerses({});
      return;
    }
    setIsVerseLoading(true);
    bibleApi
      .getVerses(bibleVersion || "BSB", book, Number(chapter))
      .then((vd) => {
        if (!active) return;
        const verses = vd?.verses || [];
        const map: Record<number, string> = {};
        verses.forEach((v) => {
          map[v.verseNumber] = v.text;
        });
        setChapterVerses(map);
        setVerseCount(verses.length);
      })
      .catch(() => {
        if (!active) return;
        setVerseCount(0);
        setChapterVerses({});
      })
      .finally(() => {
        if (active) setIsVerseLoading(false);
      });
    return () => {
      active = false;
    };
  }, [book, chapter, bibleVersion]);
  const maxVerses = verseCount;

  const TESTAMENTS = useMemo(
    () => [
      { value: "Old", label: t.dailyVerse.oldTestament },
      { value: "New", label: t.dailyVerse.newTestament },
    ],
    [t],
  );

  // Set verse text reliably once a verse is selected (from the cached chapter).
  useEffect(() => {
    if (!book || !chapter || !verseNumber || isVerseEditing) {
      if (!isVerseEditing) setVerseText("");
      return;
    }
    const text = chapterVerses[Number(verseNumber)];
    if (typeof text === "string") {
      setVerseText(text);
      return;
    }
    setIsVerseLoading(true);
    bibleApi
      .getVerse(bibleVersion || "BSB", book, Number(chapter), Number(verseNumber))
      .then((v) => {
        if (v?.text) setVerseText(v.text);
        else setVerseText("Verse not found.");
      })
      .catch(() => setVerseText("Verse not found."))
      .finally(() => setIsVerseLoading(false));
  }, [book, chapter, verseNumber, bibleVersion, isVerseEditing, chapterVerses]);

  // Map an existing verse explanation record onto the daily-verse fields.
  const mapExplanationToFields = useCallback((d: VerseExplanationRecord | null | undefined): MappedExplanationFields => {
    const exegesis = d?.exegesis || {};
    const study = d?.studyMetadata || {};
    const wordStudies = (d?.wordStudies || []).map(
      (ws) => [ws.surfaceText, ws.strongsId, ws.customDefinition]
        .filter(Boolean).join(" | "),
    ).filter(Boolean).join("\n");
    const practicalApplications = (d?.practicalApps || [])
      .map((pa) => (pa.applicationText || "").trim())
      .filter(Boolean).join("\n");
    const keyThemes = (d?.themes || [])
      .map((th) => (th.themeName || "").trim())
      .filter(Boolean).join("\n");
    const crossReferences = (d?.crossReferences || [])
      .map((cr) => {
        const base = [cr.bookName, cr.chapter, cr.verseNumber].filter(Boolean).join(" ");
        return [base, cr.referenceText].filter(Boolean).join(" — ");
      })
      .filter(Boolean)
      .join("\n");

    return {
      explanation: exegesis.explanationText || "",
      application: exegesis.applicationText || "",
      verseIntroduction: study.introduction || "",
      learnMore: "",
      backgroundAuthor: study.backgroundAuthor || "",
      backgroundBook: study.backgroundBook || "",
      backgroundContext: study.backgroundContext || "",
      finalThoughts: study.finalThoughts || "",
      wordStudies,
      practicalApplications,
      keyThemes,
      crossReferences,
    };
  }, []);

  // Fetch an existing explanation for the selected verse and auto-populate
  // the still-empty daily-verse fields (never clobber user input).
  useEffect(() => {
    let active = true;
    if (!book || !chapter || !verseNumber || isEditing) {
      setExplanationSource(null);
      setExplanationApplied(false);
      setExplanationError(false);
      return;
    }
    setExplanationLoading(true);
    setExplanationError(false);
    sendPostRequest("bible", "get-verse-explanation", {
      bookName: book,
      chapter: Number(chapter),
      verseNumber: Number(verseNumber),
    })
      .then((res) => {
        if (!active) return;
        if (res?.returnCode === 200 && res.returnData) {
          const fields = mapExplanationToFields(res.returnData as VerseExplanationRecord);
          setExplanationSource(fields);
          setExplanationApplied(true);
          applyFieldsIfEmpty(fields);
        } else {
          setExplanationSource(null);
          setExplanationError(true);
        }
      })
      .catch(() => {
        if (!active) return;
        setExplanationSource(null);
        setExplanationError(true);
      })
      .finally(() => {
        if (active) setExplanationLoading(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book, chapter, verseNumber, isEditing]);

  // Fill only fields the user hasn't typed into yet.
  const applyFieldsIfEmpty = (fields: MappedExplanationFields) => {
    if (fields.explanation && !explanation) setExplanation(fields.explanation);
    if (fields.application && !application) setApplication(fields.application);
    if (fields.verseIntroduction && !verseIntroduction) setVerseIntroduction(fields.verseIntroduction);
    if (fields.backgroundAuthor && !backgroundAuthor) setBackgroundAuthor(fields.backgroundAuthor);
    if (fields.backgroundBook && !backgroundBook) setBackgroundBook(fields.backgroundBook);
    if (fields.backgroundContext && !backgroundContext) setBackgroundContext(fields.backgroundContext);
    if (fields.finalThoughts && !finalThoughts) setFinalThoughts(fields.finalThoughts);
    if (fields.wordStudies && !wordStudies) setWordStudies(fields.wordStudies);
    if (fields.practicalApplications && !practicalApplications) setPracticalApplications(fields.practicalApplications);
    if (fields.keyThemes && !keyThemes) setKeyThemes(fields.keyThemes);
    if (fields.crossReferences && !crossReferences) setCrossReferences(fields.crossReferences);
  };

  // Overwrite all mapped fields with the loaded explanation content.
  const applyExplanation = useCallback((fields: MappedExplanationFields) => {
    if (!fields) return;
    setExplanation(fields.explanation || "");
    setApplication(fields.application || "");
    setVerseIntroduction(fields.verseIntroduction || "");
    setLearnMore(fields.learnMore || "");
    setBackgroundAuthor(fields.backgroundAuthor || "");
    setBackgroundBook(fields.backgroundBook || "");
    setBackgroundContext(fields.backgroundContext || "");
    setFinalThoughts(fields.finalThoughts || "");
    setWordStudies(fields.wordStudies || "");
    setPracticalApplications(fields.practicalApplications || "");
    setKeyThemes(fields.keyThemes || "");
    setCrossReferences(fields.crossReferences || "");
    setExplanationApplied(true);
  }, []);

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

  const closeConflict = useCallback(() => {
    setConflictDialog({ open: false, conflict: null, payload: null });
  }, []);

  const handleConflictOpenChange = useCallback((open: boolean) => {
    if (!open) closeConflict();
  }, [closeConflict]);

  const viewExisting = useCallback(() => {
    closeConflict();
    navigate(routes.dailyVerse.path);
  }, [closeConflict, navigate]);

  const conflictReference = conflictDialog.conflict?.existing?.bookName
    ? `${conflictDialog.conflict.existing.bookName} ${conflictDialog.conflict.existing.chapter}:${conflictDialog.conflict.existing.verseNumber}`
    : "";
  const conflictMessage = conflictDialog.conflict?.type === "date"
    ? t.dailyVerse.verseConflictForDate.replace("{ref}", conflictReference)
    : t.dailyVerse.verseConflictForVerse
      .replace("{ref}", conflictReference)
      .replace("{date}", conflictDialog.conflict?.existing?.displayDate || "");

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
    // Explanation auto-populate
    explanationSource, explanationLoading, explanationApplied, explanationError,
    applyExplanation,
    // Actions
    handleSave, handleConflictUpdate,
    // Conflict dialog
    conflictDialog, closeConflict, handleConflictOpenChange, viewExisting,
    conflictMessage,
    // Helpers
    t, isRtl,
  };
}

export type AddDailyVersePageModel = ReturnType<typeof useAddDailyVerse>;
