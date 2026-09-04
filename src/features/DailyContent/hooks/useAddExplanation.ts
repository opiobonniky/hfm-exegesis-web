// useAddExplanation — structured editor hook for add/edit verse explanations
import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { sendPostRequest } from "@/services/api";
import { bibleApi, type Translation } from "@/services/bibleApi";
import { BIBLE_BOOKS } from "@/data/staticData";
import { BIBLE_BOOK_CHAPTERS } from "@/features/Bible/constants";
import { VERSE_EXPLANATION_STEP_ORDER } from "../constants";
import type { VerseExplanationStepId } from "../types";

export interface WordStudyItem {
  strongsId: string;
  surfaceText: string;
  customDefinition: string;
  sortOrder: number;
}

export interface CrossRefItem {
  bookName: string;
  chapter: number;
  verseNumber: number;
  referenceText: string;
  commentary: string;
  sortOrder: number;
}

export interface ExplanationForm {
  bookName: string;
  chapter: string;
  verseNumber: string;
  bibleVersion: string;
  exegesis: {
    explanationText: string;
    applicationText: string;
  };
  studyMetadata: {
    introduction: string;
    backgroundAuthor: string;
    backgroundBook: string;
    backgroundContext: string;
    finalThoughts: string;
  };
  wordStudies: WordStudyItem[];
  practicalApps: { applicationText: string; sortOrder: number }[];
  crossReferences: CrossRefItem[];
  themes: { themeName: string; sortOrder: number }[];
}

const EMPTY_FORM: ExplanationForm = {
  bookName: "",
  chapter: "",
  verseNumber: "",
  bibleVersion: "BSB",
  exegesis: { explanationText: "", applicationText: "" },
  studyMetadata: { introduction: "", backgroundAuthor: "", backgroundBook: "", backgroundContext: "", finalThoughts: "" },
  wordStudies: [],
  practicalApps: [],
  crossReferences: [],
  themes: [],
};

