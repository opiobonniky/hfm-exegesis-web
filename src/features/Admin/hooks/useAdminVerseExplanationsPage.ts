import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { BIBLE_BOOKS } from "@/data/staticData";
import { useAdminCrud } from "./useAdminCrud";
import { VERSE_EXPLANATION_EMPTY_FORM } from "../constants";

interface VerseExplanation {
  id: number; bookName: string; chapter: number; verseNumber: number;
  explanation: string; learnMore: string | null; isPublished: boolean;
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
    if (item) { setEditItem(item); setEditForm({ bookName: item.bookName, chapter: String(item.chapter), verseNumber: String(item.verseNumber), explanation: item.explanation, learnMore: item.learnMore || "", isPublished: item.isPublished }); }
    else { setEditItem(null); setEditForm(EMPTY_FORM); }
  }, []);
  const closeEditForm = useCallback(() => { setEditItem(null); setEditForm(EMPTY_FORM); }, []);
  const closeDeleteDialog = useCallback(() => setDeleteItem(null), []);
  const goBack = useCallback(() => navigate("/admin"), [navigate]);
  const viewItem = useCallback((item: VerseExplanation) => {
    navigate(`/admin/verse-explanations/${encodeURIComponent(item.bookName)}/${item.chapter}/${item.verseNumber}`);
  }, [navigate]);
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
  const filteredBooks: string[] = !editForm.bookName ? [...BIBLE_BOOKS] : BIBLE_BOOKS.filter((b) => b.toLowerCase().includes(editForm.bookName.toLowerCase()));
  const requestDelete = useCallback((item: { id: number; bookName: string; chapter: number; verseNumber: number; explanation: string; learnMore?: string; isPublished: boolean }) => {
    setDeleteItem({ ...item, learnMore: item.learnMore ?? null, createdOn: "", updatedOn: null });
  }, []);
  return {
    items, loading, search, setSearch, hasMore, loadingMore, saving, deleting, sentinelRef, refresh, loadMore,
    editItem, setEditItem, editForm, setEditForm, deleteItem, setDeleteItem,
    openEdit, handleSave, handleDelete, filteredBooks,
    goBack, viewItem, closeEditForm, closeDeleteDialog, requestDelete,
  };
}
