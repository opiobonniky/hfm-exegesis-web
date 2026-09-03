// useAddExplanation — structured editor hook for add/edit verse explanations
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { sendPostRequest } from "@/services/api";
import { BIBLE_BOOKS } from "@/data/staticData";

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
  const [activeTab, setActiveTab] = useState("reference");

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
  }, []);
  const updateCrossRef = useCallback((i: number, field: keyof CrossRefItem, value: string | number) => {
    setForm((prev) => {
      const next = [...prev.crossReferences];
      next[i] = { ...next[i], [field]: value };
      return { ...prev, crossReferences: next };
    });
  }, []);

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
    isValid,
    updateField,
    updateNested,
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
