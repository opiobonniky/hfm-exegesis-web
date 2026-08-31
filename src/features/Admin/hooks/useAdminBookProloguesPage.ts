// useAdminBookProloguesPage — list + CRUD for book prologues (uses bookName as key)
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
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
const PAGE_SIZE = 12;

export function useAdminBookProloguesPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [allItems, setAllItems] = useState<BookPrologue[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Edit dialog
  const [editItem, setEditItem] = useState<BookPrologue | null>(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);

  // Delete dialog
  const [deleteItem, setDeleteItem] = useState<BookPrologue | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await sendPostRequest("book-prologues", "admin/get-all", {
        page: 0,
        size: 1000,
      });
      const data = res?.returnData || res?.data;
      const raw = Array.isArray(data) ? data : data?.data || [];
      setAllItems(raw);
    } catch {
      toast({ title: "Failed to load prologues", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
    setPage(0);
  }, []);

  // Client-side search filtering
  const filteredItems = useMemo(() => {
    if (!search.trim()) return allItems;
    const q = search.toLowerCase();
    return allItems.filter(
      (item) =>
        item.bookName?.toLowerCase().includes(q) ||
        item.title?.toLowerCase().includes(q),
    );
  }, [allItems, search]);

  // Client-side pagination
  const items = useMemo(() => {
    return filteredItems.slice(0, (page + 1) * PAGE_SIZE);
  }, [filteredItems, page]);

  const hasMore = items.length < filteredItems.length;
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const currentPage = Math.min(page + 1, totalPages);

  // Infinite scroll observer
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore) {
          setPage((p) => p + 1);
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore]);

  const refresh = useCallback(() => {
    setPage(0);
    load();
  }, [load]);

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
    allItems,
    loading,
    search,
    setSearch,
    hasMore,
    page,
    setPage,
    totalPages,
    currentPage,
    totalCount: filteredItems.length,
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
