import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { BIBLE_BOOKS } from "@/data/staticData";
import { useAdminCrud } from "./useAdminCrud";
import { VERSE_EXPLANATION_EMPTY_FORM } from "../constants";

interface VerseExplanation {
  id: number; bookName: string; chapter: number; verseNumber: number;
  bibleVersion: string; sortOrder: number;
  exegesis: any; studyMetadata: any; wordStudies: any[];
  practicalApps: any[]; crossReferences: any[]; themes: any[];
  createdOn: string; updatedOn: string | null;
}
const EMPTY_FORM = VERSE_EXPLANATION_EMPTY_FORM;
export function useAdminVerseExplanationsPage() {
  const navigate = useNavigate();
  const { items, loading, search, setSearch, hasMore, loadingMore, saving, deleting, sentinelRef, refresh, loadMore, save, remove } =
    useAdminCrud<VerseExplanation>({
      route: "bible", listAction: "get-all-verses-explanation",
      saveAction: "add-verse-explanation", deleteAction: "delete-verse-explanation",
      listKey: "explanations", totalKey: "totalCount",
    });
  const [editItem, setEditItem] = useState<VerseExplanation | null>(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [deleteItem, setDeleteItem] = useState<VerseExplanation | null>(null);
  const openEdit = useCallback((item?: VerseExplanation) => {
    if (item) { 
      setEditItem(item); 
      setEditForm({ 
        bookName: item.bookName, 
        chapter: String(item.chapter), 
        verseNumber: String(item.verseNumber),
        bibleVersion: item.bibleVersion || "BSB",
        exegesis: item.exegesis || { explanationText: "", applicationText: "" },
        studyMetadata: item.studyMetadata || { introduction: "", backgroundAuthor: "", backgroundBook: "", backgroundContext: "", finalThoughts: "" },
        wordStudies: item.wordStudies || [],
        practicalApps: item.practicalApps || [],
        crossReferences: item.crossReferences || [],
        themes: item.themes || [],
      }); 
    }
    else { setEditItem(null); setEditForm(EMPTY_FORM); }
  }, []);
  const closeEditForm = useCallback(() => { setEditItem(null); setEditForm(EMPTY_FORM); }, []);
  const closeDeleteDialog = useCallback(() => setDeleteItem(null), []);
  const goBack = useCallback(() => navigate("/admin"), [navigate]);
  const viewItem = useCallback((item: VerseExplanation) => {
    navigate(`/admin/verse-explanations/${encodeURIComponent(item.bookName)}/${item.chapter}/${item.verseNumber}`);
  }, [navigate]);
  const handleSave = useCallback(async () => {
    if (!editForm.bookName || !editForm.chapter || !editForm.verseNumber || !editForm.exegesis.explanationText) return;
    const ok = await save({ 
      ...editForm, 
      chapter: parseInt(editForm.chapter), 
      verseNumber: parseInt(editForm.verseNumber) 
    }, editItem?.id);
    if (ok) { setEditItem(null); setEditForm(EMPTY_FORM); }
  }, [editForm, editItem, save]);
  const handleDelete = useCallback(async () => {
    if (!deleteItem) return;
    const ok = await remove(deleteItem.id);
    if (ok) setDeleteItem(null);
  }, [deleteItem, remove]);
  const filteredBooks: string[] = !editForm.bookName ? [...BIBLE_BOOKS] : BIBLE_BOOKS.filter((b) => b.toLowerCase().includes(editForm.bookName.toLowerCase()));
  const requestDelete = useCallback((item: VerseExplanation) => {
    setDeleteItem(item);
  }, []);
  return {
    items, loading, search, setSearch, hasMore, loadingMore, saving, deleting, sentinelRef, refresh, loadMore,
    editItem, setEditItem, editForm, setEditForm, deleteItem, setDeleteItem,
    openEdit, handleSave, handleDelete, filteredBooks,
    goBack, viewItem, closeEditForm, closeDeleteDialog, requestDelete,
  };
}
