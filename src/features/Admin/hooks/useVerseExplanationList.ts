// useVerseExplanationList — append each server page until the list is exhausted
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { adminApi } from "../services/adminApi";
import type {
  VerseExplanationListItem,
  VerseExplanationPageData as PageData,
} from "../types";
import { tt } from '@/components/languages/hardcodedTranslate';
export type { VerseExplanationListItem };

export const VERSE_EXPLANATION_PAGE_SIZE = 9;

export function useVerseExplanationList(pageSize = VERSE_EXPLANATION_PAGE_SIZE) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [data, setData] = useState<PageData>({ items: [], totalCount: 0, page: 1, pageSize, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [revision, setRevision] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [bookName, setBookName] = useState("");
  const [chapter, setChapter] = useState("");
  const [creatorName, setCreatorName] = useState("");
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError(false);
    const load = async () => {
      try {
        const res = await adminApi.request("bible", "get-all-verses-explanation", {
          page,
          pageSize,
          listPreview: true,
          search: search || undefined,
          bookName: bookName || undefined,
          chapter: chapter || undefined,
          creatorName: creatorName.trim() || undefined,
        });
        if (!active) return;
        const rd = res?.returnData || res?.data;
        if ((res?.returnCode ?? res?.status) !== 200 || !Array.isArray(rd?.explanations)) {
          throw new Error("Failed to load verse explanations");
        }
        const totalCount = rd?.totalCount ?? 0;
        const totalPages = rd?.totalPages ?? Math.ceil(totalCount / pageSize);
        setData(previous => {
          const seen = new Set(page === 1 ? [] : previous.items.map(item => item.id));
          const incoming = (rd.explanations as VerseExplanationListItem[]).filter(item => {
            if (seen.has(item.id)) return false;
            seen.add(item.id);
            return true;
          });
          return {
            items: page === 1 ? incoming : [...previous.items, ...incoming],
            totalCount, page, pageSize, totalPages,
          };
        });
      } catch {
        if (!active) return;
        setLoadError(true);
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => { active = false; };
  }, [page, pageSize, search, bookName, chapter, creatorName, revision]);

  const refresh = useCallback(() => {
    setPage(1);
    setRevision((current) => current + 1);
  }, []);
  const retry = () => setRevision(current => current + 1);

  const hasMore = data.page < data.totalPages;
  const loadMore = useCallback(() => {
    if (loading || loadError || !hasMore || searchInput.trim() !== search) return;
    setPage(current => current === data.page ? current + 1 : current);
  }, [data.page, hasMore, loadError, loading, search, searchInput]);

  const changeBook = useCallback((value: string) => {
    setBookName(value);
    // Chapter choices belong to the selected book, like the Add Explanation form.
    setChapter("");
    setPage(1);
  }, []);

  const changeChapter = useCallback((value: string) => {
    setChapter(value);
    setPage(1);
  }, []);

  const changeCreatorName = useCallback((value: string) => {
    setCreatorName(value);
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setBookName("");
    setChapter("");
    setCreatorName("");
    setSearchInput("");
    setSearch("");
    setPage(1);
  }, []);

  const deleteItem = useCallback(
    async (item: VerseExplanationListItem) => {
      setDeleting(item.id);
      try {
        const res = await adminApi.request("bible", "delete-verse-explanation", { id: item.id });
        if (res?.returnCode === 200 || res?.status === 200) {
          toast({ title: tt("Deleted"), description: `${item.bookName} ${item.chapter}:${item.verseNumber} deleted` });
          refresh();
          return true;
        }
        throw new Error(res?.returnMessage || "Failed to delete");
      } catch (e: any) {
        toast({ title: tt("Error"), description: e.message || "Failed to delete", variant: "destructive" });
        return false;
      } finally {
        setDeleting(null);
      }
    },
    [refresh, toast],
  );

  const viewItem = useCallback(
    (item: VerseExplanationListItem) => {
      navigate(`/admin/verse-explanations/${encodeURIComponent(item.bookName)}/${item.chapter}/${item.verseNumber}`);
    },
    [navigate],
  );

  const editItem = useCallback(
    (item: VerseExplanationListItem) => {
      navigate(`/admin/edit-verse-explanation/${encodeURIComponent(item.bookName)}/${item.chapter}/${item.verseNumber}`);
    },
    [navigate],
  );

  const goBack = useCallback(() => navigate("/admin"), [navigate]);

  // Debounced search
  useEffect(() => {
    const query = searchInput.trim();
    if (query === search) return;
    const t = setTimeout(() => {
      setSearch(query);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput, search]);

  return {
    data: {
      data, loading, loadError, hasMore, search: searchInput, page, deleting,
      bookName, chapter, creatorName,
    },
    actions: {
      setSearch: setSearchInput, loadMore, retry, deleteItem, viewItem, editItem, goBack,
      setBookName: changeBook, setChapter: changeChapter, setCreatorName: changeCreatorName, clearFilters,
    },
  };
}
