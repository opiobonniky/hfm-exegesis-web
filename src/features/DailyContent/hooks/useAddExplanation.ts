// useAddExplanation — structured editor hook for add/edit verse explanations
import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { sendPostRequest } from "@/services/api";
import { bibleApi } from "@/services/bibleApi";
import { useBibleEditions } from '@/hooks/useBibleEditions';
import { useLanguage } from '@/components/languages/languageProvider';
import { BIBLE_BOOKS } from "@/data/staticData";
import { BIBLE_BOOK_CHAPTERS } from "@/features/Bible/constants";
import { VERSE_EXPLANATION_STEP_ORDER } from "../constants";
import type {
  CrossRefItem,
  ExplanationForm,
  VerseExplanationStepId,
  WordStudyItem,
} from "../types";
import { tt } from '@/components/languages/hardcodedTranslate';
import { routePaths, routes } from "@/components/Routes/routes";
import { usePassagePreview } from './usePassagePreview';
import { canonicalBook, parseStudies, parseReferences, validPassage, collectionError, nonEmptyReferences, nonEmptyStudies } from '../helpers/editorContent';
import {
  getExplanationFieldErrors,
  getExplanationStepErrors,
  hasExplanationErrors,
  type ExplanationFieldErrors,
} from '../helpers/explanationValidation';

const parseTakeaways = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((item) =>
        typeof item === "string" ? item.trim() : String(item ?? "").trim(),
      )
      .filter(Boolean);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parseTakeaways(parsed);
    } catch {
      // fall back to treating the raw string as one takeaway
    }

    return [trimmed];
  }

  return [];
};

const EMPTY_FORM: ExplanationForm = {
  bookName: "",
  chapter: "",
  verseNumber: "",
  verseEnd: "",
  bibleVersion: "BSB",
  exegesis: { explanationText: "", applicationText: "" },
  studyMetadata: {
    introduction: "",
    backgroundAuthor: "",
    backgroundBook: "",
    backgroundContext: "",
    finalThoughts: "",
    takeaways: [],
  },
  wordStudies: [],
  practicalApps: [],
  crossReferences: [],
  themes: [],
};

