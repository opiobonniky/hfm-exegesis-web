// useAddDailyDevotion — all state + API logic for AddDailyDevotion page
// Matches app fields: title, content, verse reference, rich content, background, etc.
import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/components/languages/languageProvider";
import { routes } from "@/components/Routes/routes";
import { useBibleEditions } from '@/hooks/useBibleEditions';
import { parseList } from "../helpers/contentDetailHelpers";
import { getDailyDevotionVerse, getDailyDevotionVerses, saveDailyDevotion } from "../services/add-daily-content-service";
import { tt } from '@/components/languages/hardcodedTranslate';
import { canonicalBook, validPassage } from '../helpers/editorContent';
import { scheduleErrors } from '../helpers/scheduleValidation';

export function useAddDailyDevotion() {
  const { t, isRtl, lang } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const editingDevotion = location.state?.devotion as Record<string, any> | undefined;
  const isEditing = !!editingDevotion;

  // Required fields
  const [title, setTitle] = useState(editingDevotion?.title || "");

  // Bible reference
  const [book, setBook] = useState(canonicalBook(editingDevotion?.bookName || ""));
  const [chapter, setChapter] = useState(editingDevotion?.chapter?.toString() || "");
  const [verseNumber, setVerseNumber] = useState(editingDevotion?.verseNumber?.toString() || "");
  const editions = useBibleEditions(lang, { initialVersion: editingDevotion?.bibleVersion, preserveVersion: isEditing });
  const { version: bibleVersion, setVersion: setBibleVersion } = editions;
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

  // A 409 from the server means another devotion already occupies the chosen
  // date. Keep the submitted payload so the user can replace that entry.
  const [conflictDialog, setConflictDialog] = useState<{
    open: boolean;
    conflict: { type?: string; existing?: Record<string, any> } | null;
    payload: Record<string, any> | null;
  }>({ open: false, conflict: null, payload: null });

  // Content fields
  const [explanation, setExplanation] = useState(editingDevotion?.explanation || editingDevotion?.content || "");
  const [reflectionQuestions, setReflectionQuestions] = useState<string[]>(() => parseList(editingDevotion?.reflectionQuestions || editingDevotion?.reflection));
  const [prayer, setPrayer] = useState(editingDevotion?.prayer || editingDevotion?.learnMore || "");
  const [practicalApplications, setPracticalApplications] = useState<string[]>(() => parseList(editingDevotion?.practicalApplications));
  const [learningPoints, setLearningPoints] = useState<string[]>(() => parseList(editingDevotion?.learningPoints || editingDevotion?.takeaways));

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
    getDailyDevotionVerses(bibleVersion || "BSB", book, Number(chapter))
      .then((vd) => {
        if (!active) return;
        const verses = vd?.verses || [];
        const map: Record<number, string> = {};
        verses.forEach((v) => {
          map[v.verseNumber] = v.text;
        });
        setChapterVerses(map);
        setVerseCount(Math.max(0, ...verses.map((verse) => Number(verse.verseNumber) || 0)));
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
  const verseNumbers = useMemo(
    () => Array.from({ length: maxVerses }, (_, index) => index + 1),
    [maxVerses],
  );
  const bibleVersionOptions = editions.options;

  // Set verse text reliably once a verse is selected (from the cached chapter).
  useEffect(() => {
    if (!book || !chapter || !verseNumber) { setVerseText(""); return; }
    let active = true;
    const text = chapterVerses[Number(verseNumber)];
    if (typeof text === "string") {
      setVerseText(text);
      return;
    }
    setIsVerseLoading(true);
    getDailyDevotionVerse(bibleVersion || "BSB", book, Number(chapter), Number(verseNumber))
      .then((v) => {
        if (!active) return;
        if (v?.text) setVerseText(v.text);
        else setVerseText("Verse not found.");
      })
      .catch(() => { if (active) setVerseText(''); })
      .finally(() => { if (active) setIsVerseLoading(false); });
    return () => { active = false; };
  }, [book, chapter, verseNumber, bibleVersion, chapterVerses]);

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

  const referenceStarted = Boolean(book || chapter || verseNumber);
  const referenceComplete = validPassage(book, chapter, verseNumber);
  const list = (value: string[]) => value.map(item => item.trim()).filter(Boolean);
  const invalidList = (value: string[]) => value.length === 0 || value.some(item => !item.trim());
  const invalidLearningPoints = learningPoints.length !== 3 || invalidList(learningPoints);
  const validationErrors = [
    !title.trim() && tt("Title"),
    !explanation.trim() && tt("Explanation"),
    invalidList(reflectionQuestions) && tt("Reflection Questions"),
    !prayer.trim() && tt("Prayer"),
    invalidList(practicalApplications) && tt("Practical Application"),
    invalidLearningPoints && tt("Exactly three non-empty learning points are required."),
    referenceStarted && !referenceComplete && tt("Choose a book, chapter, and verse together"),
    referenceStarted && !bibleVersion.trim() && tt("Select a Bible version."),
    ...Object.values(scheduleErrors(selectedDate, selectedTime)).map(message => message && tt(message)),
  ].filter((error): error is string => Boolean(error));
  const saveDisabled = validationErrors.length > 0;
  const fieldErrors = {
    title: !title.trim() ? tt("This field is required.") : undefined,
    explanation: !explanation.trim() ? tt("This field is required.") : undefined,
    reflectionQuestions: invalidList(reflectionQuestions) ? tt("Enter a question in each row or remove empty rows.") : undefined,
    prayer: !prayer.trim() ? tt("This field is required.") : undefined,
    practicalApplications: invalidList(practicalApplications) ? tt("Enter an application in each row or remove empty rows.") : undefined,
    learningPoints: invalidLearningPoints ? tt("Exactly three non-empty learning points are required.") : undefined,
    reference: referenceStarted && !referenceComplete ? tt("Choose a book, chapter, and verse together") : undefined,
    bibleVersion: referenceStarted && !bibleVersion.trim() ? tt("Select a Bible version.") : undefined,
    ...scheduleErrors(selectedDate, selectedTime),
  };
  const [saving, setSaving] = useState(false);

  const handleSave = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (saveDisabled) return;
    if (saving) return;
    const payload: Record<string, any> = {
      title,
      explanation,
      reflectionQuestions: JSON.stringify(list(reflectionQuestions)),
      prayer,
      practicalApplications: JSON.stringify(list(practicalApplications)),
      learningPoints: JSON.stringify(list(learningPoints)),
      bookName: book || null,
      chapter: chapter ? Number(chapter) : null,
      verseNumber: verseNumber ? Number(verseNumber) : null,
      bibleVersion: book ? bibleVersion : null,
      displayDate: format(selectedDate, "yyyy-MM-dd"),
      displayTime: selectedDate.toISOString(),
      published,
      ...(isEditing ? { id: editingDevotion?.id } : {}),
      ...(isEditing && typeof editingDevotion?.sharedStudyVersion === "number"
        ? { sharedStudyVersion: editingDevotion.sharedStudyVersion }
        : {}),
    };
    setSaving(true);
    try {
      const res = await saveDailyDevotion(payload);
      if (res.returnCode === 200) {
        toast({ title: tt("Success"), description: t.devotions.devotionUpdated });
        navigate(routes.dailyDevotions.path);
      } else if (res.returnCode === 409) {
        const conflict = res.returnData?.conflicts?.[0];
        if (conflict) {
          setConflictDialog({ open: true, conflict, payload });
        } else {
          toast({
            title: tt("Content changed"),
            description:
              res.returnMessage ||
              tt("This passage was updated elsewhere. Reload before saving."),
            variant: "destructive",
          });
        }
      } else {
        toast({ title: t.common.error, description: res.returnMessage || t.devotions.failedToAdd, variant: "destructive" });
      }
    } catch {
      toast({ title: t.common.error, description: t.common.error, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }, [
    title, book, chapter, verseNumber, bibleVersion, selectedDate, published,
    explanation, reflectionQuestions, prayer, practicalApplications, learningPoints,
    isEditing, editingDevotion, toast, t, navigate, saveDisabled,
    referenceStarted, referenceComplete, saving, validationErrors.join(" · "),
  ]);

  const closeConflict = useCallback(() => {
    setConflictDialog({ open: false, conflict: null, payload: null });
  }, []);

  const handleConflictUpdate = useCallback(async () => {
    const existing = conflictDialog.conflict?.existing;
    const payload = conflictDialog.payload;
    if (!existing?.id || !payload) return;
    setConflictDialog({ open: false, conflict: null, payload: null });
    try {
      const res = await saveDailyDevotion({ ...payload, id: existing.id });
      if (res.returnCode === 200) {
        toast({ title: t.devotions.success, description: t.devotions.devotionUpdated });
        navigate(routes.dailyDevotions.path);
      } else {
        toast({
          title: t.common.error,
          description: res.returnMessage || t.devotions.failedToAdd,
          variant: "destructive",
        });
      }
    } catch {
      toast({ title: t.common.error, description: t.common.error, variant: "destructive" });
    }
  }, [conflictDialog, navigate, t, toast]);

  const handleConflictOpenChange = useCallback(
    (open: boolean) => {
      if (!open) closeConflict();
    },
    [closeConflict],
  );

  const viewExisting = useCallback(() => {
    closeConflict();
    navigate(routes.dailyDevotions.path);
  }, [closeConflict, navigate]);

  const conflictMessage = conflictDialog.conflict?.type === "date"
    ? tt("A daily devotion already exists for this date.")
    : tt("This devotion conflicts with existing content.");

  return {
    data: {
      title, book, chapter, verseNumber, bibleVersion,
      verseText, isVerseLoading, verseNumbers, maxVerses,
      bibleVersionOptions,
      selectedDate, selectedTime, published, explanation, reflectionQuestions,
      prayer, practicalApplications, learningPoints, saveDisabled, validationErrors, fieldErrors, saving, isEditing,
      pageTitle: isEditing ? "Edit Devotion" : t.devotions.addDevotion,
      saveLabel: isEditing ? tt("Update Devotion") : tt("Save Devotion"),
      conflictDialog, conflictMessage,
      t, isRtl,
    },
    actions: {
      setTitle,
      setBook: (value: string) => { setBook(value); setChapter(''); setVerseNumber(''); setVerseText(''); },
      setChapter: (value: string) => { setChapter(value); setVerseNumber(''); setVerseText(''); },
      setVerseNumber, setBibleVersion, setSelectedDate, handleTimeChange,
      setPublished, setExplanation, setReflectionQuestions, setPrayer,
      setPracticalApplications, setLearningPoints,
      handleSave, handleConflictUpdate, closeConflict, handleConflictOpenChange,
      viewExisting,
    },
  };
}

export type AddDailyDevotionPageModel = ReturnType<typeof useAddDailyDevotion>;
export type AddDailyDevotionPageData = AddDailyDevotionPageModel["data"];
export type AddDailyDevotionPageActions = AddDailyDevotionPageModel["actions"];
