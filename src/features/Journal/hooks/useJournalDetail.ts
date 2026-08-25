import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/components/languages/languageProvider";
import { sendPostRequest } from "@/services/api";

export function useJournalDetail() {
  const navigate = useNavigate();
  const { entryId } = useParams<{ entryId: string }>();
  const { t, isRtl } = useLanguage();
  const { toast } = useToast();
  const [entry, setEntry] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [copied, setCopied] = useState(false);
  const [studiedWordSheetOpen, setStudiedWordSheetOpen] = useState(false);
  const [selectedStudiedWord, setSelectedStudiedWord] = useState<{ strongsId: string; surfaceText: string } | null>(null);
  const fetchEntry = useCallback(async () => {
    setLoading(true);
    try {
      const res = await sendPostRequest("journal", "get-entry", { id: entryId });
      if (res?.returnCode === 200 && res.returnData) setEntry(res.returnData);
      else { toast({ title: "Entry not found", variant: "destructive" }); navigate("/journal"); }
    } catch { toast({ title: "Failed to load", variant: "destructive" }); }
    finally { setLoading(false); }
  }, [entryId, toast, navigate]);
  useEffect(() => { if (entryId) fetchEntry(); }, [entryId, fetchEntry]);
  const handleCopy = useCallback(async () => {
    if (!entry) return;
    const text = `${entry.title}\n\n${entry.content}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [entry]);
  const handleShare = useCallback(async () => {
    if (navigator.share) { try { await navigator.share({ title: entry.title, text: entry.content }); } catch {} }
    else { handleCopy(); }
  }, [entry, handleCopy]);
  const handleDelete = useCallback(async () => {
    setDeleting(true);
    try {
      const res = await sendPostRequest("journal", "delete", { id: entry.id });
      if (res?.returnCode === 200) { toast({ title: "Deleted" }); navigate("/journal"); }
      else { toast({ title: "Delete failed", variant: "destructive" }); }
    } catch { toast({ title: "Error", variant: "destructive" }); }
    finally { setDeleting(false); setShowDeleteDialog(false); }
  }, [entry, toast, navigate]);
  const openWordStudy = useCallback((strongsId: string, surfaceText: string) => {
    setSelectedStudiedWord({ strongsId, surfaceText });
    setStudiedWordSheetOpen(true);
  }, []);
  return {
    t, isRtl, navigate, entry, loading, deleting, showDeleteDialog, setShowDeleteDialog,
    copied, handleCopy, handleShare, handleDelete,
    studiedWordSheetOpen, setStudiedWordSheetOpen, selectedStudiedWord, openWordStudy,
  };
}
