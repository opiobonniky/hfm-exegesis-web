// useVerseExplanationDetail — fetch a single verse explanation with all children
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { adminApi } from "../services/adminApi";
import type { VerseExplanationDetail } from "../types";

export function useVerseExplanationDetail() {
  const { bookName, chapter, verseNumber } = useParams<{
    bookName: string;
    chapter: string;
    verseNumber: string;
  }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [item, setItem] = useState<VerseExplanationDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookName || !chapter || !verseNumber) return;
    let active = true;
    setLoading(true);
    adminApi.request("bible", "get-verse-explanation", {
      bookName: decodeURIComponent(bookName),
      chapter: Number(chapter),
      verseNumber: Number(verseNumber),
    })
      .then(async (res) => {
        if (!active) return;
        if (res?.returnCode === 200 && res.returnData) {
          const d = res.returnData as VerseExplanationDetail;
          setItem(d);

          // attempt to fetch the verse text for a richer UI — fall back silently on failure
          try {
            const version = d.bibleVersion || "BSB";
            const verse = await adminApi.getVerse(version, d.bookName, d.chapter, d.verseNumber);
            if (!active) return;
            setItem((prev) => (prev ? { ...prev, verseText: verse?.text || "" } : prev));
          } catch {
            // ignore verse fetch errors
          }
        } else {
          toast({ title: "Not found", variant: "destructive" });
          navigate("/admin/verse-explanations");
        }
      })
      .catch(() => {
        if (!active) return;
        toast({ title: "Failed to load", variant: "destructive" });
        navigate("/admin/verse-explanations");
      })
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [bookName, chapter, verseNumber, toast, navigate]);

  const deleteItem = useCallback(async () => {
    if (!item) return false;
    try {
      const res = await adminApi.request("bible", "delete-verse-explanation", { id: item.id });
      if (res?.returnCode === 200 || res?.status === 200) {
        toast({ title: "Deleted" });
        navigate("/admin/verse-explanations");
        return true;
      }
      throw new Error(res?.returnMessage || "Failed to delete");
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
      return false;
    }
  }, [item, toast, navigate]);

  return { data: { item, loading }, actions: { navigate, deleteItem } };
}
