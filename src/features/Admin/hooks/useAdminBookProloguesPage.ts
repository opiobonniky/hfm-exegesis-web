// useAdminBookProloguesPage — list + CRUD for book prologues (uses bookName as key)
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { BIBLE_BOOKS } from "@/data/staticData";
import { sendPostRequest } from "@/services/api";

export interface BookPrologue {
  bookName: string;
  title?: string;
  summary?: string;
  author?: string;
  keyTheme?: string;
  purpose?: string;
  chapters?: number;
  isPublished?: boolean;
  createdOn?: string;
  updatedOn?: string | null;
  [key: string]: any; // allow all other fields
}

const EMPTY_FORM = {
  bookName: "", title: "", summary: "", purpose: "", keyTheme: "",
  author: "", authorDetail: "", audience: "", dateWritten: "", locationWritten: "",
  background: "", lessons: "", chapters: "", christConnection: "",
  applications: [] as string[], keyScriptureRef: [] as string[], keyScriptureText: [] as string[],
  mainThemes: [] as string[], keyPeople: [] as string[], keyVerses: [] as string[],
  content: "", isPublished: true,
};
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

  const updateFormField = useCallback((field: string, value: any) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const refresh = useCallback(() => {
    setPage(0);
    load();
  }, [load]);

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
      setEditForm(EMPTY_FORM);
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
      const res = await sendPostRequest("book-prologues", "admin/upsert", payload);
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
    updateFormField,
    openEdit,
    handleSave,
    handleDelete,
    filteredBooks,
    navigate,
  };
}