export function useAddExplanation() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const params = useParams<{
    bookName?: string;
    chapter?: string;
    verseNumber?: string;
  }>();
  const routeEditMode =
    !!params.bookName && !!params.chapter && !!params.verseNumber;

  const { lang } = useLanguage();
  const [formState, setForm] = useState<ExplanationForm>(() => ({
    ...EMPTY_FORM,
    ...(routeEditMode ? {
      bookName: canonicalBook(decodeURIComponent(params.bookName!)),
      chapter: params.chapter!, verseNumber: params.verseNumber!,
    } : {}),
  }));
  const [loadingExisting, setLoadingExisting] = useState(false);
  const [existingFound, setExistingFound] = useState(false);
  const editions = useBibleEditions(lang, { preserveVersion: existingFound || routeEditMode });
  const form = { ...formState, bibleVersion: editions.version };
  const [existingId, setExistingId] = useState<number | null>(null);
  const [sharedStudyVersion, setSharedStudyVersion] = useState<number | null>(null);
  // Saved studies are not re-flagged merely because they are incomplete legacy
  // content. Validation starts once the editor actually changes rich content.
  const [richContentTouched, setRichContentTouched] = useState(false);
  const [checkedReference, setCheckedReference] = useState('');
  const [lookupError, setLookupError] = useState(false);
  const [lookupAttempt, setLookupAttempt] = useState(0);
  const referenceKey = form.bookName && form.chapter && form.verseNumber
    ? `${form.bookName}:${form.chapter}:${form.verseNumber}` : '';
  const checkingExisting = !!referenceKey && (loadingExisting || checkedReference !== referenceKey);
  const isEditMode = existingFound;
  // Empty fields are shown inline. Saved rich content is exempt until edited.
  const fieldErrors: ExplanationFieldErrors = useMemo(
    () => getExplanationFieldErrors(form, { hideRichContent: existingFound && !richContentTouched }),
    // form is a fresh shallow object each render; depend on its content fields.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [formState, form.bibleVersion, existingFound, richContentTouched],
  );
  const stepErrors = useMemo(() => getExplanationStepErrors(fieldErrors), [fieldErrors]);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] =
    useState<VerseExplanationStepId>("reference");
  const translationOptions = editions.translations;
  const preview = usePassagePreview(form.bookName, form.chapter, form.verseNumber, form.verseEnd, form.bibleVersion);
  const selectedVerseText = preview.text;
  const verseTextLoading = preview.loading;
  const chapterVerseCount = preview.verses.length;
  const verseOptions = preview.verseNumbers;
  const verseOptionsLoading = preview.loading;
  const [crossRefVerseOptions, setCrossRefVerseOptions] = useState<
    Record<number, { key: string; verses: number[] }>
  >({});
  const [crossRefVerseLoading, setCrossRefVerseLoading] = useState<
    Record<number, boolean>
  >({});

  const maxChapterNumber = useMemo(() => {
    const bookName = form.bookName.trim();
    if (!bookName) return 1;
    return (
      BIBLE_BOOK_CHAPTERS[bookName as keyof typeof BIBLE_BOOK_CHAPTERS] ?? 1
    );
  }, [form.bookName]);

  const maxVerseNumber = chapterVerseCount || 1;

  const bookOptions = useMemo(
    () =>
      Object.keys(BIBLE_BOOK_CHAPTERS).map((name, index) => ({
        value: name,
        label: name,
        group: index < 39 ? "Old Testament" : "New Testament",
      })),
    [],
  );

  const chapterOptions = useMemo(() => {
    const count =
      BIBLE_BOOK_CHAPTERS[
        form.bookName as keyof typeof BIBLE_BOOK_CHAPTERS
      ];
    return count
      ? Array.from({ length: count }, (_, index) => index + 1)
      : [];
  }, [form.bookName]);

  const selectedVerse = useMemo(
    () => (form.verseNumber ? Number(form.verseNumber) : null),
    [form.verseNumber],
  );

  const verseLoadingForTrigger = useMemo(
    () => verseOptionsLoading && verseOptions.length === 0,
    [verseOptionsLoading, verseOptions.length],
  );

  const sortedTranslationOptions = editions.options;

  const crossReferenceBookOptions = bookOptions;
  const crossReferenceChapterOptions = useMemo(
    () =>
      Object.fromEntries(
        form.crossReferences.map((reference, index) => {
          const count =
            BIBLE_BOOK_CHAPTERS[
              reference.bookName as keyof typeof BIBLE_BOOK_CHAPTERS
            ];
          return [
            index,
            count ? Array.from({ length: count }, (_, chapter) => chapter + 1) : [],
          ];
        }),
      ) as Record<number, number[]>,
    [form.crossReferences],
  );
  const crossReferenceVerseLoading = useMemo(
    () =>
      Object.fromEntries(
        form.crossReferences.map((_, index) => {
          const verses = crossRefVerseOptions[index]?.verses || [];
          return [index, Boolean(crossRefVerseLoading[index] && verses.length === 0)];
        }),
      ) as Record<number, boolean>,
    [form.crossReferences, crossRefVerseOptions, crossRefVerseLoading],
  );

  const currentStepIndex = useMemo(
    () => VERSE_EXPLANATION_STEP_ORDER.indexOf(activeTab),
    [activeTab],
  );

  const currentStep = useMemo(
    () =>
      VERSE_EXPLANATION_STEP_ORDER[Math.max(0, currentStepIndex)] ??
      "reference",
    [currentStepIndex],
  );

  const referenceComplete = useMemo(
    () =>
      validPassage(form.bookName, form.chapter, form.verseNumber, form.verseEnd) && !!preview.text && !preview.loading && !preview.error,
    [form.bookName, form.chapter, form.verseNumber, form.verseEnd, preview.text, preview.loading, preview.error],
  );

  const exegesisComplete = useMemo(
    () => form.exegesis.explanationText.trim().length >= 20,
    [form.exegesis.explanationText],
  );

  const stepCompletion: Record<VerseExplanationStepId, boolean> = useMemo(
    () => ({
      reference: referenceComplete && !stepErrors.reference,
      exegesis: exegesisComplete && !stepErrors.exegesis,
      learnMore: !stepErrors.learnMore,
    }),
    [referenceComplete, exegesisComplete, stepErrors],
  );

  const completionPercent = useMemo(
    () =>
      Math.round(
        (Object.values(stepCompletion).filter(Boolean).length /
          VERSE_EXPLANATION_STEP_ORDER.length) *
          100,
      ),
    [stepCompletion],
  );

  const goToStep = useCallback(
    (stepId: VerseExplanationStepId) => {
      const targetIndex = VERSE_EXPLANATION_STEP_ORDER.indexOf(stepId);
      if (targetIndex > currentStepIndex) {
        const unfinished = VERSE_EXPLANATION_STEP_ORDER.slice(
          currentStepIndex,
          targetIndex,
        ).find((step) => !stepCompletion[step]);
        if (unfinished) {
          const message =
            stepErrors[unfinished] ||
            tt("Complete the current step before continuing.");
          toast({ title: tt("Complete this step first"), description: tt(message), variant: "destructive" });
          return;
        }
      }
      setActiveTab(stepId);
    },
    [currentStepIndex, stepCompletion, stepErrors, toast],
  );

  const goNext = useCallback(() => {
    const nextIndex = Math.min(
      VERSE_EXPLANATION_STEP_ORDER.length - 1,
      currentStepIndex + 1,
    );
    if (nextIndex !== currentStepIndex)
      goToStep(VERSE_EXPLANATION_STEP_ORDER[nextIndex]);
  }, [currentStepIndex, goToStep]);

  const goPrevious = useCallback(() => {
    const prevIndex = Math.max(0, currentStepIndex - 1);
    if (prevIndex !== currentStepIndex)
      goToStep(VERSE_EXPLANATION_STEP_ORDER[prevIndex]);
  }, [currentStepIndex, goToStep]);

  const canAdvanceFromCurrent = stepCompletion[currentStep];

  // Selecting a saved passage edits that record rather than creating a duplicate.
  // Ignore responses for selections the editor has already moved away from.
  useEffect(() => {
    let active = true;
    setExistingFound(false);
    setExistingId(null);
    setSharedStudyVersion(null);
    setLookupError(false);
    if (!referenceKey) {
      setLoadingExisting(false);
      setCheckedReference('');
      return;
    }
    setLoadingExisting(true);
    sendPostRequest("bible", "get-verse-explanation", {
      bookName: form.bookName,
      chapter: Number(form.chapter),
      verseNumber: Number(form.verseNumber),
      lang: 'en',
    })
      .then((res) => {
        if (!active) return;
        if (res?.returnCode === 200 && res.returnData) {
          const d = res.returnData;
          editions.setVersion(d.bibleVersion || 'BSB');
          setForm({
            bookName: canonicalBook(d.bookName || ''),
            chapter: String(d.chapter || ""),
            verseNumber: String(d.verseNumber || ""),
            verseEnd: String(d.verseEnd || ''),
            bibleVersion: d.bibleVersion || "BSB",
            exegesis: d.exegesis || {
              explanationText: "",
              applicationText: "",
            },
            studyMetadata: {
              introduction: d.studyMetadata?.introduction || "",
              backgroundAuthor: d.studyMetadata?.backgroundAuthor || "",
              backgroundBook: d.studyMetadata?.backgroundBook || "",
              backgroundContext: d.studyMetadata?.backgroundContext || "",
              finalThoughts: d.studyMetadata?.finalThoughts || "",
              takeaways: parseTakeaways(d.studyMetadata?.takeaways),
            },
            wordStudies: parseStudies(d.wordStudies).map((row, sortOrder) => ({ ...row, sortOrder })),
            practicalApps: d.practicalApps || [],
            crossReferences: parseReferences(d.crossReferences).map((row, sortOrder) => ({ ...row, commentary: row.commentary || '', sortOrder })),
            themes: d.themes || [],
          });
          setExistingFound(true);
          setRichContentTouched(false);
          setExistingId(d.id ?? null);
          setSharedStudyVersion(
            typeof d.sharedStudyVersion === "number"
              ? d.sharedStudyVersion
              : null,
          );
        } else if (res?.returnCode !== 404) {
          setLookupError(true);
        }
      })
      .catch(() => {
        if (active) setLookupError(true);
      })
      .finally(() => {
        if (active) {
          setLoadingExisting(false);
          setCheckedReference(referenceKey);
        }
      });
    return () => { active = false; };
  }, [referenceKey, lookupAttempt]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateField = useCallback(
    <K extends keyof ExplanationForm>(key: K, value: ExplanationForm[K]) => {
      if (key === 'bibleVersion') { editions.setVersion(String(value)); return; }
      if (key === 'wordStudies' || key === 'crossReferences') setRichContentTouched(true);
      setForm((prev) => {
        // Saved content belongs to its selected passage; never carry its ID or
        // teaching into the next passage. Preserve manually composed new notes.
        if (existingFound && ['bookName', 'chapter', 'verseNumber'].includes(key) && value !== prev[key]) {
          prev = { ...EMPTY_FORM, bookName: prev.bookName, chapter: prev.chapter, verseNumber: prev.verseNumber, bibleVersion: prev.bibleVersion };
        }
        if (key === 'bookName') return { ...prev, bookName: canonicalBook(String(value)), chapter: '', verseNumber: '', verseEnd: '' };
        if (key === 'chapter') return { ...prev, chapter: String(value), verseNumber: '', verseEnd: '' };
        if (key === 'verseNumber') return { ...prev, verseNumber: String(value), verseEnd: '' };
        return { ...prev, [key]: value };
      });
    },
    [existingFound, editions.setVersion],
  );

  const updateNested = useCallback(
    (parent: string, child: string, value: any) => {
      setForm((prev) => {
        const p = prev as any;
        return { ...prev, [parent]: { ...p[parent], [child]: value } };
      });
    },
    [],
  );

  // Word studies
  const addWordStudy = useCallback(() => {
    setRichContentTouched(true);
    setForm((prev) => ({
      ...prev,
      wordStudies: [
        ...prev.wordStudies,
        {
          strongsId: "",
          surfaceText: "",
          customDefinition: "",
          sortOrder: prev.wordStudies.length,
        },
      ],
    }));
  }, []);
  const removeWordStudy = useCallback((i: number) => {
    setRichContentTouched(true);
    setForm((prev) => ({
      ...prev,
      wordStudies: prev.wordStudies.filter((_, idx) => idx !== i),
    }));
  }, []);
  const updateWordStudy = useCallback(
    (i: number, field: keyof WordStudyItem, value: string | number) => {
      setRichContentTouched(true);
      setForm((prev) => {
        const next = [...prev.wordStudies];
        next[i] = { ...next[i], [field]: value };
        return { ...prev, wordStudies: next };
      });
    },
    [],
  );

  // Practical apps
  const addPracticalApp = useCallback(() => {
    setForm((prev) => ({
      ...prev,
      practicalApps: [
        ...prev.practicalApps,
        { applicationText: "", sortOrder: prev.practicalApps.length },
      ],
    }));
  }, []);
  const removePracticalApp = useCallback((i: number) => {
    setForm((prev) => ({
      ...prev,
      practicalApps: prev.practicalApps.filter((_, idx) => idx !== i),
    }));
  }, []);
  const updatePracticalApp = useCallback((i: number, value: string) => {
    setForm((prev) => {
      const next = [...prev.practicalApps];
      next[i] = { ...next[i], applicationText: value };
      return { ...prev, practicalApps: next };
    });
  }, []);

  // Cross references
  const addCrossRef = useCallback(() => {
    setForm((prev) => ({
      ...prev,
      crossReferences: [
        ...prev.crossReferences,
        {
          bookName: "",
          chapter: 0,
          verseNumber: 0,
          referenceText: "",
          commentary: "",
          sortOrder: prev.crossReferences.length,
        },
      ],
    }));
  }, []);
  const removeCrossRef = useCallback((i: number) => {
    setForm((prev) => ({
      ...prev,
      crossReferences: prev.crossReferences.filter((_, idx) => idx !== i),
    }));
    setCrossRefVerseOptions((cur) => {
      const next: Record<number, { key: string; verses: number[] }> = {};
      Object.keys(cur).forEach((key) => {
        const k = Number(key);
        if (k === i) return;
        next[k > i ? k - 1 : k] = cur[k];
      });
      return next;
    });
    setCrossRefVerseLoading((cur) => {
      const next: Record<number, boolean> = {};
      Object.keys(cur).forEach((key) => {
        const k = Number(key);
        if (k === i) return;
        next[k > i ? k - 1 : k] = cur[k];
      });
      return next;
    });
  }, []);
  const updateCrossRef = useCallback(
    (i: number, field: keyof CrossRefItem, value: string | number) => {
      setForm((prev) => {
        const next = [...prev.crossReferences];
        next[i] = { ...next[i], [field]: value };
        return { ...prev, crossReferences: next };
      });
    },
    [],
  );

  // Set a cross-reference verse and auto-fill its quoted text
  const pickCrossRefVerse = useCallback(
    (index: number, verse: number) => {
      setForm((prev) => {
        const entry = prev.crossReferences[index];
        const translation = prev.bibleVersion?.trim() || "Berean";
        if (!entry?.bookName || !entry.chapter) return prev;
        bibleApi
          .getVerse(translation, entry.bookName, entry.chapter, verse)
          .then((vd) => {
            updateCrossRef(index, "referenceText", vd?.text || "");
          })
          .catch(() => updateCrossRef(index, "referenceText", ""));
        const next = [...prev.crossReferences];
        next[index] = { ...next[index], verseNumber: verse };
        return { ...prev, crossReferences: next };
      });
    },
    [updateCrossRef],
  );

  // Themes
  const addTheme = useCallback(() => {
    setForm((prev) => ({
      ...prev,
      themes: [
        ...prev.themes,
        { themeName: "", sortOrder: prev.themes.length },
      ],
    }));
  }, []);
  const removeTheme = useCallback((i: number) => {
    setForm((prev) => ({
      ...prev,
      themes: prev.themes.filter((_, idx) => idx !== i),
    }));
  }, []);
  const updateTheme = useCallback((i: number, value: string) => {
    setForm((prev) => {
      const next = [...prev.themes];
      next[i] = { ...next[i], themeName: value };
      return { ...prev, themes: next };
    });
  }, []);

  const rawRichContentError = collectionError(form.wordStudies, form.crossReferences);
  const richContentError = existingFound && !richContentTouched ? '' : rawRichContentError;
  const isValid = !checkingExisting && !lookupError && !richContentError &&
    !hasExplanationErrors(fieldErrors) && referenceComplete && exegesisComplete;

  const handleSave = useCallback(async () => {
    if (!isValid || saving) return;
    setSaving(true);
    try {
      const payload: any = {
        bookName: form.bookName,
        chapter: Number(form.chapter),
        verseNumber: Number(form.verseNumber),
        verseEnd: form.verseEnd ? Number(form.verseEnd) : null,
        bibleVersion: form.bibleVersion,
        exegesis: form.exegesis,
        studyMetadata: { ...form.studyMetadata, takeaways: form.studyMetadata.takeaways.map(item => item.trim()).filter(Boolean) },
        wordStudies: nonEmptyStudies(form.wordStudies),
        practicalApps: form.practicalApps,
        crossReferences: nonEmptyReferences(form.crossReferences).map((row, sortOrder) => ({ ...row, sortOrder })),
        themes: form.themes,
      };
      if (existingFound && existingId) {
        payload.id = existingId;
      }
      if (sharedStudyVersion != null) {
        payload.sharedStudyVersion = sharedStudyVersion;
      }
      const res = await sendPostRequest(
        "bible",
        "add-verse-explanation",
        payload,
      );
      if (res?.returnCode === 200 || res?.status === 200) {
        if (typeof res?.returnData?.sharedStudyVersion === "number") {
          setSharedStudyVersion(res.returnData.sharedStudyVersion);
        }
        toast({
          title: existingFound ? "Updated" : "Created",
          description: `${form.bookName} ${form.chapter}:${form.verseNumber} saved`,
        });
       

        setTimeout(() => {
          navigate(routePaths.adminVerseExplanations);
        }, 500);

      } else if (res?.returnCode === 409 || res?.status === 409) {
        toast({
          title: tt("Content changed"),
          description:
            res?.returnMessage ||
            tt("This passage was updated elsewhere. Reload before saving."),
          variant: "destructive",
        });
      } else {
        toast({
          title: tt("Error"),
          description: res?.returnMessage || "Failed to save",
          variant: "destructive",
        });
      }
    } catch (e: any) {
      toast({
        title: tt("Network error"),
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }, [form, isValid, saving, existingFound, existingId, sharedStudyVersion, toast, navigate]);

  const goBack = useCallback(
    () => navigate("/admin/verse-explanations"),
    [navigate],
  );

  return {
    data: {
      form,
      isEditMode,
      existingFound,
      checkingExisting,
      lookupError,
      loadingExisting,
      saving,
      activeTab,
      currentStepIndex,
      currentStep,
      referenceComplete,
      exegesisComplete,
      stepCompletion,
      completionPercent,
      canAdvanceFromCurrent,
      isValid,
      fieldErrors,
      stepErrors,
      richContentError,
      richContentTouched,
      translationOptions,
      sortedTranslationOptions,
      bookOptions,
      chapterOptions,
      selectedVerse,
      verseLoadingForTrigger,
      crossReferenceBookOptions,
      crossReferenceChapterOptions,
      crossReferenceVerseLoading,
      selectedVerseText,
      passageError: preview.error,
      retryPassage: preview.retry,
      verseTextLoading,
      maxChapterNumber,
      maxVerseNumber,
      verseOptions,
      verseOptionsLoading,
      crossRefVerseOptions,
      crossRefVerseLoading,
      filteredBooks: form.bookName
        ? BIBLE_BOOKS.filter((b) =>
            b.toLowerCase().includes(form.bookName.toLowerCase()),
          )
        : BIBLE_BOOKS,
    },
    actions: {
      setActiveTab,
      goToStep,
      goNext,
      goPrevious,
      updateField,
      updateNested,
      addWordStudy,
      removeWordStudy,
      updateWordStudy,
      addPracticalApp,
      removePracticalApp,
      updatePracticalApp,
      addCrossRef,
      removeCrossRef,
      updateCrossRef,
      pickCrossRefVerse,
      addTheme,
      removeTheme,
      updateTheme,
      handleSave,
      goBack,
      retryExisting: () => setLookupAttempt(attempt => attempt + 1),
    },
  };
}

export type AddExplanationPageModel = ReturnType<typeof useAddExplanation>;
export type AddExplanationPageData = AddExplanationPageModel["data"];
export type AddExplanationPageActions = AddExplanationPageModel["actions"];
