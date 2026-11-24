// useVerseExplanationDetail — fetch a single verse explanation with all children
import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { adminApi } from "../services/adminApi";
import type { VerseExplanationDetail } from "../types";
import type { VerseExplanationDetailLocationState } from "../utils";
import { tt } from '@/components/languages/hardcodedTranslate';

/**
 * Detail loader.
 *
 * The row the admin clicked passes its database id (plus the list index) in
 * router state, so the page loads by primary key — the indexed lookup — and
 * never puts the passage in the URL. A reference lookup stays as a fallback for
 * older links that only carry book/chapter/verse.
 */
export function useVerseExplanationDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [item, setItem] = useState<VerseExplanationDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const state = (location.state || null) as Partial<VerseExplanationDetailLocationState> | null;
  const rawId = state?.id;
  const id = rawId == null || rawId === '' ? null : String(rawId);
  const bookName = typeof state?.bookName === 'string' ? state.bookName : '';
  const chapter = Number(state?.chapter);
  const verseNumber = Number(state?.verseNumber);
  const index = typeof state?.index === 'number' ? state.index : null;
  const hasReference = !!bookName && Number.isFinite(chapter) && Number.isFinite(verseNumber)
    && chapter > 0 && verseNumber > 0;

  const backToList = useCallback(() => {
    navigate("/admin/verse-explanations", {
      state: item?.id == null && id == null
        ? null
        : { restoreId: item?.id ?? id, restoreIndex: index ?? undefined },
    });
  }, [navigate, item?.id, id, index]);

  useEffect(() => {
    if (id == null && !hasReference) {
      // Opened without a record (reload/bookmark of the static URL).
      toast({ title: tt("Not found"), variant: "destructive" });
      navigate("/admin/verse-explanations", { replace: true });
      return;
    }
    let active = true;
    setLoading(true);

    const loadByReference = () => adminApi.request("bible", "get-verse-explanation", {
      bookName,
      chapter,
      verseNumber,
    });

    const load = async () => {
      let res = id != null
        ? await adminApi.request("bible", "get-verse-explanation-for-edit", { id }, { includeLanguage: false })
        : null;
      const byIdFailed = !res || (res.returnCode ?? res.status) !== 200 || !res.returnData;
      if (byIdFailed) {
        if (!hasReference) return null;
        res = await loadByReference();
      }
      return res;
    };

    load()
      .then(async (res) => {
        if (!active) return;
        if (res && (res.returnCode === 200 || res.status === 200) && res.returnData) {
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
          toast({ title: tt("Not found"), variant: "destructive" });
          navigate("/admin/verse-explanations");
        }
      })
      .catch(() => {
        if (!active) return;
        toast({ title: tt("Failed to load"), variant: "destructive" });
        navigate("/admin/verse-explanations");
      })
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [id, bookName, chapter, verseNumber, hasReference, toast, navigate]);

  const deleteItem = useCallback(async () => {
    if (!item) return false;
    try {
      const res = await adminApi.request("bible", "delete-verse-explanation", { id: item.id });
      if (res?.returnCode === 200 || res?.status === 200) {
        toast({ title: tt("Deleted") });
        navigate("/admin/verse-explanations");
        return true;
      }
      throw new Error(res?.returnMessage || "Failed to delete");
    } catch (e: any) {
      toast({ title: tt("Error"), description: e.message, variant: "destructive" });
      return false;
    }
  }, [item, toast, navigate]);

  return { data: { item, loading }, actions: { navigate, deleteItem, backToList } };
}
