// useAddBookPrologue — single-page add/edit editor hook for book prologues.
// Edit mode is driven by the :bookName route param (mirrors useAddExplanation).
import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { BIBLE_BOOKS } from "@/data/staticData";
import { bibleApi } from "@/services/bibleApi";
import {
  PROLOGUE_STEP_ORDER,
  PROLOGUE_STEPS,
  PROLOGUE_FORM_EMPTY,
} from "../constants";
import { fetchBookPrologue, upsertBookPrologue } from "../services/bookProloguesApi";
import type { KeyScriptureEntry, PrologueEditorForm, PrologueStepId, AddBookPrologueModel } from "../types";

const cloneEmpty = (): PrologueEditorForm => ({
  ...PROLOGUE_FORM_EMPTY,
  applications: [],
  keyScriptures: [],
  mainThemes: [],
  keyPeople: [],
  keyVerses: [],
});

const toDisplayReference = (entry: Pick<KeyScriptureEntry, "bookName" | "chapter" | "verse" | "translation">): string => {
  if (!entry.bookName || entry.chapter == null || entry.verse == null) return "";
  const abbr = ["BSB", "KJV", "NIV", "ESV", "NASB", "NKJV", "NLT", "CSB"].includes(entry.translation)
    ? entry.translation
    : entry.translation || "";
  return `${entry.bookName} ${entry.chapter}:${entry.verse}${abbr ? ` (${abbr})` : ""}`;
};

