// useUserDevotions — all state + helpers for the user-facing daily devotion page
import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { sendPostRequest } from "@/services/api";
import type { DailyDevotionItem } from "../types";

export function useUserDevotions() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [devotion, setDevotion] = useState<DailyDevotionItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [liked, setLiked] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const loadDevotion = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const res = await sendPostRequest("bible", "get-todays-devotion", {});
      if (res?.returnCode === 200 && res?.returnData) setDevotion(res.returnData);
      else toast({ title: "No devotion available today", variant: "destructive" });
    } catch { toast({ title: "Failed to load devotion", variant: "destructive" }); }
    finally { setLoading(false); setRefreshing(false); }
  }, [toast]);
  useEffect(() => { loadDevotion(); }, [loadDevotion]);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handler = () => setScrolled(el.scrollTop > 50);
    el.addEventListener("scroll", handler, { passive: true });
    return () => el.removeEventListener("scroll", handler);
  }, []);
  const handleCopy = useCallback(() => {
    if (!devotion) return;
    const ref = devotion.bookName
      ? `${devotion.bookName} ${devotion.chapter}:${devotion.verseNumber}`
      : devotion.title;
    const text = `"${devotion.content.slice(0, 200)}..." — ${ref}`;
    navigator.clipboard.writeText(text).then(() =>
      toast({ title: "Copied to clipboard" })
    );
  }, [devotion, toast]);
  const handleShare = useCallback(async () => {
    const text = `${devotion.title}\n\n${devotion.content}\n\nvia Exegesis Bible App`;
    if (navigator.share) {
      try { await navigator.share({ title: devotion.title, text }); } catch {}
    } else {
      navigator.clipboard.writeText(text).then(() =>
        toast({ title: "Copied to clipboard" })
      );
    }
  return {
    devotion, loading, refreshing, liked, setLiked,
    scrolled, scrollRef, navigate,
    refresh: () => loadDevotion(true),
    handleCopy, handleShare,
  };
}
