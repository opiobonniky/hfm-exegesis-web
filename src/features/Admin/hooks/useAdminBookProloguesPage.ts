// useAdminBookProloguesPage — list + CRUD for book prologues (uses bookName as key)
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { BIBLE_BOOKS } from "@/data/staticData";
import { adminApi } from "../services/adminApi";
import {
  ADMIN_BOOK_PROLOGUES_PAGE_SIZE,
  ADMIN_BOOK_PROLOGUE_EMPTY_FORM,
} from "../constants";
import type { AdminBookPrologue as BookPrologue } from "../types";


export function useAdminBookProloguesPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [items, setItems] = useState<BookPrologue[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingMoreRef = useRef(false);

  // Edit dialog
  const [editItem, setEditItem] = useState<BookPrologue | null>(null);
  const [editForm, setEditForm] = useState(ADMIN_BOOK_PROLOGUE_EMPTY_FORM);

  // Delete dialog
  const [deleteItem, setDeleteItem] = useState<BookPrologue | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async (pageNum = 0, query = "", append = false) => {
    if (append) {
      if (loadingMoreRef.current) return;
      loadingMoreRef.current = true;
      setLoadingMore(true);
    }
    else setLoading(true);
    try {
      const res = await adminApi.request("book-prologues", "admin/get-all", {
        page: pageNum,
        pageSize: ADMIN_BOOK_PROLOGUES_PAGE_SIZE,
        search: query.trim() || undefined,
      });
      const data = res?.returnData || res?.data;
      const raw: BookPrologue[] = Array.isArray(data) ? data : data?.data || [];
      setItems((previous) => (append ? [...previous, ...raw] : raw));
      setTotalCount(data?.total ?? raw.length);
      setHasMore(data?.hasNext ?? raw.length === ADMIN_BOOK_PROLOGUES_PAGE_SIZE);
      setPage(pageNum);
    } catch {
      toast({ title: "Failed to load prologues", variant: "destructive" });
    } finally {
      setLoading(false);
      if (append) {
        loadingMoreRef.current = false;
        setLoadingMore(false);
      }
    }
  }, [toast]);

  useEffect(() => {
    const timer = window.setTimeout(() => load(0, search), 250);
    return () => window.clearTimeout(timer);
  }, [search, load]);

  const loadMore = useCallback(() => {
    if (!hasMore || loadingMoreRef.current) return;
    void load(page + 1, search, true);
  }, [hasMore, load, page, search]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || loadingMore) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loadingMore) {
          loadMore();
        }
      },
      { rootMargin: "0px 0px 320px 0px", threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loadMore]);

  const updateFormField = useCallback((field: string, value: any) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const refresh = useCallback(() => {
    load(0, search);
  }, [load, search]);

  const openEdit = useCallback((item?: BookPrologue) => {
    if (item) {
      setEditItem(item);
      const ks = item.keyScripture as any[] || [];
      setEditForm({
        bookName: item.bookName, title: item.title || "", summary: item.summary || "",
        purpose: item.purpose || "", keyTheme: item.keyTheme || "",
        author: item.author || "", authorDetail: item.authorDetail || "",
        audience: item.audience || "", dateWritten: item.dateWritten || "",
        locationWritten: item.locationWritten || "", background: item.background || "",
        lessons: item.lessons || "", chapters: item.chapters ? String(item.chapters) : "",
        christConnection: item.christConnection || "",
        applications: item.applications || [],
        keyScriptureRef: ks.map((s: any) => s.reference || ""),
        keyScriptureText: ks.map((s: any) => s.text || ""),
        mainThemes: item.mainThemes || [], keyPeople: item.keyPeople || [],
        keyVerses: item.keyVerses || [],
        content: (item as any).content || item.summary || "",
        isPublished: item.isPublished ?? true,
      });
    } else {
      setEditItem(null);
      setEditForm(ADMIN_BOOK_PROLOGUE_EMPTY_FORM);
    }
  }, []);

  const handleSave = useCallback(async () => {
    if (!editForm.bookName || !editForm.title) return;
    setSaving(true);
    try {
      const keyScripture = editForm.keyScriptureRef
        .map((ref, i) => ({ reference: ref, text: editForm.keyScriptureText[i] || "" }))
        .filter((s) => s.reference.trim());
      const payload: any = {
        bookName: editForm.bookName, title: editForm.title, summary: editForm.summary,
        purpose: editForm.purpose, keyTheme: editForm.keyTheme,
        author: editForm.author, authorDetail: editForm.authorDetail,
        audience: editForm.audience, dateWritten: editForm.dateWritten,
        locationWritten: editForm.locationWritten, background: editForm.background,
        lessons: editForm.lessons, chapters: editForm.chapters ? parseInt(editForm.chapters) : null,
        christConnection: editForm.christConnection,
        applications: editForm.applications.filter(Boolean),
        keyScripture, mainThemes: editForm.mainThemes.filter(Boolean),
        keyPeople: editForm.keyPeople.filter(Boolean), keyVerses: editForm.keyVerses.filter(Boolean),
        isPublished: editForm.isPublished,
      };
      const res = await adminApi.request("book-prologues", "admin/upsert", payload);
      if (res?.returnCode === 200 || res?.status === 200) {
        toast({ title: editItem ? "Updated" : "Created" });
        setEditItem(null);
        setEditForm(ADMIN_BOOK_PROLOGUE_EMPTY_FORM);
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
      const res = await adminApi.request("book-prologues", "admin/delete", {
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

  return { data: {
    items,
    loading,
    loadingMore,
    loadMore,
    search,
    setSearch,
    hasMore,
    totalCount,
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
    updateFormField,
    openEdit,
    handleSave,
    handleDelete,
    filteredBooks,
    navigate,
  }, actions: {
    loadMore, setSearch, setEditItem, setEditForm, setDeleteItem, refresh,
    updateFormField, openEdit, handleSave, handleDelete,
  } };
}
