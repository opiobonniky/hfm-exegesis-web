// useVerseExplanationsPage — all state, effects, and logic for VerseExplanations page
import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/components/languages/languageProvider";
import { sendPostRequest } from "@/services/api";
import { routes } from "@/components/Routes/routes";

import type { VerseExplanation } from "../types";
export function useVerseExplanationsPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { userInfo } = useAuth();
  const { t } = useLanguage();
  const isAdmin = userInfo?.userRole === 1;
  const [explanations, setExplanations] = useState<VerseExplanation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [bookFilter, setBookFilter] = useState("All Books");
  const [deleteTarget, setDeleteTarget] = useState<VerseExplanation | null>(null);
  const [deleting, setDeleting] = useState(false);
  const loadExplanations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await sendPostRequest("bible", "get-all-verses-explanation", {
        bookName: bookFilter !== "All Books" ? bookFilter : undefined,
      });
      if (res.returnCode === 200 && res.returnData) {
        const data = res.returnData;
        setExplanations(Array.isArray(data) ? data : (data?.explanations ?? []) as VerseExplanation[]);
      } else {
        toast({ title: t.verseExplanations?.failedToLoad || "Failed to load", variant: "destructive" });
      }
    } catch {
      toast({ title: t.verseExplanations?.networkError || "Network error", variant: "destructive" });
    } finally { setLoading(false); }
  }, [bookFilter, toast, t]);
  useEffect(() => { loadExplanations(); }, [loadExplanations]);
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return explanations.filter((v) =>
      !q || v.bookName.toLowerCase().includes(q) || String(v.chapter).includes(q) ||
      String(v.verseNumber).includes(q) || v.explanation?.toLowerCase().includes(q)
    );
  }, [explanations, search]);
  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
      const res = await sendPostRequest("bible", "delete-verse-explanation", {
        bookName: deleteTarget.bookName, chapter: deleteTarget.chapter, verseNumber: deleteTarget.verseNumber,
      if (res.returnCode === 200) {
        setExplanations((p) => p.filter((e) => e.id !== deleteTarget.id));
        toast({ title: t.verseExplanations?.deleteSuccess || "Deleted" });
        setDeleteTarget(null);
        toast({ title: t.verseExplanations?.deleteFailed || "Failed to delete", variant: "destructive" });
    } catch { toast({ title: t.verseExplanations?.networkError || "Network error", variant: "destructive" }); }
    finally { setDeleting(false); }
  }, [deleteTarget, toast, t]);
  const goToAdd = useCallback(() => navigate(routes.addExplanation.path), [navigate]);
  const goToEdit = useCallback((item: VerseExplanation) => {
    navigate(`/admin/verse-explanation/edit/${item.bookName}/${item.chapter}/${item.verseNumber}`);
  }, [navigate]);
  return {
    t, isAdmin,
    explanations, filtered, loading, search, setSearch,
    bookFilter, setBookFilter,
    deleteTarget, setDeleteTarget, deleting, confirmDelete,
    goToAdd, goToEdit,
  };
}
