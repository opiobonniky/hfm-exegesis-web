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
  const [exporting, setExporting] = useState(false);
  const [studiedWordSheetOpen, setStudiedWordSheetOpen] = useState(false);
  const [selectedStudiedWord, setSelectedStudiedWord] = useState<{ strongsId: string; surfaceText: string } | null>(null);
  const fetchEntry = useCallback(async () => {
    setLoading(true);
    try {
      const res = await sendPostRequest("journal", "get", { id: entryId });
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
  const handleExportPdf = useCallback(async () => {
    if (!entry) return;
    setExporting(true);
    try {
      const res = await sendPostRequest("journal", "export-one", { id: entry.id, format: "pdf" });
      if (res?.returnCode === 200 && res.returnData) {
        const { content, filename, mimeType } = res.returnData;
        const byteCharacters = atob(content);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mimeType || "application/pdf" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename || `journal-entry-${entry.id}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast({ title: "PDF downloaded" });
      } else {
        toast({ title: "Export failed", variant: "destructive" });
      }
    } catch {
      toast({ title: "Export failed", variant: "destructive" });
    } finally {
      setExporting(false);
    }
  }, [entry, toast]);

  const openWordStudy = useCallback((strongsId: string, surfaceText: string) => {
    setSelectedStudiedWord({ strongsId, surfaceText });
    setStudiedWordSheetOpen(true);
  }, []);
  return {
    t, isRtl, navigate, entry, loading, deleting, showDeleteDialog, setShowDeleteDialog,
    copied, handleCopy, handleShare, handleDelete,
    exporting, handleExportPdf,
    studiedWordSheetOpen, setStudiedWordSheetOpen, selectedStudiedWord, openWordStudy,
  };
}
