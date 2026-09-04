// useVerseExplanationList — supports initial load + load-more (infinite scroll)
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { sendPostRequest } from "@/services/api";

export interface VerseExplanationListItem {
  id: number;
  bookName: string;
  chapter: number;
  verseNumber: number;
  bibleVersion: string;
  sortOrder: number;
  exegesis: { explanationText: string; applicationText: string } | null;
  createdOn: string;
  updatedOn: string | null;
}

interface PageData {
  items: VerseExplanationListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function useVerseExplanationList(pageSize = 20) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [data, setData] = useState<PageData>({ items: [], totalCount: 0, page: 1, pageSize, totalPages: 0 });
  const [loading, setLoading] = useState(true); // initial load / refreshing
  const [loadingMore, setLoadingMore] = useState(false); // load-more state
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState<number | null>(null);

  const fetchPage = useCallback(
    async (pageNum: number, q: string) => {
      const append = pageNum > 1;
      if (append) setLoadingMore(true);
      else setLoading(true);

      try {
        const res = await sendPostRequest("bible", "get-all-verses-explanation", {
          page: pageNum,
          pageSize,
          search: q || undefined,
        });
        const rd = res?.returnData || res?.data;
        const items: VerseExplanationListItem[] = rd?.explanations || [];
        const totalCount = rd?.totalCount ?? 0;
        const totalPages = rd?.totalPages ?? Math.ceil(totalCount / pageSize);

        setData((prev) => ({
          items: append ? [...prev.items, ...items] : items,
          totalCount,
          page: pageNum,
          pageSize,
          totalPages,
        }));
      } catch (err) {
        console.error(err);
        toast({ title: "Error", description: "Failed to load verse explanations", variant: "destructive" });
      } finally {
        if (append) setLoadingMore(false);
        else setLoading(false);
      }
    },
    [pageSize, toast],
  );

  // initial load / page change / search
  useEffect(() => {
    fetchPage(page, search);
  }, [page, search]); // eslint-disable-line react-hooks/exhaustive-deps

  const refresh = useCallback(() => {
    setPage(1);
    fetchPage(1, search);
  }, [search, fetchPage]);

  const goToPage = useCallback((p: number) => {
    // explicit navigation to a page - replace items
    setPage(p);
  }, []);

  const loadMore = useCallback(() => {
    // only load more if there are pages remaining
    setPage((prev) => prev + 1);
  }, []);

  const deleteItem = useCallback(
    async (item: VerseExplanationListItem) => {
      setDeleting(item.id);
      try {
        const res = await sendPostRequest("bible", "delete-verse-explanation", { id: item.id });
        if (res?.returnCode === 200 || res?.status === 200) {
          toast({ title: "Deleted", description: `${item.bookName} ${item.chapter}:${item.verseNumber} deleted` });
          refresh();
          return true;
        }
        throw new Error(res?.returnMessage || "Failed to delete");
      } catch (e: any) {
        toast({ title: "Error", description: e.message || "Failed to delete", variant: "destructive" });
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
  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const hasMore = data.page < data.totalPages;

  return {
    data,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    search: searchInput,
    setSearch: setSearchInput,
    page,
    goToPage,
    refreshing: loading,
    refresh,
    deleteItem,
    deleting,
    viewItem,
    editItem,
    goBack,
  };
}
