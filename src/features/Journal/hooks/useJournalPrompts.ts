import { useState, useEffect, useCallback, useMemo } from "react";
import { useLanguage } from "@/components/languages/languageProvider";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { sendPostRequest } from "@/services/api";
import { getBooksByTestament, getChaptersForBook, getVersesCountForChapter } from "@/utilities/bibleUtils";

interface Prompt { id: string; text: string; category: string; difficulty: string; isActive: boolean; description?: string; order?: number; bookName?: string; chapter?: string; verseNumber?: string; }

const ALL_BOOKS = getBooksByTestament("Old").concat(getBooksByTestament("New"));

export function useJournalPrompts() {
  const { t, isRtl } = useLanguage();
  const { userInfo } = useAuth();
  const isAdmin = userInfo?.userRole === 1;
  const { toast } = useToast();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [filterBook, setFilterBook] = useState("");
  const [filterChapter, setFilterChapter] = useState("");
  const [filterBookSearch, setFilterBookSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [formData, setFormData] = useState({ prompt: "", category: "general", description: "", order: 0, isActive: true, bookName: "", chapter: "", verseNumber: "" });
  const [saving, setSaving] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<Prompt | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [books, setBooks] = useState<string[]>([]);
  const [chapters, setChapters] = useState<number[]>([]);
  const [verses, setVerses] = useState<number[]>([]);
  const [bookSearch, setBookSearch] = useState("");
  useEffect(() => {
    if (dialogOpen && books.length === 0) setBooks(getBooksByTestament("Old").concat(getBooksByTestament("New")));
  }, [dialogOpen, books.length]);
  const fetchPrompts = useCallback(async () => {
    setLoading(true);
    try {
      const payload: Record<string, unknown> = {};
      if (category !== "all") payload.category = category;
      if (search) payload.search = search;
      const res = await sendPostRequest("journal", "prompts/get-all", { page: 0, size: 50, ...payload });
      if (res?.returnCode === 200 && res?.returnData) setPrompts(res.returnData.content || []);
    } catch {} finally { setLoading(false); }
  }, [category, search]);
  useEffect(() => { if (isAdmin) fetchPrompts(); }, [isAdmin, fetchPrompts]);
  const handleSave = useCallback(async () => {
    if (!formData.prompt.trim()) { toast({ title: "Prompt text is required", variant: "destructive" }); return; }
    setSaving(true);
    try {
      const payload = { ...formData, id: editingPrompt?.id };
      const res = await sendPostRequest("journal", editingPrompt ? "prompts/update" : "prompts/create", payload);
      if (res?.returnCode === 200) { toast({ title: editingPrompt ? "Updated" : "Created" }); setDialogOpen(false); fetchPrompts(); }
      else { toast({ title: "Failed", variant: "destructive" }); }
    } catch { toast({ title: "Error", variant: "destructive" }); }
    finally { setSaving(false); }
  }, [formData, editingPrompt, toast, fetchPrompts]);
  const handleDelete = useCallback(async () => {
    if (!deleteDialog) return;
    setDeleting(true);
    try {
      const res = await sendPostRequest("journal", "prompts/delete", { id: deleteDialog.id });
      if (res?.returnCode === 200) { toast({ title: "Deleted" }); setDeleteDialog(null); fetchPrompts(); }
      else { toast({ title: "Delete failed", variant: "destructive" }); }
    } catch { toast({ title: "Error", variant: "destructive" }); }
    finally { setDeleting(false); }
  }, [deleteDialog, toast, fetchPrompts]);
  const openEdit = useCallback((prompt?: Prompt) => {
    if (prompt) {
      setEditingPrompt(prompt);
      setFormData({ prompt: prompt.text, category: prompt.category, description: prompt.description || "", order: prompt.order || 0, isActive: prompt.isActive, bookName: prompt.bookName || "", chapter: prompt.chapter || "", verseNumber: prompt.verseNumber || "" });
    } else {
      setEditingPrompt(null);
      setFormData({ prompt: "", category: "general", description: "", order: 0, isActive: true, bookName: "", chapter: "", verseNumber: "" });
    }
    setDialogOpen(true);
  }, []);
  // ── Derived values ──
  const filteredBooks = useMemo(
    () => ALL_BOOKS.filter((b) => !filterBookSearch || b.toLowerCase().includes(filterBookSearch.toLowerCase())),
    [filterBookSearch],
  );

  const filteredPrompts = useMemo(
    () => prompts.filter((item) => {
      if (search && !item.prompt.toLowerCase().includes(search.toLowerCase())) return false;
      if (category && item.category !== category) return false;
      if (filterBook && item.bookName !== filterBook) return false;
      if (filterChapter && item.chapter !== Number(filterChapter)) return false;
      return true;
    }),
    [prompts, search, category, filterBook, filterChapter],
  );

  // ── Actions ──
  const handleBookChange = useCallback((v: string) => {
    setFormData((prev) => ({ ...prev, bookName: v, chapter: "", verseNumber: "" }));
    if (v) { setChapters(getChaptersForBook(v)); } else { setChapters([]); setVerses([]); }
  }, []);

  const handleChapterChange = useCallback((v: string) => {
    setFormData((prev) => ({ ...prev, chapter: v, verseNumber: "" }));
    if (v && formData.bookName) { setVerses(getVersesCountForChapter(formData.bookName, Number(v))); } else { setVerses([]); }
  }, [formData.bookName]);

  return {
    t, isRtl, isAdmin,
    prompts, filteredPrompts, loading, search, setSearch, category, setCategory,
    filterBook, setFilterBook, filterChapter, setFilterChapter, filterBookSearch, setFilterBookSearch,
    dialogOpen, setDialogOpen, editingPrompt, formData, setFormData, saving, handleSave,
    deleteDialog, setDeleteDialog, deleting, handleDelete,
    books, chapters, verses, setChapters, setVerses, bookSearch, setBookSearch,
    filteredBooks, handleBookChange, handleChapterChange,
    openEdit, refresh: fetchPrompts,
  };
}
