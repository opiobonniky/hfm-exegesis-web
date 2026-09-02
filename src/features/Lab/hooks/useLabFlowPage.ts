/**
 * useLabFlowPage — comprehensive hook wrapping useLabFlow + all page-level state.
 * Extracts ALL useState/useEffect from LabFlow page.
 */
import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useLabFlow } from "./useLabFlow";
import { STAGE_ORDER, LISTEN_OPTIONS, LOOK_PROMPTS } from "../constants";
import { getVerseWords, getStrongsEntry } from "@/services/strongsApi";
import type { StrongsWordData, StrongsEntry as StrongsEntryType } from "@/services/strongsApi";
import { getBookPrologue } from "@/services/bookProloguesApi";
import type { BookPrologue } from "@/services/bookProloguesApi";
import { getVerseResources, getTranslationComparison } from "@/services/verseResourcesApi";
import type { VerseResourceData, TranslationComparisonEntry } from "@/services/verseResourcesApi";
import { bibleApi } from "@/services/bibleApi";
import type { Verse } from "@/services/bibleApi";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";

export function useLabFlowPage() {
  const navigate = useNavigate();
  const lab = useLabFlow();
  const audio = useAudioPlayer();
  const chapterNumber = Number(lab.data.chapter);
  const verseStartNumber = Number(lab.data.verseStart);
  const verseEndNumber = Number(lab.data.verseEnd || lab.data.verseStart);

  const [passageVerses, setPassageVerses] = useState<Verse[]>([]);
  const [versesLoading, setVersesLoading] = useState(false);
  const [previewText, setPreviewText] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [verseWords, setVerseWords] = useState<StrongsWordData[]>([]);
  const [wordsLoading, setWordsLoading] = useState(false);
  const [wordModalOpen, setWordModalOpen] = useState(false);
  const [selectedWord, setSelectedWord] = useState<StrongsEntryType | null>(null);
  const [wordLoadingDetail, setWordLoadingDetail] = useState(false);
  const [verseResources, setVerseResources] = useState<VerseResourceData | null>(null);
  const [resourcesLoading, setResourcesLoading] = useState(false);
  const [translations, setTranslations] = useState<TranslationComparisonEntry[] | null>(null);
  const [translationsLoading, setTranslationsLoading] = useState(false);
  const [translationsError, setTranslationsError] = useState(false);
  const [bookPrologue, setBookPrologue] = useState<BookPrologue | null>(null);
  const [prologueLoading, setPrologueLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [shortcutHint, setShortcutHint] = useState<string | null>(null);
  const shortcutTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch passage verses when passage is selected
  useEffect(() => {
    if (!lab.data.bookName || !lab.data.chapter || lab.data.stage === "passage") return;
    let cancelled = false;
    const fetchVerses = async () => {
      setVersesLoading(true);
      try {
        const verseData = await bibleApi.getVerses("BSB", lab.data.bookName, chapterNumber);
        if (cancelled) return;
        const data = verseData.verses || [];
        const filtered = lab.data.verseEnd
          ? data.filter((v: Verse) => (v.verse ?? v.verseNumber) >= verseStartNumber && (v.verse ?? v.verseNumber) <= verseEndNumber)
          : data.filter((v: Verse) => (v.verse ?? v.verseNumber) === verseStartNumber);
        setPassageVerses(filtered);
      } catch { if (!cancelled) setPassageVerses([]); }
      finally { if (!cancelled) setVersesLoading(false); }
    };
    fetchVerses();
    return () => { cancelled = true; };
  }, [lab.data.bookName, lab.data.chapter, lab.data.verseStart, lab.data.verseEnd, lab.data.stage, chapterNumber, verseStartNumber, verseEndNumber]);

  // Fetch verse words (Strong's) when entering Learn stage
  useEffect(() => {
    if (lab.data.stage !== "learn" || !lab.data.passageRef || passageVerses.length === 0) return;
    let cancelled = false;
    const fetchWords = async () => {
      setWordsLoading(true);
      try {
        const words = await getVerseWords(lab.data.bookName, chapterNumber, verseStartNumber, "BSB");
        if (!cancelled) setVerseWords(words);
      } catch { if (!cancelled) setVerseWords([]); }
      finally { if (!cancelled) setWordsLoading(false); }
    };
    fetchWords();
    return () => { cancelled = true; };
  }, [lab.data.stage, lab.data.passageRef, lab.data.bookName, chapterNumber, verseStartNumber, passageVerses]);

  // Fetch book prologue when entering Learn stage
  useEffect(() => {
    if (lab.data.stage !== "learn" || !lab.data.bookName) return;
    let cancelled = false;
    const fetch = async () => {
      setPrologueLoading(true);
      try {
        const p = await getBookPrologue(lab.data.bookName);
        if (!cancelled) setBookPrologue(p);
      } catch { if (!cancelled) setBookPrologue(null); }
      finally { if (!cancelled) setPrologueLoading(false); }
    };
    fetch();
    return () => { cancelled = true; };
  }, [lab.data.stage, lab.data.bookName]);

  // Fetch verse resources when entering Learn stage
  useEffect(() => {
    if (lab.data.stage !== "learn" || !lab.data.passageRef) return;
    let cancelled = false;
    const fetch = async () => {
      setResourcesLoading(true);
      try {
        const r = await getVerseResources(lab.data.bookName, chapterNumber, verseStartNumber);
        if (!cancelled) setVerseResources(r);
      } catch { if (!cancelled) setVerseResources(null); }
      finally { if (!cancelled) setResourcesLoading(false); }
    };
    fetch();
    return () => { cancelled = true; };
  }, [lab.data.stage, lab.data.passageRef, lab.data.bookName, lab.data.chapter, lab.data.verseStart, chapterNumber, verseStartNumber]);

  // Fetch translation comparison when entering Learn stage
  useEffect(() => {
    if (lab.data.stage !== "learn" || !lab.data.passageRef) return;
    let cancelled = false;
    const fetch = async () => {
      setTranslationsLoading(true);
      setTranslationsError(false);
      try {
        const t = await getTranslationComparison(lab.data.bookName, chapterNumber, verseStartNumber);
        if (!cancelled) setTranslations(t);
      } catch { if (!cancelled) { setTranslations(null); setTranslationsError(true); } }
      finally { if (!cancelled) setTranslationsLoading(false); }
    };
    fetch();
    return () => { cancelled = true; };
  }, [lab.data.stage, lab.data.passageRef, lab.data.bookName, lab.data.chapter, lab.data.verseStart, chapterNumber, verseStartNumber]);

  // Preview text for passage selection
  useEffect(() => {
    if (lab.data.stage !== "passage" || !lab.data.bookName || !lab.data.chapter || !lab.data.verseStart) { setPreviewText(""); return; }
    let cancelled = false;
    const fetch = async () => {
      setPreviewLoading(true);
      try {
        const verseData = await bibleApi.getVerses("BSB", lab.data.bookName, chapterNumber);
        const data = verseData.verses || [];
        const filtered = data.filter((v: Verse) => (v.verse ?? v.verseNumber) >= verseStartNumber && (v.verse ?? v.verseNumber) <= verseEndNumber);
        setPreviewText(filtered.map((v: Verse) => `${v.verse ?? v.verseNumber}. ${v.text}`).join("\n"));
      } catch { if (!cancelled) setPreviewText(""); }
      finally { if (!cancelled) setPreviewLoading(false); }
    };
    fetch();
    return () => { cancelled = true; };
  }, [lab.data.stage, lab.data.bookName, lab.data.chapter, lab.data.verseStart, lab.data.verseEnd, chapterNumber, verseStartNumber, verseEndNumber]);

  const handleWordTap = useCallback(async (strongsId: string) => {
    setWordModalOpen(true);
    setWordLoadingDetail(true);
    try {
      const entry = await getStrongsEntry(strongsId);
      setSelectedWord(entry);
    } catch { setSelectedWord(null); }
    finally { setWordLoadingDetail(false); }
  }, []);

  const formatStudyAsText = useCallback(() => {
    const lines: string[] = [];
    lines.push(`Bible Study: ${lab.data.passageRef || `${lab.data.bookName} ${lab.data.chapter}:${lab.data.verseStart}${lab.data.verseEnd ? `-${lab.data.verseEnd}` : ""}`}`);
    lines.push("-".repeat(50));
    if (lab.data.lookNotes) { lines.push("LOOK — Observations"); try { const parsed = JSON.parse(lab.data.lookNotes); if (typeof parsed === "object" && parsed !== null) { Object.entries(parsed).filter(([_, v]) => (v as string).trim()).forEach(([key, val]) => { lines.push(`${Number(key) + 1}. ${val}`); }); } } catch { lines.push(lab.data.lookNotes); } lines.push(""); }
    if (lab.data.learnNotes) { lines.push("LEARN — Study Notes"); lines.push(lab.data.learnNotes); lines.push(""); }
    if (lab.data.reflection) { lines.push("REFLECTION"); lines.push(lab.data.reflection); lines.push(""); }
    if (lab.data.prayer) { lines.push("PRAYER"); lines.push(lab.data.prayer); lines.push(""); }
    if (lab.data.appText) { lines.push("APPLICATION"); lines.push(lab.data.appText); lines.push(""); }
    lines.push("Created with Exegesis Bible App");
    return lines.join("\n");
  }, [lab.data]);

  const handleCopy = useCallback(async () => {
    try { await navigator.clipboard.writeText(formatStudyAsText()); setCopied(true); setTimeout(() => setCopied(false), 2500); } catch { setCopied(false); }
  }, [formatStudyAsText]);

  const handleShare = useCallback(async () => {
    setSharing(true);
    try {
      if (navigator.share) await navigator.share({ title: `Bible Study: ${lab.data.passageRef}`, text: formatStudyAsText() });
      else await navigator.clipboard.writeText(formatStudyAsText());
    } catch { setSharing(false); } finally { setSharing(false); }
  }, [lab.data.passageRef, formatStudyAsText]);

  const goBack = useCallback(() => {
    if (lab.data.stage === "passage" || lab.data.completed) {
      navigate("/lab");
    } else {
      lab.actions.saveCurrentProgress();
      navigate("/lab");
    }
  }, [lab.data.stage, lab.data.completed, lab.actions.saveCurrentProgress, navigate]);

  const openBibleReader = useCallback((bookName: string, chapter: string) => {
    navigate(`/bible-reader?book=${bookName}&chapter=${chapter}`);
  }, [navigate]);

  // Listen stage TTS playback
  const startListeningWithTTS = useCallback(() => {
    if (passageVerses.length === 0) return;
    audio.startPlayback(passageVerses.map((v) => ({ text: v.text })), 0);
  }, [passageVerses, audio]);

  // When passage completes one full read-through, increment repeat count
  useEffect(() => {
    if (audio.passageComplete && lab.data.stage === "listen" && !lab.data.listenComplete) {
      lab.actions.incrementRepeat();
      // Auto-start next repeat if not done
      const nextCount = lab.data.repeatCount + 1;
      if (nextCount < lab.data.selectedRepeats) {
        setTimeout(() => {
          audio.startPlayback(passageVerses.map((v) => ({ text: v.text })), 0);
        }, 800);
      }
    }
  }, [audio.passageComplete]); // eslint-disable-line react-hooks/exhaustive-deps

  const showShortcutHint = useCallback((text: string) => {
    setShortcutHint(text);
    if (shortcutTimeoutRef.current) clearTimeout(shortcutTimeoutRef.current);
    shortcutTimeoutRef.current = setTimeout(() => setShortcutHint(null), 2000);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "?") { e.preventDefault(); setShowShortcuts((p) => !p); return; }
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); if (lab.data.stage === "look") lab.actions.advanceLook(); else if (lab.data.stage === "listen") lab.actions.advanceListen(); else if (lab.data.stage === "learn") lab.actions.advanceLearn(); else if (lab.data.stage === "abide") lab.actions.saveAbide(); else if (lab.data.stage === "apply") lab.actions.saveApply(); }
      if ((e.ctrlKey || e.metaKey) && e.key === "s") { e.preventDefault(); if (lab.data.stage !== "passage" && lab.data.stage !== "completed") lab.actions.saveCurrentProgress(); showShortcutHint("Progress saved!"); }
      if (lab.data.stage === "completed" && e.key.toLowerCase() === "r") { e.preventDefault(); lab.actions.resetAll(); }
      const num = parseInt(e.key);
      if (num >= 1 && num <= STAGE_ORDER.length) { const target = STAGE_ORDER[num - 1]; const currentIdx = STAGE_ORDER.indexOf(lab.data.stage); if (num - 1 < currentIdx) { lab.actions.goToStage(target); showShortcutHint(`Jumped to ${target}`); } }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lab, showShortcutHint]);

  return {
    data: {
      lab: lab.data,
      isRtl: false,
      passageVerses,
      versesLoading,
      previewText,
      previewLoading,
      verseWords,
      wordsLoading,
      wordModalOpen,
      selectedWord,
      wordLoadingDetail,
      verseResources,
      resourcesLoading,
      translations,
      translationsLoading,
      translationsError,
      bookPrologue,
      prologueLoading,
      copied,
      sharing,
      showShortcuts,
      shortcutHint,
      audio,
      STAGE_ORDER,
      LISTEN_OPTIONS,
      LOOK_PROMPTS,
    },
    actions: {
      lab: lab.actions,
      setWordModalOpen,
      handleWordTap,
      handleCopy,
      handleShare,
      goBack,
      openBibleReader,
      startListeningWithTTS,
      setShowShortcuts,
      showShortcutHint,
    },
  };
}

export type LabFlowPageModel = ReturnType<typeof useLabFlowPage>;