export function useAddExplanation() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const params = useParams<{ bookName?: string; chapter?: string; verseNumber?: string }>();
  const isEditMode = !!params.bookName && !!params.chapter && !!params.verseNumber;

  const [form, setForm] = useState<ExplanationForm>(EMPTY_FORM);
  const [loadingExisting, setLoadingExisting] = useState(false);
  const [existingFound, setExistingFound] = useState(false);
  const [existingId, setExistingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<VerseExplanationStepId>("reference");
  const [translationOptions, setTranslationOptions] = useState<Translation[]>([]);
  const [selectedVerseText, setSelectedVerseText] = useState("");
  const [verseTextLoading, setVerseTextLoading] = useState(false);
  const [chapterVerseCount, setChapterVerseCount] = useState(0);
  const [verseOptions, setVerseOptions] = useState<number[]>([]);
  const [verseOptionsLoading, setVerseOptionsLoading] = useState(false);
  const [crossRefVerseOptions, setCrossRefVerseOptions] = useState<Record<number, { key: string; verses: number[] }>>({});
  const [crossRefVerseLoading, setCrossRefVerseLoading] = useState<Record<number, boolean>>({});

  const maxChapterNumber = useMemo(() => {
    const bookName = form.bookName.trim();
    if (!bookName) return 1;
    return BIBLE_BOOK_CHAPTERS[bookName as keyof typeof BIBLE_BOOK_CHAPTERS] ?? 1;
  }, [form.bookName]);

  const maxVerseNumber = chapterVerseCount || 1;

  const currentStepIndex = useMemo(
    () => VERSE_EXPLANATION_STEP_ORDER.indexOf(activeTab),
    [activeTab],
  );

  const currentStep = useMemo(
    () => VERSE_EXPLANATION_STEP_ORDER[Math.max(0, currentStepIndex)] ?? "reference",
    [currentStepIndex],
  );

  const referenceComplete = useMemo(
    () => form.bookName.trim() !== "" && Number(form.chapter) >= 1 && Number(form.verseNumber) >= 1,
    [form.bookName, form.chapter, form.verseNumber],
  );

  const exegesisComplete = useMemo(
    () => form.exegesis.explanationText.trim().length >= 20,
    [form.exegesis.explanationText],
  );

  const studyComplete = useMemo(
    () => form.studyMetadata.introduction.trim().length > 0 || form.wordStudies.length > 0 || form.themes.length > 0,
    [form.studyMetadata.introduction, form.wordStudies.length, form.themes.length],
  );

  const stepCompletion: Record<VerseExplanationStepId, boolean> = useMemo(
    () => ({
      reference: referenceComplete,
      exegesis: exegesisComplete,
      study: studyComplete,
      extras: true,
    }),
    [referenceComplete, exegesisComplete, studyComplete],
  );

  const completionPercent = useMemo(
    () => Math.round((Object.values(stepCompletion).filter(Boolean).length / VERSE_EXPLANATION_STEP_ORDER.length) * 100),
    [stepCompletion],
  );

  const goToStep = useCallback((stepId: VerseExplanationStepId) => setActiveTab(stepId), []);

  const goNext = useCallback(() => {
    const nextIndex = Math.min(VERSE_EXPLANATION_STEP_ORDER.length - 1, currentStepIndex + 1);
    if (nextIndex !== currentStepIndex) goToStep(VERSE_EXPLANATION_STEP_ORDER[nextIndex]);
  }, [currentStepIndex, goToStep]);

  const goPrevious = useCallback(() => {
    const prevIndex = Math.max(0, currentStepIndex - 1);
    if (prevIndex !== currentStepIndex) goToStep(VERSE_EXPLANATION_STEP_ORDER[prevIndex]);
  }, [currentStepIndex, goToStep]);

  const canAdvanceFromCurrent = useMemo(
    () => (currentStep === "reference" ? referenceComplete : currentStep === "exegesis" ? exegesisComplete : true),
    [currentStep, referenceComplete, exegesisComplete],
  );

  useEffect(() => {
    let active = true;
    bibleApi
      .getTranslations()
      .then((translations) => {
        if (!active) return;
        setTranslationOptions(translations || []);
        const validCurrent = (translations || []).some((item) => item.id === form.bibleVersion);
        if (!form.bibleVersion || !validCurrent) {
          const fallback = (translations || []).find((item) => item.id === "BSB") ?? translations?.[0];
          if (fallback) {
            setForm((prev) => ({ ...prev, bibleVersion: fallback.id }));
          }
        }
      })
      .catch(() => {
        if (!active) return;
        setTranslationOptions([]);
      });

    return () => {
      active = false;
    };
  }, [form.bibleVersion]);

  useEffect(() => {
    const bookName = form.bookName.trim();
    const chapter = Number(form.chapter);
    const verseNumber = Number(form.verseNumber);
    const bibleVersion = form.bibleVersion?.trim();

    if (!bookName || !bibleVersion || !Number.isFinite(chapter) || chapter < 1) {
      setSelectedVerseText("");
      setChapterVerseCount(0);
      setVerseOptions([]);
      return;
    }

    const safeChapter = Math.min(Math.max(Math.trunc(chapter), 1), maxChapterNumber);
    if (safeChapter !== chapter) {
      setForm((prev) => ({ ...prev, chapter: String(safeChapter) }));
    }

    let active = true;
    setVerseTextLoading(true);
    setVerseOptionsLoading(true);
    bibleApi
      .getVerses(bibleVersion, bookName, safeChapter)
      .then((chapterData) => {
        if (!active) return;
        const verses = chapterData?.verses ?? [];
        const totalVerses = verses.length;
        setChapterVerseCount(totalVerses);
        setVerseOptions(verses.map((v) => v.verseNumber));

        if (Number.isFinite(verseNumber) && verseNumber > totalVerses) {
          setForm((prev) => ({ ...prev, verseNumber: String(totalVerses || 1) }));
        }

        if (!Number.isFinite(verseNumber) || verseNumber < 1 || verseNumber > totalVerses) {
          setSelectedVerseText("");
          return;
        }

        return bibleApi.getVerse(bibleVersion, bookName, safeChapter, verseNumber);
      })
      .then((verse) => {
        if (!active) return;
        setSelectedVerseText(verse?.text || "");
      })
      .catch(() => {
        if (!active) return;
        setSelectedVerseText("");
        setVerseOptions([]);
      })
      .finally(() => {
        if (active) {
          setVerseTextLoading(false);
          setVerseOptionsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [form.bookName, form.chapter, form.verseNumber, form.bibleVersion, maxChapterNumber]);

  // Load existing explanation in edit mode
  useEffect(() => {
    if (!isEditMode || !params.bookName || !params.chapter || !params.verseNumber) return;
    setLoadingExisting(true);
    sendPostRequest("bible", "get-verse-explanation", {
      bookName: decodeURIComponent(params.bookName),
      chapter: Number(params.chapter),
      verseNumber: Number(params.verseNumber),
    })
      .then((res) => {
        if (res?.returnCode === 200 && res.returnData) {
          const d = res.returnData;
          setForm({
            bookName: d.bookName || "",
            chapter: String(d.chapter || ""),
            verseNumber: String(d.verseNumber || ""),
            bibleVersion: d.bibleVersion || "BSB",
            exegesis: d.exegesis || { explanationText: "", applicationText: "" },
            studyMetadata: d.studyMetadata || { introduction: "", backgroundAuthor: "", backgroundBook: "", backgroundContext: "", finalThoughts: "" },
            wordStudies: d.wordStudies || [],
            practicalApps: d.practicalApps || [],
            crossReferences: d.crossReferences || [],
            themes: d.themes || [],
          });
          setExistingFound(true);
          setExistingId(d.id ?? null);
        } else {
          toast({ title: "Not found", variant: "destructive" });
          navigate("/admin/verse-explanations");
        }
      })
      .catch(() => {
        toast({ title: "Failed to load", variant: "destructive" });
        navigate("/admin/verse-explanations");
      })
      .finally(() => setLoadingExisting(false));
  }, [isEditMode, params.bookName, params.chapter, params.verseNumber]); // eslint-disable-line

  const updateField = useCallback(
    <K extends keyof ExplanationForm>(key: K, value: ExplanationForm[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    [],
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
    setForm((prev) => ({
      ...prev,
      wordStudies: [...prev.wordStudies, { strongsId: "", surfaceText: "", customDefinition: "", sortOrder: prev.wordStudies.length }],
    }));
  }, []);
  const removeWordStudy = useCallback((i: number) => {
    setForm((prev) => ({ ...prev, wordStudies: prev.wordStudies.filter((_, idx) => idx !== i) }));
  }, []);
  const updateWordStudy = useCallback((i: number, field: keyof WordStudyItem, value: string | number) => {
    setForm((prev) => {
      const next = [...prev.wordStudies];
      next[i] = { ...next[i], [field]: value };
      return { ...prev, wordStudies: next };
    });
  }, []);

  // Practical apps
  const addPracticalApp = useCallback(() => {
    setForm((prev) => ({
      ...prev,
      practicalApps: [...prev.practicalApps, { applicationText: "", sortOrder: prev.practicalApps.length }],
    }));
  }, []);
  const removePracticalApp = useCallback((i: number) => {
    setForm((prev) => ({ ...prev, practicalApps: prev.practicalApps.filter((_, idx) => idx !== i) }));
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
      crossReferences: [...prev.crossReferences, { bookName: "", chapter: 0, verseNumber: 0, referenceText: "", commentary: "", sortOrder: prev.crossReferences.length }],
    }));
  }, []);
  const removeCrossRef = useCallback((i: number) => {
    setForm((prev) => ({ ...prev, crossReferences: prev.crossReferences.filter((_, idx) => idx !== i) }));
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
  const updateCrossRef = useCallback((i: number, field: keyof CrossRefItem, value: string | number) => {
    setForm((prev) => {
      const next = [...prev.crossReferences];
      next[i] = { ...next[i], [field]: value };
      return { ...prev, crossReferences: next };
    });
  }, []);

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


  // Load verse options for cross references once book+chapter are set.
  // Cached by the (book:chapter) key so changing book/chapter refetches.
  useEffect(() => {
    let active = true;
    form.crossReferences.forEach((entry, index) => {
      if (!entry.bookName || !entry.chapter) return;
      const key = `${entry.bookName}:${entry.chapter}`;
      if (crossRefVerseOptions[index]?.key === key) return;
      const translation = form.bibleVersion?.trim() || "Berean";
      setCrossRefVerseLoading((cur) => ({ ...cur, [index]: true }));
      bibleApi
        .getVerses(translation, entry.bookName, entry.chapter)
        .then((vd) => {
          if (!active) return;
          setCrossRefVerseOptions((cur) => ({
            ...cur,
            [index]: {
              key,
              verses: (vd?.verses || []).map((v) => v.verseNumber),
            },
          }));
        })
        .catch(() => {
          if (!active) return;
          setCrossRefVerseOptions((cur) => ({ ...cur, [index]: { key, verses: [] } }));
        })
        .finally(() => {
          if (active) setCrossRefVerseLoading((cur) => ({ ...cur, [index]: false }));
        });
    });
    return () => {
      active = false;
    };
  }, [form.crossReferences, form.bibleVersion, crossRefVerseOptions]);


  // Themes
  const addTheme = useCallback(() => {
    setForm((prev) => ({
      ...prev,
      themes: [...prev.themes, { themeName: "", sortOrder: prev.themes.length }],
    }));
  }, []);
  const removeTheme = useCallback((i: number) => {
    setForm((prev) => ({ ...prev, themes: prev.themes.filter((_, idx) => idx !== i) }));
  }, []);
  const updateTheme = useCallback((i: number, value: string) => {
    setForm((prev) => {
      const next = [...prev.themes];
      next[i] = { ...next[i], themeName: value };
      return { ...prev, themes: next };
    });
  }, []);

  const isValid =
    form.bookName.trim() !== "" &&
    Number(form.chapter) >= 1 &&
    Number(form.verseNumber) >= 1 &&
    form.exegesis.explanationText.trim().length >= 20;

  const handleSave = useCallback(async () => {
    if (!isValid || saving) return;
    setSaving(true);
    try {
      const payload: any = {
        bookName: form.bookName,
        chapter: Number(form.chapter),
        verseNumber: Number(form.verseNumber),
        bibleVersion: form.bibleVersion,
        exegesis: form.exegesis,
        studyMetadata: form.studyMetadata,
        wordStudies: form.wordStudies,
        practicalApps: form.practicalApps,
        crossReferences: form.crossReferences,
        themes: form.themes,
      };
      if (existingFound && existingId) {
        payload.id = existingId;
      }
      const res = await sendPostRequest("bible", "add-verse-explanation", payload);
      if (res?.returnCode === 200 || res?.status === 200) {
        toast({
          title: existingFound ? "Updated" : "Created",
          description: `${form.bookName} ${form.chapter}:${form.verseNumber} saved`,
        });
        navigate("/admin/verse-explanations");
      } else {
        toast({ title: "Error", description: res?.returnMessage || "Failed to save", variant: "destructive" });
      }
    } catch (e: any) {
      toast({ title: "Network error", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }, [form, isValid, saving, existingFound, toast, navigate]);

  const goBack = useCallback(() => navigate("/admin/verse-explanations"), [navigate]);

  return {
    form,
    isEditMode,
    loadingExisting,
    saving,
    activeTab,
    setActiveTab,
    currentStepIndex,
    currentStep,
    referenceComplete,
    exegesisComplete,
    studyComplete,
    stepCompletion,
    completionPercent,
    goToStep,
    goNext,
    goPrevious,
    canAdvanceFromCurrent,
    isValid,
    updateField,
    updateNested,
    translationOptions,
    selectedVerseText,
    verseTextLoading,
    maxChapterNumber,
    maxVerseNumber,
    verseOptions,
    verseOptionsLoading,
    // Word studies
    addWordStudy,
    removeWordStudy,
    updateWordStudy,
    // Practical apps
    addPracticalApp,
    removePracticalApp,
    updatePracticalApp,
    // Cross references
    addCrossRef,
    removeCrossRef,
    updateCrossRef,
    pickCrossRefVerse,
    crossRefVerseOptions,
    crossRefVerseLoading,
    // Themes
    addTheme,
    removeTheme,
    updateTheme,
    // Actions
    handleSave,
    goBack,
    // Book list
    filteredBooks: form.bookName
      ? BIBLE_BOOKS.filter((b) => b.toLowerCase().includes(form.bookName.toLowerCase()))
      : BIBLE_BOOKS,
  };
}
