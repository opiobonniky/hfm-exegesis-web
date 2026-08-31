// useAdminBookProloguesPage — list + CRUD for book prologues (uses bookName as key)
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { BIBLE_BOOKS } from "@/data/staticData";
import { sendPostRequest } from "@/services/api";

export interface BookPrologue {
  bookName: string;
  title?: string;
  content?: string;
  isPublished?: boolean;
  createdOn?: string;
  updatedOn?: string | null;
}

const EMPTY_FORM = { bookName: "", title: "", content: "", isPublished: true };

export function useAdminBookProloguesPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [items, setItems] = useState<BookPrologue[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Edit dialog
  const [editItem, setEditItem] = useState<BookPrologue | null>(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);

  // Delete dialog
  const [deleteItem, setDeleteItem] = useState<BookPrologue | null>(null);

  const load = useCallback(
    async (pageNum: number, q: string, append = false) => {
      if (append) setLoadingMore(true);
      else setLoading(true);
      try {
        const res = await sendPostRequest("book-prologues", "admin/get-all", {
          page: pageNum,
          size: 20,
          search: q || undefined,
        });
        const data = res?.returnData || res?.data;
        const raw = Array.isArray(data) ? data : data?.data || [];
        setItems((prev) => (append ? [...prev, ...raw] : raw));
        const total = data?.total ?? raw.length;
        setHasMore(raw.length === 20);
      } catch {
        toast({ title: "Failed to load prologues", variant: "destructive" });
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [toast],
  );

  useEffect(() => {
    load(0, search);
    setPage(0);
  }, []);

  // Infinite scroll observer
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || loadingMore) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loadingMore) {
          const nextPage = page + 1;
          setPage(nextPage);
          load(nextPage, search, true);
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, page, search, load]);

  const refresh = useCallback(() => {
    setPage(0);
    load(0, search);
  }, [search, load]);

  const openEdit = useCallback((item?: BookPrologue) => {
    if (item) {
      setEditItem(item);
      setEditForm({
        bookName: item.bookName,
        title: item.title || "",
        content: item.content || "",
        isPublished: item.isPublished ?? true,
      });
    } else {
      setEditItem(null);
      setEditForm(EMPTY_FORM);
    }
  }, []);

  const handleSave = useCallback(async () => {
    if (!editForm.bookName || !editForm.title || !editForm.content) return;
    setSaving(true);
    try {
      const res = await sendPostRequest("book-prologues", "admin/upsert", {
        bookName: editForm.bookName,
        title: editForm.title,
        content: editForm.content,
        isPublished: editForm.isPublished,
      });
      if (res?.returnCode === 200 || res?.status === 200) {
        toast({ title: editItem ? "Updated" : "Created" });
        setEditItem(null);
        setEditForm(EMPTY_FORM);
        refresh();
      } else {
        throw new Error(res?.returnMessage || "Failed to save");
      }
    } catch (e) {
      toast({
        title: "Error",
        description: (e as Error).message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }, [editForm, editItem, toast, refresh]);

  const handleDelete = useCallback(async () => {
    if (!deleteItem) return;
    setDeleting(deleteItem.bookName);
    try {
      const res = await sendPostRequest("book-prologues", "admin/delete", {
        bookName: deleteItem.bookName,
      });
      if (res?.returnCode === 200 || res?.status === 200) {
        toast({ title: "Deleted" });
        setDeleteItem(null);
        refresh();
      } else {
        throw new Error(res?.returnMessage || "Failed to delete");
      }
    } catch {
      toast({ title: "Delete failed", variant: "destructive" });
    } finally {
      setDeleting(null);
    }
  }, [deleteItem, toast, refresh]);

  const filteredBooks = !editForm.bookName
    ? BIBLE_BOOKS
    : BIBLE_BOOKS.filter((b) =>
        b.toLowerCase().includes(editForm.bookName.toLowerCase()),
      );

  return {
    items,
    loading,
    loadingMore,
    search,
    setSearch,
    hasMore,
    saving,
    deleting,
    sentinelRef,
    editItem,
    setEditItem,
    editForm,
    setEditForm,
    deleteItem,
    setDeleteItem,
    refresh,
    openEdit,
    handleSave,
    handleDelete,
    filteredBooks,
    navigate,
  };
}
