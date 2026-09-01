// useJournalEntryAdminDetail — fetch a single journal entry for admin
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { sendPostRequest } from "@/services/api";

interface JournalAdminDetail {
  id: number;
  title: string;
  content: string;
  bookName?: string;
  chapter?: number;
  verseNumber?: number;
  category?: string;
  mood?: string;
  prayers?: string;
  gratitude?: string;
  learnings?: string;
  application?: string;
  isPublished: boolean;
  isFavorite?: boolean;
  userId: string;
  createdOn: string;
  updatedOn?: string;
}

export function useJournalEntryAdminDetail() {
  const { entryId } = useParams<{ entryId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [item, setItem] = useState<JournalAdminDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!entryId) return;
    setLoading(true);
    sendPostRequest("journal", "get", { id: Number(entryId) })
      .then((res) => {
        if (res?.returnCode === 200 && res.returnData) {
          setItem(res.returnData);
        } else {
          toast({ title: "Not found", variant: "destructive" });
          navigate("/admin/journal-moderation");
        }
      })
      .catch(() => {
        toast({ title: "Failed to load", variant: "destructive" });
        navigate("/admin/journal-moderation");
      })
      .finally(() => setLoading(false));
  }, [entryId, toast, navigate]);

  const handleDelete = useCallback(async () => {
    if (!item) return;
    setDeleting(true);
    try {
      const res = await sendPostRequest("journal", "delete", { id: item.id });
      if (res.returnCode === 200) {
        toast({ title: "Deleted" });
        navigate("/admin/journal-moderation");
      }
    } catch {
      toast({ title: "Failed to delete", variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  }, [item, toast, navigate]);

  const handleTogglePublication = useCallback(async () => {
    if (!item) return;
    try {
      const res = await sendPostRequest("journal", "admin/set-publication", {
        id: item.id,
        isPublished: !item.isPublished,
      });
      if (res.returnCode === 200) {
        setItem((prev) =>
          prev ? { ...prev, isPublished: !prev.isPublished } : prev,
        );
        toast({
          title: item.isPublished ? "Made private" : "Made public",
        });
      }
    } catch {
      toast({ title: "Failed to update", variant: "destructive" });
    }
  }, [item, toast]);

  return {
    item,
    loading,
    deleting,
    confirmDelete, setConfirmDelete,
    navigate,
    handleDelete,
    handleTogglePublication,
  };
}
