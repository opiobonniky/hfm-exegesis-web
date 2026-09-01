// useUserDailyVerse — all state + helpers for the user-facing daily verse page
import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/components/languages/languageProvider";
import { sendPostRequest } from "@/services/api";
import type { DailyVerseItem } from "../types";

export function useUserDailyVerse() {
  const { t, isRtl } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [verse, setVerse] = useState<DailyVerseItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [liked, setLiked] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const loadVerse = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const res = await sendPostRequest("bible", "get-todays-verse", {});
      if (res?.returnCode === 200 && res?.returnData) setVerse(res.returnData);
      else toast({ title: "No verse available today", variant: "destructive" });
    } catch { toast({ title: "Failed to load verse", variant: "destructive" }); }
    finally { setLoading(false); setRefreshing(false); }
  }, [toast]);
  useEffect(() => { loadVerse(); }, [loadVerse]);
  // Track scroll for sticky header styling
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handler = () => setScrolled(el.scrollTop > 50);
    el.addEventListener("scroll", handler, { passive: true });
    return () => el.removeEventListener("scroll", handler);
  }, []);
  const handleCopy = useCallback(() => {
    if (!verse) return;
    const ref = `${verse.bookName} ${verse.chapter}:${verse.verseNumber}`;
    const text = verse.verseText ? `\u201C${verse.verseText}\u201D \u2014 ${ref}` : ref;
    navigator.clipboard.writeText(text).then(() =>
      toast({ title: "Copied to clipboard" })
    );
  }, [verse, toast]);
  const handleShare = useCallback(async () => {
    if (!verse) return;
    const ref = `${verse.bookName} ${verse.chapter}:${verse.verseNumber}`;
    const text = `\u201C${verse.verseText || ""}\u201D \u2014 ${ref}\n\nvia Exegesis Bible App`;
    if (navigator.share) {
      try { await navigator.share({ text }); } catch {}
    } else {
      navigator.clipboard.writeText(text).then(() =>
        toast({ title: "Copied to clipboard" })
      );
    }
  }, [verse, toast]);
  return {
    t, isRtl,
    verse, loading, refreshing, liked, setLiked,
    scrolled, scrollRef, navigate,
    refresh: () => loadVerse(true),
    handleCopy, handleShare,
  };
}
