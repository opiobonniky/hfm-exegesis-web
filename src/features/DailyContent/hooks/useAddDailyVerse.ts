// useAddDailyVerse — all state + API logic for AddDailyVerse page
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/components/languages/languageProvider";
import { sendPostRequest } from "@/services/api";
import { checkDailyVerseDate } from "../services/add-daily-content-service";
import { usePassagePreview } from './usePassagePreview';
import { canonicalBook, parseReferences, serializeReferences, parseStudies, serializeStudies, validPassage, collectionError, parseTakeaways, nonEmptyReferences, nonEmptyStudies, requiredStudyFieldErrors, requiredReferenceError } from '../helpers/editorContent';
import { scheduleErrors } from '../helpers/scheduleValidation';
import { routes } from "@/components/Routes/routes";
import { useBibleEditions } from '@/hooks/useBibleEditions';
import type { DailyVersePayload } from "../types";
import { parseStructuredField } from "../helpers/contentDetailHelpers";
import { tt } from '@/components/languages/hardcodedTranslate';

/** All form fields in one object */
export interface VerseFormFields {
  book: string;
  chapter: string;
  verseNumber: string;
  bibleVersion: string;
  verseText: string;
  isVerseEditing: boolean;
  explanation: string;
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
  "book",
  "chapter",
  "verseNumber",
  "bibleVersion",
  "explanation",
  "application",
  "verseIntroduction",
  "backgroundAuthor",
  "backgroundBook",
  "backgroundContext",
  "wordStudies",
  "practicalApplications",
  "keyThemes",
  "crossReferences",
  "finalThoughts",
  "takeaways",
];

