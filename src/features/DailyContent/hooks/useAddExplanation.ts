// useAddExplanation — all state + API logic for AddVerseExplanation page
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/components/languages/languageProvider";
import { sendPostRequest } from "@/services/api";
import { routes } from "@/components/Routes/routes";
import { getVerseText } from "@/utilities/bibleUtils";

export function useAddExplanation() {
  const { t, isRtl } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  type Params = { bookName?: string; chapter?: string; verseNumber?: string };
  const params = useParams<Params>();
  const qBook = params.bookName ? decodeURIComponent(params.bookName) : "";
  const qCh = params.chapter ? Number(params.chapter) : 1;
  const qVn = params.verseNumber ? Number(params.verseNumber) : 1;
  const isEditMode = !!params.bookName && !!params.chapter && !!params.verseNumber;
  const [bookName, setBookName] = useState(qBook);
  const [chapter, setChapter] = useState<number>(Number.isFinite(qCh) ? qCh : 1);
  const [verseNumber, setVerseNumber] = useState<number>(Number.isFinite(qVn) ? qVn : 1);
  const [bibleVersion, setBibleVersion] = useState("");
  const [explanation, setExplanation] = useState("");
  const [learnMore, setLearnMore] = useState("");
  const [loadingExisting, setLoadingExisting] = useState(false);
  const [existingFound, setExistingFound] = useState(false);
  const [existingId, setExistingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [verseText, setVerseText] = useState<string | null>(null);
  const [prompts, setPrompts] = useState<{ id: number; prompt: string; category: string }[]>([]);
  const [promptsLoading, setPromptsLoading] = useState(false);
  const [selectedPromptIds, setSelectedPromptIds] = useState<number[]>([]);
  const NONE_VALUE = "__NONE__";
  const isValid =
    (bookName ?? "").trim() !== "" &&
    chapter >= 1 &&
    verseNumber >= 1 &&
    (explanation ?? "").trim().length >= 20;
  const fetchPrompts = async (bn: string, ch: number, vn?: number) => {
    if (!bn || !ch) return;
    setPromptsLoading(true);
    try {
      const res = await sendPostRequest("journal", "prompts/get-all", { bookName: bn, chapter: ch, isActive: true });
      if (res.returnCode === 200 && res.returnData) {
        setPrompts(vn ? res.returnData.filter((p: any) => !p.verseNumber || p.verseNumber === vn) : res.returnData);
      }
    } catch (e) {
      console.error("Error fetching prompts:", e);
    } finally {
      setPromptsLoading(false);
    }
  };
  const fetchExisting = async (bn: string, ch: number, vn: number) => {
    if (!bn || !ch || !vn) return;
    setLoadingExisting(true);
    setExistingFound(false);
    setExistingId(null);
      const res = await sendPostRequest("bible", "get-verse-explanation", { bookName: bn, chapter: ch, verseNumber: vn });
        const d = res.returnData;
        setBibleVersion(d.bibleVersion ?? "");
        setExplanation(d.explanation ?? "");
        setLearnMore(d.learnMore ?? "");
        setExistingFound(true);
        setExistingId(d.id ?? null);
        if (d.promptIds) {
          try {
            const parsed = JSON.parse(d.promptIds);
            if (Array.isArray(parsed)) setSelectedPromptIds(parsed.map(Number));
          } catch {}
        }
    } catch {} finally {
      setLoadingExisting(false);
  useEffect(() => { if (isEditMode) fetchExisting(qBook, qCh, qVn); }, [isEditMode]);
  useEffect(() => { setVerseText(getVerseText(bookName, Number(chapter), Number(verseNumber))); }, [bookName, chapter, verseNumber]);
  useEffect(() => { if (bookName && chapter) fetchPrompts(bookName, chapter, verseNumber); }, [bookName, chapter, verseNumber]);
  const handleVerseBlur = useCallback(() => {
    if (!isEditMode && bookName && chapter && verseNumber) fetchExisting(bookName, chapter, verseNumber);
  }, [isEditMode, bookName, chapter, verseNumber]);
  const handleSave = useCallback(async () => {
    if (!isValid) return;
    setSaving(true);
    setSaved(false);
      const payload: any = { bookName, chapter, verseNumber, bibleVersion, explanation, learnMore, promptIds: selectedPromptIds };
      if (existingFound && existingId) payload.id = existingId;
      const res = await sendPostRequest("bible", "add-verse-explanation", payload);
      if (res.returnCode === 200) {
        setSaved(true);
        toast({
          title: existingFound ? t.verseExplanations.toastExplanationUpdated : t.verseExplanations.toastExplanationCreated,
          description: t.verseExplanations.toastSavedDesc.replace("{bookName}", bookName).replace("{chapter}", String(chapter)).replace("{verseNumber}", String(verseNumber)),
        });
        setTimeout(() => navigate(routes.verseExplanations.path), 1500);
      } else {
        toast({ title: t.verseExplanations.toastSaveFailed, description: res.returnMessage, variant: "destructive" });
    } catch (e: any) {
      toast({ title: t.verseExplanations.toastNetworkError, description: e.message, variant: "destructive" });
      setSaving(false);
  }, [isValid, bookName, chapter, verseNumber, bibleVersion, explanation, learnMore, selectedPromptIds, existingFound, existingId]);
  const togglePrompt = useCallback((id: number) => {
    setSelectedPromptIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }, []);
  return {
    // Form state
    bookName, setBookName, chapter, setChapter, verseNumber, setVerseNumber,
    bibleVersion, setBibleVersion, explanation, setExplanation, learnMore, setLearnMore,
    verseText, prompts, promptsLoading, selectedPromptIds, togglePrompt,
    NONE_VALUE,
    // UI state
    loadingExisting, existingFound, saving, saved, isValid, isRtl, isEditMode,
    // Actions
    handleSave, handleVerseBlur,
    // Route params
    qBook, qCh, qVn,
    // i18n
    t,
}
