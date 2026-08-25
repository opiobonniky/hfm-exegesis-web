import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { BIBLE_BOOKS } from "@/data/staticData";
import { useAdminCrud } from "./useAdminCrud";

interface VerseExplanation {
  id: number; bookName: string; chapter: number; verseNumber: number;
  explanation: string; learnMore: string | null; isPublished: boolean;
  createdOn: string; updatedOn: string | null;
}
const EMPTY_FORM = { bookName: "", chapter: "", verseNumber: "", explanation: "", learnMore: "", isPublished: true };
export function useAdminVerseExplanationsPage() {
  const navigate = useNavigate();
  const { items, loading, search, setSearch, hasMore, saving, deleting, refresh, loadMore, save, remove } =
    useAdminCrud<VerseExplanation>({
      route: "bible", listAction: "get-all-verses-explanation",
      saveAction: "add-verse-explanation", deleteAction: "delete-verse-explanation",
    });
  const [editItem, setEditItem] = useState<VerseExplanation | null>(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [deleteItem, setDeleteItem] = useState<VerseExplanation | null>(null);
  const openEdit = useCallback((item?: VerseExplanation) => {
    if (item) { setEditItem(item); setEditForm({ bookName: item.bookName, chapter: String(item.chapter), verseNumber: String(item.verseNumber), explanation: item.explanation, learnMore: item.learnMore || "", isPublished: item.isPublished }); }
    else { setEditItem(null); setEditForm(EMPTY_FORM); }
  }, []);
  const handleSave = useCallback(async () => {
    if (!editForm.bookName || !editForm.chapter || !editForm.verseNumber || !editForm.explanation) return;
    const ok = await save({ bookName: editForm.bookName, chapter: parseInt(editForm.chapter), verseNumber: parseInt(editForm.verseNumber), explanation: editForm.explanation, learnMore: editForm.learnMore || null }, editItem?.id);
    if (ok) { setEditItem(null); setEditForm(EMPTY_FORM); }
  }, [editForm, editItem, save]);
  const handleDelete = useCallback(async () => {
    if (!deleteItem) return;
    const ok = await remove(deleteItem.id);
    if (ok) setDeleteItem(null);
  }, [deleteItem, remove]);
  const filteredBooks = !editForm.bookName ? BIBLE_BOOKS : BIBLE_BOOKS.filter((b) => b.toLowerCase().includes(editForm.bookName.toLowerCase()));
  return {
    items, loading, search, setSearch, hasMore, saving, deleting, refresh, loadMore,
    editItem, editForm, setEditForm, deleteItem, setDeleteItem,
    openEdit, handleSave, handleDelete, filteredBooks, navigate,
  };
}