/** Plain-text fields derived from an existing verse explanation */
export interface MappedExplanationFields {
  explanation: string;
  application: string;
  verseIntroduction: string;
  backgroundAuthor: string;
  backgroundBook: string;
  backgroundContext: string;
  finalThoughts: string;
  wordStudies: string;
  practicalApplications: string;
  keyThemes: string;
  crossReferences: string;
  takeaways: string;
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
    takeaways?: unknown;
  };
  wordStudies?: Array<{
    surfaceText?: string;
    strongsId?: string;
    customDefinition?: string;
  }>;
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
  const { t, isRtl, lang } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const editingVerse = location.state?.verse as Record<string, any> | undefined;
  const sourceExplanation = location.state?.explanation as
    | Record<string, any>
    | undefined;
  const isEditing = !!editingVerse;

  const initialBook =
    canonicalBook(editingVerse?.bookName || sourceExplanation?.bookName || "");
  const initialChapter = editingVerse?.chapter ?? sourceExplanation?.chapter;
  const initialVerseNumber =
    editingVerse?.verseNumber ?? sourceExplanation?.verseNumber;
  const [book, setBook] = useState(initialBook);
  const [chapter, setChapter] = useState(initialChapter?.toString() || "");
  const [verseNumber, setVerseNumber] = useState(
    initialVerseNumber?.toString() || "",
  );
  const [verseEnd, setVerseEnd] = useState(String(editingVerse?.verseEnd || sourceExplanation?.verseEnd || ''));
  const editions = useBibleEditions(lang, {
    initialVersion: editingVerse?.bibleVersion || sourceExplanation?.bibleVersion,
    preserveVersion: !!(editingVerse || sourceExplanation),
  });
  const { version: bibleVersion, setVersion: setBibleVersion } = editions;
  const [published, setPublished] = useState(editingVerse?.isPublished ?? editingVerse?.published ?? true);
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const d = editingVerse?.displayDate
      ? new Date(editingVerse.displayDate)
      : new Date();
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
  const [explanation, setExplanation] = useState(
    editingVerse?.explanation || "",
  );
  const [application, setApplication] = useState(
    editingVerse?.application || "",
  );
  const [verseIntroduction, setVerseIntroduction] = useState(
    editingVerse?.verseIntroduction || "",
  );

  // Background fields
  const [backgroundAuthor, setBackgroundAuthor] = useState(
    editingVerse?.backgroundAuthor || "",
  );
  const [backgroundBook, setBackgroundBook] = useState(
    editingVerse?.backgroundBook || "",
  );
  const [backgroundContext, setBackgroundContext] = useState(
    editingVerse?.backgroundContext || "",
  );

  // Structured fields (parse JSON arrays to newline-separated text)
  const [wordStudies, setWordStudies] = useState(() =>
    serializeStudies(parseStudies(editingVerse?.wordStudies)),
  );
  const [practicalApplications, setPracticalApplications] = useState(() =>
    parseStructuredField(editingVerse?.practicalApplications),
  );
  const [keyThemes, setKeyThemes] = useState(() =>
    parseStructuredField(editingVerse?.keyThemes),
  );
  const [crossReferences, setCrossReferences] = useState(() =>
    serializeReferences(parseReferences(editingVerse?.crossReferences)),
  );
  const [finalThoughts, setFinalThoughts] = useState(
    editingVerse?.finalThoughts || "",
  );
  const [takeaways, setTakeaways] = useState(() =>
    JSON.stringify(parseTakeaways(editingVerse?.takeaways)),
  );

  // Conflict dialog
  const [conflictDialog, setConflictDialog] = useState<{
    open: boolean;
    conflict: any;
    payload: any;
  }>({ open: false, conflict: null, payload: null });

  // Set when the user chooses "Replace" for a preflight date conflict. The
  // save then updates this row instead of creating a new one.
  const [replaceTargetId, setReplaceTargetId] = useState<number | null>(null);

  // Auto-populate from an existing verse explanation (loaded when a verse is picked)
  const [explanationSource, setExplanationSource] =
    useState<MappedExplanationFields | null>(null);
  const [explanationLoading, setExplanationLoading] = useState(false);
  const [explanationApplied, setExplanationApplied] = useState(false);
  const [explanationError, setExplanationError] = useState(false);

  const preview = usePassagePreview(book, chapter, verseNumber, verseEnd, bibleVersion);
  const isVerseLoading = preview.loading;

  useEffect(() => { if (!isVerseEditing) setVerseText(preview.text); }, [preview.text, isVerseEditing]);

  // Reset descendants atomically. Never carry an old chapter, range, or edited
  // quotation into a different passage/translation.
  const changeBook = (value: string) => { setBook(canonicalBook(value)); setChapter(''); setVerseNumber(''); setVerseEnd(''); setIsVerseEditing(false); setVerseText(''); };
  const changeChapter = (value: string) => { setChapter(value); setVerseNumber(''); setVerseEnd(''); setIsVerseEditing(false); setVerseText(''); };
  const changeVerse = (value: string) => { setVerseNumber(value); setVerseEnd(''); setIsVerseEditing(false); setVerseText(''); };
  const changeEnd = (value: string) => { setVerseEnd(value); setIsVerseEditing(false); setVerseText(''); };
  const changeVersion = (value: string) => { setBibleVersion(value); setIsVerseEditing(false); setVerseText(''); };

  // Map an existing verse explanation record onto the daily-verse fields.
  const mapExplanationToFields = useCallback(
    (d: VerseExplanationRecord | null | undefined): MappedExplanationFields => {
      const exegesis = d?.exegesis || {};
      const study = d?.studyMetadata || {};
      const wordStudies = serializeStudies(parseStudies(d?.wordStudies));
      const practicalApplications = (d?.practicalApps || [])
        .map((pa) => (pa.applicationText || "").trim())
        .filter(Boolean)
        .join("\n");
      const keyThemes = (d?.themes || [])
        .map((th) => (th.themeName || "").trim())
        .filter(Boolean)
        .join("\n");
      const crossReferences = serializeReferences(parseReferences(d?.crossReferences));
      const takeaways = JSON.stringify(parseTakeaways(d?.studyMetadata?.takeaways ?? study.takeaways));

      return {
        explanation: exegesis.explanationText || "",
        application: exegesis.applicationText || "",
        verseIntroduction: study.introduction || "",
        backgroundAuthor: study.backgroundAuthor || "",
        backgroundBook: study.backgroundBook || "",
        backgroundContext: study.backgroundContext || "",
        finalThoughts: study.finalThoughts || "",
        takeaways,
        wordStudies,
        practicalApplications,
        keyThemes,
        crossReferences,
      };
    },
    [],
  );

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
          const fields = mapExplanationToFields(
            res.returnData as VerseExplanationRecord,
          );
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
    if (fields.verseIntroduction && !verseIntroduction)
      setVerseIntroduction(fields.verseIntroduction);
    if (fields.backgroundAuthor && !backgroundAuthor)
      setBackgroundAuthor(fields.backgroundAuthor);
    if (fields.backgroundBook && !backgroundBook)
      setBackgroundBook(fields.backgroundBook);
    if (fields.backgroundContext && !backgroundContext)
      setBackgroundContext(fields.backgroundContext);
    if (fields.finalThoughts && !finalThoughts)
      setFinalThoughts(fields.finalThoughts);
    if (fields.wordStudies && !wordStudies) setWordStudies(fields.wordStudies);
    if (fields.practicalApplications && !practicalApplications)
      setPracticalApplications(fields.practicalApplications);
    if (fields.keyThemes && !keyThemes) setKeyThemes(fields.keyThemes);
    if (fields.crossReferences && !crossReferences)
      setCrossReferences(fields.crossReferences);
    if (fields.takeaways && !takeaways) setTakeaways(fields.takeaways);
  };

  // Overwrite all mapped fields with the loaded explanation content.
  const applyExplanation = useCallback((fields: MappedExplanationFields) => {
    if (!fields) return;
    setExplanation(fields.explanation || "");
    setApplication(fields.application || "");
    setVerseIntroduction(fields.verseIntroduction || "");
    setBackgroundAuthor(fields.backgroundAuthor || "");
    setBackgroundBook(fields.backgroundBook || "");
    setBackgroundContext(fields.backgroundContext || "");
    setFinalThoughts(fields.finalThoughts || "");
    setWordStudies(fields.wordStudies || "");
    setPracticalApplications(fields.practicalApplications || "");
    setKeyThemes(fields.keyThemes || "");
    setCrossReferences(fields.crossReferences || "");
    setTakeaways(fields.takeaways || "");
    setExplanationApplied(true);
  }, []);

  // Sync time with date
  useEffect(() => {
    setSelectedTime(
      `${String(selectedDate.getHours()).padStart(2, "0")}:${String(selectedDate.getMinutes()).padStart(2, "0")}`,
    );
  }, [selectedDate]);

  // Preflight the selected date as soon as the user picks it. The save path
  // still performs the authoritative check, but this surfaces the decision
  // immediately instead of waiting for a 409.
  const selectedDateKey = Number.isFinite(selectedDate.getTime()) ? format(selectedDate, "yyyy-MM-dd") : '';
  const previousDateKey = useRef(selectedDateKey);
  const dateCheckToken = useRef(0);

  useEffect(() => {
    if (previousDateKey.current === selectedDateKey) return;
    previousDateKey.current = selectedDateKey;
    setReplaceTargetId(null);
    const token = ++dateCheckToken.current;
    if (!selectedDateKey) return;

    const editingDate = editingVerse?.displayDate ? new Date(editingVerse.displayDate) : null;
    const editingDateKey = editingDate && Number.isFinite(editingDate.getTime())
      ? format(editingDate, "yyyy-MM-dd") : null;
    // Keeping the current verse on its own date can never conflict with itself.
    if (isEditing && editingDateKey === selectedDateKey) return;

    checkDailyVerseDate(selectedDateKey, editingVerse?.id)
      .then((res) => {
        if (token !== dateCheckToken.current) return;
        const existing = res?.returnData?.existing;
        if (res?.returnCode === 200 && existing) {
          setConflictDialog({
            open: true,
            conflict: { type: "date", existing },
            payload: null,
          });
        }
      })
      .catch(() => {
        // Network failures must not block editing; Save still validates.
      });
  }, [selectedDateKey, isEditing, editingVerse]);

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

  const requireRichRows = !isEditing;
  const studies = parseStudies(wordStudies);
  const references = parseReferences(crossReferences);
  const richContentError = requireRichRows
    ? studies.map(row => Object.values(requiredStudyFieldErrors(row)).find(Boolean)).find(Boolean) ||
      references.map(requiredReferenceError).find(Boolean) || ''
    : collectionError(studies, references) ||
      (studies.length !== nonEmptyStudies(studies).length ? 'Fill or remove the empty word study.' : '') ||
      (references.length !== nonEmptyReferences(references).length ? 'Fill or remove the empty cross reference.' : '');
  const takeawayErrors = parseTakeaways(takeaways).map(item => item.trim() ? '' : 'Enter a takeaway or remove the row.');
  const fieldErrors = {
    bookName: book ? '' : 'Select a book.',
    chapter: chapter ? '' : 'Select a chapter.',
    verseNumber: !verseNumber ? 'Select a verse.' : !validPassage(book, chapter, verseNumber) ? 'Select a valid passage.' : '',
    verseEnd: verseEnd && !validPassage(book, chapter, verseNumber, verseEnd) ? 'Select a valid end verse.' : '',
    bibleVersion: bibleVersion.trim() ? '' : 'Select a Bible version.',
    verseText: !isVerseLoading && !verseText.trim() ? 'Enter the verse text.' : '',
    ...scheduleErrors(selectedDate, selectedTime),
    explanation: explanation.trim() ? '' : 'Enter an explanation.',
    application: application.trim() ? '' : 'Enter an application.',
    verseIntroduction: verseIntroduction.trim() ? '' : 'Enter a verse introduction.',
  };
  const { explanation: requiredExplanationError, application: applicationError, verseIntroduction: introductionError,
    date: dateError, time: timeError, ...referenceErrors } = fieldErrors;
  const validateStep = (step: number) => {
    if (step === 0) return !Object.values(referenceErrors).some(Boolean) && !preview.loading && !preview.error && !isVerseLoading;
    if (step === 1) return !(requiredExplanationError || applicationError);
    if (step === 2) return !introductionError && !richContentError && !takeawayErrors.some(Boolean);
    if (step === 3) return !dateError && !timeError;
    return true;
  };
  const saveDisabled = [0, 1, 2, 3].some(step => !validateStep(step));

  const handleSave = useCallback(async () => {
    if (saveDisabled) return;
    const targetId = isEditing ? editingVerse?.id : replaceTargetId;
    const payload: DailyVersePayload = {
      bookName: book,
      chapter: Number(chapter),
      verseNumber: Number(verseNumber),
      verseEnd: verseEnd ? Number(verseEnd) : null,
      bibleVersion,
      verseText: verseText || null,
      explanation,
      application,
      verseIntroduction,
      backgroundAuthor: backgroundAuthor || undefined,
      backgroundBook: backgroundBook || undefined,
      backgroundContext: backgroundContext || undefined,
      wordStudies: serializeStudies(nonEmptyStudies(parseStudies(wordStudies))),
      practicalApplications: practicalApplications || undefined,
      keyThemes: keyThemes || undefined,
      crossReferences: serializeReferences(nonEmptyReferences(parseReferences(crossReferences))),
      finalThoughts: finalThoughts || undefined,
      takeaways: JSON.stringify(parseTakeaways(takeaways).map(item => item.trim()).filter(Boolean)),
      displayDate: format(selectedDate, "yyyy-MM-dd"),
      displayTime: selectedDate.toISOString(),
      published,
      ...(targetId ? { id: targetId } : {}),
    };
    try {
      const res = await sendPostRequest("admin", "add-daily-verse", payload);
      if (res.returnCode === 200) {
        toast({
          title: t.dailyVerse.toastSuccess,
          description: res.returnMessage || t.dailyVerse.verseAdded,
        });
        setTimeout(() => navigate(routes.adminDailyVerses.path), 2000);
      } else if (res.returnCode === 409) {
        const conflict = res.returnData?.conflicts?.[0];
        if (conflict) {
          // A save-time conflict is authoritative; ignore any slower preflight
          // response that could otherwise replace this dialog's payload.
          dateCheckToken.current += 1;
          setConflictDialog({
            open: true,
            conflict,
            payload,
          });
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
        toast({
          title: t.dailyVerse.toastSaveFailedDesc,
          description: res.returnMessage,
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: t.dailyVerse.toastSaveErrorDesc,
        description: t.dailyVerse.toastSaveErrorDesc,
        variant: "destructive",
      });
      console.error(err);
    }
  }, [
    book,
    chapter,
    verseNumber,
    verseEnd, saveDisabled,
    bibleVersion,
    verseText,
    explanation,
    application,
    verseIntroduction,
    backgroundAuthor,
    backgroundBook,
    backgroundContext,
    wordStudies,
    practicalApplications,
    keyThemes,
    crossReferences,
    finalThoughts,
    takeaways,
    selectedDate,
    published,
    isEditing,
    editingVerse,
    replaceTargetId,
    toast,
    t,
    navigate,
  ]);

  const handleConflictUpdate = useCallback(async () => {
    const c = conflictDialog.conflict;
    if (!c?.existing?.id) return;

    // Preflight conflict: the user picked a taken date before finishing the
    // form. Remember the row and apply the replacement on the next save so we
    // never overwrite existing content with an incomplete form.
    if (!conflictDialog.payload) {
      setReplaceTargetId(Number(c.existing.id));
      setConflictDialog({ open: false, conflict: null, payload: null });
      toast({
        title: tt("Replace scheduled"),
        description: tt("The existing verse will be replaced when you save."),
      });
      return;
    }

    setConflictDialog({ open: false, conflict: null, payload: null });
    try {
      const res = await sendPostRequest("admin", "add-daily-verse", {
        ...conflictDialog.payload,
        id: c.existing.id,
      });
      if (res.returnCode === 200) {
        toast({
          title: t.dailyVerse.toastUpdated,
          description: t.dailyVerse.toastUpdateSuccessDesc,
        });
        setTimeout(() => navigate(routes.adminDailyVerses.path), 2000);
      } else {
        toast({
          title: t.dailyVerse.toastUpdateFailedDesc,
          description: res.returnMessage,
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: t.dailyVerse.toastUpdateFailedDesc,
        description: t.dailyVerse.toastUpdateFailedDesc,
        variant: "destructive",
      });
    }
  }, [conflictDialog, toast, t, navigate]);

  const closeConflict = useCallback(() => {
    setConflictDialog({ open: false, conflict: null, payload: null });
  }, []);

  const handleConflictOpenChange = useCallback(
    (open: boolean) => {
      if (!open) closeConflict();
    },
    [closeConflict],
  );

  const viewExisting = useCallback(() => {
    const existing = conflictDialog.conflict?.existing;
    closeConflict();
    if (existing) {
      navigate(
        `${routes.dailyVerseDetail.path}?verse=${encodeURIComponent(JSON.stringify(existing))}`,
      );
      return;
    }
    navigate(routes.adminDailyVerses.path);
  }, [closeConflict, conflictDialog, navigate]);

  const conflictReference = conflictDialog.conflict?.existing?.bookName
    ? `${conflictDialog.conflict.existing.bookName} ${conflictDialog.conflict.existing.chapter}:${conflictDialog.conflict.existing.verseNumber}`
    : "";
  const conflictMessage =
    conflictDialog.conflict?.type === "date"
      ? t.dailyVerse.verseConflictForDate.replace("{ref}", conflictReference)
      : t.dailyVerse.verseConflictForVerse
          .replace("{ref}", conflictReference)
          .replace(
            "{date}",
            conflictDialog.conflict?.existing?.displayDate || "",
          );

  return {
    data: {
    book,
    setBook,
    chapter,
    setChapter,
    verseNumber,
    setVerseNumber,
    verseEnd,
    setVerseEnd: changeEnd,
    passageError: preview.error,
    retryPassage: preview.retry,
    verseNumbers: preview.verseNumbers,
    richContentError,
    fieldErrors,
    requireRichRows,
    takeawayErrors,
    bibleVersion,
    bibleVersionOptions: editions.options,
    setBibleVersion,
    published,
    setPublished,
    selectedDate,
    setSelectedDate,
    selectedTime,
    handleTimeChange,
    verseText,
    setVerseText,
    isVerseEditing,
    setIsVerseEditing,
    isVerseLoading,
    explanation,
    setExplanation,
    application,
    setApplication,
    verseIntroduction,
    setVerseIntroduction,
    backgroundAuthor,
    setBackgroundAuthor,
    backgroundBook,
    setBackgroundBook,
    backgroundContext,
    setBackgroundContext,
    wordStudies,
    setWordStudies,
    practicalApplications,
    setPracticalApplications,
    keyThemes,
    setKeyThemes,
    crossReferences,
    setCrossReferences,
    finalThoughts,
    setFinalThoughts,
    takeaways,
    setTakeaways,
    // Derived
    saveDisabled,
    validateStep,
    isEditing,
    // Explanation auto-populate
    explanationSource,
    explanationLoading,
    explanationApplied,
    explanationError,
    applyExplanation,
    // Actions
    handleSave,
    handleConflictUpdate,
    // Conflict dialog
    conflictDialog,
    closeConflict,
    handleConflictOpenChange,
    viewExisting,
    conflictMessage,
    // Helpers
    t,
    isRtl,
    },
    actions: {
    setBook: changeBook, setChapter: changeChapter, setVerseNumber: changeVerse, setVerseEnd: changeEnd, setBibleVersion: changeVersion, setPublished,
    setSelectedDate, handleTimeChange, setVerseText, setIsVerseEditing, setExplanation,
    setApplication, setVerseIntroduction, setBackgroundAuthor, setBackgroundBook,
    setBackgroundContext, setWordStudies, setPracticalApplications, setKeyThemes,
    setCrossReferences, setFinalThoughts, setTakeaways, validateStep, applyExplanation,
    handleSave, handleConflictUpdate, closeConflict, handleConflictOpenChange, viewExisting,
    },
  };
}

export type AddDailyVersePageModel = ReturnType<typeof useAddDailyVerse>;
export type AddDailyVersePageViewModel = AddDailyVersePageModel["data"] & AddDailyVersePageModel["actions"];

export default useAddDailyVerse;
