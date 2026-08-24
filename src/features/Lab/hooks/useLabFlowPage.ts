 * useLabFlowPage — comprehensive hook wrapping useLabFlow + all page-level state.
 * Extracts ALL useState/useEffect from LabFlow page.
 */
import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useLabFlow, STAGE_ORDER, LISTEN_OPTIONS, LOOK_PROMPTS } from "@/hooks/useLabFlow";
import { getVerseWords, getStrongsEntry } from "@/services/strongsApi";
import type { StrongsWordData, StrongsEntry as StrongsEntryType } from "@/services/strongsApi";
import { getBookPrologue } from "@/services/bookProloguesApi";
import type { BookPrologue } from "@/services/bookProloguesApi";
import { getVerseResources, getTranslationComparison } from "@/services/verseResourcesApi";
import type { VerseResourceData, TranslationComparisonEntry } from "@/services/verseResourcesApi";
import { bibleApi } from "@/services/bibleApi";
import type { Verse } from "@/services/bibleApi";

export function useLabFlowPage() {
  const navigate = useNavigate();
  const lab = useLabFlow();
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
  //  EFFECTS — data fetching
  // Fetch passage verses when passage is selected
  useEffect(() => {
    if (!lab.bookName || !lab.chapter || lab.stage === "passage") return;
    let cancelled = false;
    const fetchVerses = async () => {
      setVersesLoading(true);
      try {
        const data = await bibleApi.getChapter(lab.bookName, lab.chapter, lab.versionId);
        if (cancelled) return;
        const filtered = lab.verseEnd
          ? data.filter((v: Verse) => v.verse >= lab.verseStart && v.verse <= lab.verseEnd)
          : data.filter((v: Verse) => v.verse === lab.verseStart);
        setPassageVerses(filtered);
      } catch { if (!cancelled) setPassageVerses([]); }
      finally { if (!cancelled) setVersesLoading(false); }
    };
    fetchVerses();
    return () => { cancelled = true; };
  }, [lab.bookName, lab.chapter, lab.verseStart, lab.verseEnd, lab.stage, lab.versionId]);
  // Fetch verse words (Strong's) when entering Learn stage
    if (lab.stage !== "learn" || !lab.passageRef || passageVerses.length === 0) return;
    const fetchWords = async () => {
      setWordsLoading(true);
        const text = passageVerses.map((v) => v.text).join(" ");
        const words = await getVerseWords(text);
        if (!cancelled) setVerseWords(words);
      } catch { if (!cancelled) setVerseWords([]); }
      finally { if (!cancelled) setWordsLoading(false); }
    fetchWords();
  }, [lab.stage, lab.passageRef, passageVerses]);
  // Fetch book prologue when entering Learn stage
    if (lab.stage !== "learn" || !lab.bookName) return;
    const fetch = async () => {
      setPrologueLoading(true);
        const p = await getBookPrologue(lab.bookName);
        if (!cancelled) setBookPrologue(p);
      } catch { if (!cancelled) setBookPrologue(null); }
      finally { if (!cancelled) setPrologueLoading(false); }
    fetch();
  }, [lab.stage, lab.bookName]);
  // Fetch verse resources when entering Learn stage
    if (lab.stage !== "learn" || !lab.passageRef) return;
      setResourcesLoading(true);
        const r = await getVerseResources(lab.bookName, lab.chapter, lab.verseStart);
        if (!cancelled) setVerseResources(r);
      } catch { if (!cancelled) setVerseResources(null); }
      finally { if (!cancelled) setResourcesLoading(false); }
  }, [lab.stage, lab.passageRef, lab.bookName, lab.chapter, lab.verseStart]);
  // Fetch translation comparison when entering Learn stage
      setTranslationsLoading(true);
      setTranslationsError(false);
        const t = await getTranslationComparison(lab.bookName, lab.chapter, lab.verseStart, lab.verseEnd);
        if (!cancelled) setTranslations(t);
      } catch { if (!cancelled) { setTranslations(null); setTranslationsError(true); } }
      finally { if (!cancelled) setTranslationsLoading(false); }
  }, [lab.stage, lab.passageRef, lab.bookName, lab.chapter, lab.verseStart, lab.verseEnd]);
  // Preview text for passage selection
    if (lab.stage !== "passage" || !lab.bookName || !lab.chapter || !lab.verseStart) { setPreviewText(""); return; }
      setPreviewLoading(true);
        const end = lab.verseEnd || lab.verseStart;
        const filtered = data.filter((v: Verse) => v.verse >= lab.verseStart && v.verse <= end);
        setPreviewText(filtered.map((v: Verse) => `${v.verse}. ${v.text}`).join("\n"));
      } catch { if (!cancelled) setPreviewText(""); }
      finally { if (!cancelled) setPreviewLoading(false); }
  }, [lab.stage, lab.bookName, lab.chapter, lab.verseStart, lab.verseEnd, lab.versionId]);
  //  HANDLERS
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
    lines.push(`Bible Study: ${lab.passageRef || `${lab.bookName} ${lab.chapter}:${lab.verseStart}${lab.verseEnd ? `-${lab.verseEnd}` : ""}`}`);
    lines.push("-".repeat(50));
    if (lab.lookNotes) { lines.push("LOOK — Observations"); try { const parsed = JSON.parse(lab.lookNotes); if (typeof parsed === "object" && parsed !== null) { Object.entries(parsed).filter(([_, v]) => (v as string).trim()).forEach(([key, val]) => { lines.push(`${Number(key) + 1}. ${val}`); }); } } catch { lines.push(lab.lookNotes); } lines.push(""); }
    if (lab.learnNotes) { lines.push("LEARN — Study Notes"); lines.push(lab.learnNotes); lines.push(""); }
    if (lab.reflection) { lines.push("REFLECTION"); lines.push(lab.reflection); lines.push(""); }
    if (lab.prayer) { lines.push("PRAYER"); lines.push(lab.prayer); lines.push(""); }
    if (lab.appText) { lines.push("APPLICATION"); lines.push(lab.appText); lines.push(""); }
    lines.push("Created with Exegesis Bible App");
    return lines.join("\n");
  }, [lab]);
  const handleCopy = useCallback(async () => {
    try { await navigator.clipboard.writeText(formatStudyAsText()); setCopied(true); setTimeout(() => setCopied(false), 2500); } catch {}
  }, [formatStudyAsText]);
  const handleShare = useCallback(async () => {
    setSharing(true);
      if (navigator.share) await navigator.share({ title: `Bible Study: ${lab.passageRef}`, text: formatStudyAsText() });
      else await navigator.clipboard.writeText(formatStudyAsText());
    } catch {} finally { setSharing(false); }
  }, [lab.passageRef, formatStudyAsText]);
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "?") { e.preventDefault(); setShowShortcuts((p) => !p); return; }
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); if (lab.stage === "look") lab.advanceLook(); else if (lab.stage === "listen") lab.advanceListen(); else if (lab.stage === "learn") lab.advanceLearn(); else if (lab.stage === "abide") lab.saveAbide(); }
      if ((e.ctrlKey || e.metaKey) && e.key === "s") { e.preventDefault(); if (lab.stage !== "passage" && lab.stage !== "completed") lab.saveCurrentProgress(); showShortcutHint("Progress saved!"); }
      if (lab.stage === "completed" && e.key.toLowerCase() === "r") { e.preventDefault(); lab.reset(); }
      const num = parseInt(e.key);
      if (num >= 1 && num <= STAGE_ORDER.length) { const target = STAGE_ORDER[num - 1]; const currentIdx = STAGE_ORDER.indexOf(lab.stage as any); if (num - 1 < currentIdx) { lab.goToStage(target); showShortcutHint(`Jumped to ${target}`); } }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  const showShortcutHint = useCallback((text: string) => {
    setShortcutHint(text);
    if (shortcutTimeoutRef.current) clearTimeout(shortcutTimeoutRef.current);
    shortcutTimeoutRef.current = setTimeout(() => setShortcutHint(null), 2000);
  return {
    navigate, lab, isRtl: false, // lab provides isRtl
    // Passage data
    passageVerses, versesLoading, previewText, previewLoading,
    // Words
    verseWords, wordsLoading, wordModalOpen, setWordModalOpen, selectedWord, wordLoadingDetail,
    // Resources
    verseResources, resourcesLoading, translations, translationsLoading, translationsError,
    // Prologue
    bookPrologue, prologueLoading,
    // Actions
    handleWordTap, handleCopy, handleShare, copied, sharing,
    // Shortcuts
    showShortcuts, setShowShortcuts, shortcutHint,
    // Constants re-export
    STAGE_ORDER, LISTEN_OPTIONS, LOOK_PROMPTS,
  };
}
