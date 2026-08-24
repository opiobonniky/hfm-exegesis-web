import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { BIBLE_BOOKS } from "@/data/staticData";
import { useAdminCrud } from "./useAdminCrud";

export interface BookPrologue {
  id: number; bookName: string; title: string; content: string;
  isPublished: boolean; createdOn: string; updatedOn: string | null;
}
const EMPTY_FORM = { bookName: "", title: "", content: "", isPublished: true };
export function useAdminBookProloguesPage() {
  const navigate = useNavigate();
  const { items, loading, search, setSearch, hasMore, saving, deleting, refresh, loadMore, save, remove } =
    useAdminCrud<BookPrologue>({
      route: "book-prologues", listAction: "admin/get-all",
      saveAction: "admin/upsert", deleteAction: "admin/delete",
    });
  const [editItem, setEditItem] = useState<BookPrologue | null>(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [deleteItem, setDeleteItem] = useState<BookPrologue | null>(null);
  const openEdit = useCallback((item?: BookPrologue) => {
    if (item) { setEditItem(item); setEditForm({ bookName: item.bookName, title: item.title, content: item.content, isPublished: item.isPublished }); }
    else { setEditItem(null); setEditForm(EMPTY_FORM); }
  }, []);
  const handleSave = useCallback(async () => {
    if (!editForm.bookName || !editForm.title || !editForm.content) return;
    const ok = await save(editForm, editItem?.id);
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
