// useNotesPage — state, effects, and logic for standalone Notes page
import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/components/languages/languageProvider";
import { sendPostRequest } from "@/services/api";
import { ensureDataLoaded, getVerseText } from "@/utilities/bibleUtils";

export interface NoteItem {
  id: number;
  bookName: string;
  chapter: number;
  verseNumber: number;
  note: string;
  createdOn: string;
  updatedOn: string | null;
}

export function useNotesPage() {
  const { t, isRtl } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBook, setFilterBook] = useState("all");
  const [deleting, setDeleting] = useState<number | null>(null);
  const [editingNote, setEditingNote] = useState<NoteItem | null>(null);
  const [editText, setEditText] = useState("");
  const [saving, setSaving] = useState(false);
  const [verseTextMap, setVerseTextMap] = useState<Record<string, string>>({});

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await sendPostRequest("bible", "get-verse-note", {});
      const items: NoteItem[] = res.returnCode === 200 ? (res.returnData || []) : [];
      setNotes(items.filter(Boolean));

      try {
        await ensureDataLoaded();
        const map: Record<string, string> = {};
        for (const item of items.filter(Boolean)) {
          if (item.bookName && item.chapter && item.verseNumber) {
            const key = `${item.bookName} ${item.chapter}:${item.verseNumber}`;
            if (!(key in map)) {
              const text = getVerseText(item.bookName, Number(item.chapter), Number(item.verseNumber));
              if (text) map[key] = text;
            }
          }
        }
        setVerseTextMap(map);
      } catch { /* Bible data not available */ }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const deleteNote = useCallback(async (id: number) => {
    setDeleting(id);
    try {
      const res = await sendPostRequest("bible", "delete-verse-note", { noteId: id });
      if (res.returnCode === 200) {
        setNotes((p) => p.filter((n) => n.id !== id));
        toast({ title: "Note deleted" });
      }
    } catch { toast({ title: "Failed to delete", variant: "destructive" }); }
    finally { setDeleting(null); }
  }, [toast]);

  const openEdit = useCallback((note: NoteItem) => {
    setEditingNote(note);
    setEditText(note.note);
  }, []);

  const closeEdit = useCallback(() => setEditingNote(null), []);

  const saveNote = useCallback(async () => {
    if (!editingNote || !editText.trim()) return;
    setSaving(true);
    try {
      const res = await sendPostRequest("bible", "update-verse-note", {
        noteId: editingNote.id,
        note: editText.trim(),
      });
      if (res.returnCode === 200) {
        setNotes((p) => p.map((n) => n.id === editingNote.id ? { ...n, note: editText.trim(), updatedOn: new Date().toISOString() } : n));
        toast({ title: "Note updated" });
        setEditingNote(null);
        setEditText("");
      }
    } catch { toast({ title: "Failed to save", variant: "destructive" }); }
    finally { setSaving(false); }
  }, [editingNote, editText, toast]);

  const goToReader = useCallback((book: string, ch: number) => {
    navigate(`/bible-reader?book=${book}&chapter=${ch}`);
  }, [navigate]);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return notes.filter((n) => {
      if (filterBook !== "all" && n.bookName !== filterBook) return false;
      if (q) {
        const ref = `${n.bookName} ${n.chapter}:${n.verseNumber}`.toLowerCase();
        const noteMatch = n.note?.toLowerCase().includes(q) || false;
        if (!ref.includes(q) && !noteMatch) return false;
      }
      return true;
    }).sort((a, b) => a.bookName.localeCompare(b.bookName) || a.chapter - b.chapter || a.verseNumber - b.verseNumber);
  }, [notes, searchQuery, filterBook]);

  const grouped = useMemo(() => {
    const groups: Record<string, Record<number, NoteItem[]>> = {};
    for (const n of filtered) {
      if (!groups[n.bookName]) groups[n.bookName] = {};
      if (!groups[n.bookName][n.chapter]) groups[n.bookName][n.chapter] = [];
      groups[n.bookName][n.chapter].push(n);
    }
    return groups;
  }, [filtered]);

  const formatDate = useCallback((dateString: string | null | undefined): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }, []);

  return {
    t, isRtl, loading, notes, filtered, grouped, searchQuery, setSearchQuery,
    filterBook, setFilterBook, deleting, editingNote, editText, setEditText,
    saving, verseTextMap,
    deleteNote, openEdit, closeEdit, saveNote, goToReader, formatDate, refresh: loadData,
  };
}