export function useAddBookPrologue() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const params = useParams<{ bookName?: string }>();
  const isEditMode = !!params.bookName;

  const [form, setForm] = useState<PrologueEditorForm>(cloneEmpty);
  const [loadingExisting, setLoadingExisting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeStep, setActiveStep] = useState<PrologueStepId>("basic");

  const currentStepIndex = useMemo(
    () => Math.max(0, PROLOGUE_STEP_ORDER.indexOf(activeStep)),
    [activeStep],
  );
  const currentStep = useMemo(
    () => PROLOGUE_STEP_ORDER[currentStepIndex] ?? "basic",
    [currentStepIndex],
  );

  // Completion checks per step
  const basicComplete = useMemo(
    () => form.bookName.trim() !== "" && form.title.trim() !== "" && form.summary.trim() !== "",
    [form.bookName, form.title, form.summary],
  );
  const contextComplete = useMemo(
    () => form.author.trim() !== "" || form.background.trim() !== "",
    [form.author, form.background],
  );
  const themesComplete = useMemo(
    () => form.mainThemes.length > 0 || form.lessons.trim() !== "",
    [form.mainThemes.length, form.lessons],
  );

  const stepCompletion: Record<PrologueStepId, boolean> = useMemo(
    () => ({
      basic: basicComplete,
      context: contextComplete,
      themes: themesComplete,
      extra: form.keyScriptures.some((s) => s.text.trim()) || form.applications.length > 0,
    }),
    [basicComplete, contextComplete, themesComplete, form.keyScriptures, form.applications],
  );

  const completionPercent = useMemo(
    () =>
      Math.round(
        (Object.values(stepCompletion).filter(Boolean).length / PROLOGUE_STEP_ORDER.length) * 100,
      ),
    [stepCompletion],
  );

  const isValid =
    form.bookName.trim() !== "" && form.title.trim() !== "" && form.summary.trim() !== "";

  const canAdvanceFromCurrent = useMemo(
    () =>
      currentStep === "basic"
        ? basicComplete
        : currentStep === "context"
          ? true
          : currentStep === "themes"
            ? true
            : true,
    [currentStep, basicComplete],
  );

  const goToStep = useCallback((stepId: PrologueStepId) => setActiveStep(stepId), []);
  const goNext = useCallback(() => {
    const nextIndex = Math.min(PROLOGUE_STEP_ORDER.length - 1, currentStepIndex + 1);
    if (nextIndex !== currentStepIndex) goToStep(PROLOGUE_STEP_ORDER[nextIndex]);
  }, [currentStepIndex, goToStep]);
  const goPrevious = useCallback(() => {
    const prevIndex = Math.max(0, currentStepIndex - 1);
    if (prevIndex !== currentStepIndex) goToStep(PROLOGUE_STEP_ORDER[prevIndex]);
  }, [currentStepIndex, goToStep]);

  // Load existing prologue in edit mode
  useEffect(() => {
    if (!isEditMode || !params.bookName) return;
    setLoadingExisting(true);
    fetchBookPrologue(decodeURIComponent(params.bookName))
      .then((data) => {
        if (!data) {
          toast({ title: "Not found", variant: "destructive" });
          navigate("/admin/book-prologues");
          return;
        }
        setForm(data);
      })
      .catch(() => {
        toast({ title: "Failed to load", variant: "destructive" });
        navigate("/admin/book-prologues");
      })
      .finally(() => setLoadingExisting(false));
  }, [isEditMode, params.bookName]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateField = useCallback(
    <K extends keyof PrologueEditorForm>(key: K, value: PrologueEditorForm[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  // Array field helpers
  const updateArrayItem = useCallback(
    (field: keyof PrologueEditorForm, index: number, value: string) => {
      setForm((prev) => {
        const arr = [...(prev[field] as unknown as string[])];
        arr[index] = value;
        return { ...prev, [field]: arr };
      });
    },
    [],
  );
  const addArrayItem = useCallback((field: keyof PrologueEditorForm) => {
    setForm((prev) => ({
      ...prev,
      [field]: [...(prev[field] as unknown as string[]), ""],
    }));
  }, []);
  const removeArrayItem = useCallback((field: keyof PrologueEditorForm, index: number) => {
    setForm((prev) => {
      const arr = [...(prev[field] as unknown as string[])];
      arr.splice(index, 1);
      return { ...prev, [field]: arr };
    });
  }, []);

  const removeKeyScripture = useCallback((index: number) => {
    setForm((prev) => ({
      ...prev,
      keyScriptures: prev.keyScriptures.filter((_, idx) => idx !== index),
    }));
  }, []);

  const addKeyScripture = useCallback(() => {
    setForm((prev) => ({
      ...prev,
      keyScriptures: [
        ...prev.keyScriptures,
        {
          bookName: "",
          chapter: null,
          verse: null,
          translation: "Berean",
          reference: "",
          text: "",
        },
      ],
    }));
  }, []);

  const updateKeyScripture = useCallback(
    (index: number, patch: Partial<KeyScriptureEntry>) => {
      setForm((prev) => ({
        ...prev,
        keyScriptures: prev.keyScriptures.map((entry, i) => {
          if (i !== index) return entry;
          const next = { ...entry, ...patch };
          if (next.bookName && next.chapter != null && next.verse != null) {
            next.reference = toDisplayReference(next);
          }
          return next;
        }),
      }));
    },
    [],
  );

  const pickVerseForKeyScripture = useCallback(
    (index: number, verse: number) => {
      setForm((prev) => {
        const entry = prev.keyScriptures[index];
        if (!entry?.bookName || entry.chapter == null) return prev;
        bibleApi
          .getVerse(entry.translation || "Berean", entry.bookName, entry.chapter, verse)
          .then((vd) => {
            updateKeyScripture(index, { verse, text: vd?.text || "" });
          })
          .catch(() => updateKeyScripture(index, { verse, text: "" }));
        return {
          ...prev,
          keyScriptures: prev.keyScriptures.map((e, i) =>
            i === index ? { ...e, verse } : e,
          ),
        };
      });
    },
    [updateKeyScripture],
  );

  const filteredBooks = useMemo(
    () =>
      form.bookName
        ? BIBLE_BOOKS.filter((b) => b.toLowerCase().includes(form.bookName.toLowerCase()))
        : BIBLE_BOOKS,
    [form.bookName],
  );

  const handleSave = useCallback(async () => {
    if (!isValid || saving) return;
    setSaving(true);
    try {
      const result = await upsertBookPrologue(form);
      if (result.ok) {
        toast({
          title: isEditMode ? "Updated" : "Created",
          description: `${form.bookName} prologue saved`,
        });
        navigate("/admin/book-prologues");
      } else {
        toast({ title: "Error", description: result.message || "Failed to save", variant: "destructive" });
      }
    } catch (err) {
      toast({
        title: "Network error",
        description: err instanceof Error ? err.message : "Failed to save",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }, [form, isValid, saving, isEditMode, toast, navigate]);

  const goBack = useCallback(() => navigate("/admin/book-prologues"), [navigate]);

  return {
    data: {
      form,
      isEditMode,
      loadingExisting,
      saving,
      activeStep,
      currentStepIndex,
      currentStep,
      stepOrder: PROLOGUE_STEP_ORDER,
      steps: PROLOGUE_STEPS,
      stepCompletion,
      completionPercent,
      canAdvanceFromCurrent,
      isValid,
      filteredBooks,
    },
    actions: {
      setActiveStep,
      goToStep,
      goNext,
      goPrevious,
      updateField,
      updateArrayItem,
      addArrayItem,
      removeArrayItem,
      removeKeyScripture,
      addKeyScripture,
      updateKeyScripture,
      pickVerseForKeyScripture,
      handleSave,
      goBack,
    },
  };
}
