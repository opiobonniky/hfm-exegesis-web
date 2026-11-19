// useAddDailyDevotion — all state + API logic for AddDailyDevotion page
// Matches app fields: title, content, verse reference, rich content, background, etc.
import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/components/languages/languageProvider";
import { routes } from "@/components/Routes/routes";
import { useBibleEditions } from '@/hooks/useBibleEditions';
import {
  getBooksByTestament,
  getChaptersForBook,
} from "@/utilities/bibleUtils";
import { parseStructuredField } from "../helpers/contentDetailHelpers";
import { getDailyDevotionVerse, getDailyDevotionVerses, saveDailyDevotion } from "../services/add-daily-content-service";
import { tt } from '@/components/languages/hardcodedTranslate';
import { canonicalBook, parseStudies, serializeStudies, parseReferences, serializeReferences, parseTakeaways, nonEmptyReferences, nonEmptyStudies } from '../helpers/editorContent';

export function useAddDailyDevotion() {
  const { t, isRtl, lang } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const editingDevotion = location.state?.devotion as Record<string, any> | undefined;
  const isEditing = !!editingDevotion;

  // Required fields
  const [title, setTitle] = useState(editingDevotion?.title || "");
  const [content, setContent] = useState(editingDevotion?.content || "");

  // Bible reference
  const [testament, setTestament] = useState(editingDevotion?.testament || (editingDevotion?.bookName ? getBooksByTestament('Old').includes(canonicalBook(editingDevotion.bookName)) ? 'Old' : 'New' : ''));
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
  const [explanation, setExplanation] = useState(editingDevotion?.explanation || "");
  const [application, setApplication] = useState(editingDevotion?.application || "");
  const [verseIntroduction, setVerseIntroduction] = useState(editingDevotion?.verseIntroduction || "");
  const [learnMore, setLearnMore] = useState(editingDevotion?.learnMore || "");

  // Background fields
  const [backgroundAuthor, setBackgroundAuthor] = useState(editingDevotion?.backgroundAuthor || "");
  const [backgroundBook, setBackgroundBook] = useState(editingDevotion?.backgroundBook || "");
  const [backgroundContext, setBackgroundContext] = useState(editingDevotion?.backgroundContext || "");

  // Structured fields
  const [wordStudies, setWordStudies] = useState(() => serializeStudies(parseStudies(editingDevotion?.wordStudies)));
  const [practicalApplications, setPracticalApplications] = useState(() => parseStructuredField(editingDevotion?.practicalApplications));
  const [keyThemes, setKeyThemes] = useState(() => parseStructuredField(editingDevotion?.keyThemes));
  const [crossReferences, setCrossReferences] = useState(() => serializeReferences(parseReferences(editingDevotion?.crossReferences)));
  const [finalThoughts, setFinalThoughts] = useState(editingDevotion?.finalThoughts || "");
  const [takeaways, setTakeaways] = useState(() => JSON.stringify(parseTakeaways(editingDevotion?.takeaways)));

  // Derived
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
    getDailyDevotionVerses(bibleVersion || "BSB", book, Number(chapter))
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

  const saveDisabled = !title.trim() || !content.trim();

  const handleSave = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (saveDisabled) {
      toast({ title: tt("Missing fields"), description: tt("Title and content are required"), variant: "destructive" });
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
      ...(isEditing && typeof editingDevotion?.sharedStudyVersion === "number"
        ? { sharedStudyVersion: editingDevotion.sharedStudyVersion }
        : {}),
      // Rich content fields
      explanation: explanation || null,
      application: application || null,
      verseIntroduction: verseIntroduction || null,
      learnMore: learnMore || null,
      backgroundAuthor: backgroundAuthor || null,
      backgroundBook: backgroundBook || null,
      backgroundContext: backgroundContext || null,
      wordStudies: serializeStudies(nonEmptyStudies(parseStudies(wordStudies))),
      practicalApplications: practicalApplications || null,
      keyThemes: keyThemes || null,
      crossReferences: serializeReferences(nonEmptyReferences(parseReferences(crossReferences))) || null,
      finalThoughts: finalThoughts || null,
      takeaways: JSON.stringify(parseTakeaways(takeaways).map(item => item.trim()).filter(Boolean)),
    };
    try {
      const res = await saveDailyDevotion(payload);
      if (res.returnCode === 200) {
        toast({ title: t.devotions.success, description: t.devotions.devotionSaved });
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
    }
  }, [
    title, content, book, chapter, verseNumber, bibleVersion, selectedDate, published,
    explanation, application, verseIntroduction, learnMore,
    backgroundAuthor, backgroundBook, backgroundContext,
    wordStudies, practicalApplications, keyThemes, crossReferences, finalThoughts, takeaways,
    isEditing, editingDevotion, toast, t, navigate, saveDisabled,
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
      title, content, testament, book, chapter, verseNumber, bibleVersion,
      verseText, isVerseLoading, books, chapters, maxVerses,
      testamentOptions, bookOptions, chapterOptions, bibleVersionOptions,
      selectedDate, selectedTime, published, explanation, application,
      verseIntroduction, learnMore, backgroundAuthor, backgroundBook,
      backgroundContext, wordStudies, practicalApplications, keyThemes,
      crossReferences, finalThoughts, takeaways, saveDisabled, isEditing,
      pageTitle: isEditing ? "Edit Devotion" : t.devotions.addDevotion,
      saveLabel: isEditing ? "Update Devotion" : t.devotions.saveDevotion,
      conflictDialog, conflictMessage,
      t, isRtl,
    },
    actions: {
      setTitle, setContent,
      setTestament: (value: string) => { setTestament(value); setBook(''); setChapter(''); setVerseNumber(''); setVerseText(''); },
      setBook: (value: string) => { setBook(value); setChapter(''); setVerseNumber(''); setVerseText(''); },
      setChapter: (value: string) => { setChapter(value); setVerseNumber(''); setVerseText(''); },
      setVerseNumber, setBibleVersion, setSelectedDate, handleTimeChange,
      setPublished, setExplanation, setApplication, setVerseIntroduction,
      setLearnMore, setBackgroundAuthor, setBackgroundBook,
      setBackgroundContext, setWordStudies, setPracticalApplications,
      setKeyThemes, setCrossReferences, setFinalThoughts, setTakeaways,
      handleSave, handleConflictUpdate, closeConflict, handleConflictOpenChange,
      viewExisting,
    },
  };
}

export type AddDailyDevotionPageModel = ReturnType<typeof useAddDailyDevotion>;
export type AddDailyDevotionPageData = AddDailyDevotionPageModel["data"];
export type AddDailyDevotionPageActions = AddDailyDevotionPageModel["actions"];
