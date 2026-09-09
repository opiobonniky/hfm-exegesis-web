import { useCallback, useEffect, useMemo, useState } from "react";
import { Heart, Lightbulb, Pencil, Star } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/components/languages/languageProvider";
import { useAuth } from "@/contexts/AuthContext";
import { CATEGORY_META, MOOD_EMOJI_MAP, formatDate } from "../constants";
import {
  deleteJournalEntry,
  exportJournalEntry,
  getJournalEntry,
  toggleJournalFavorite,
} from "../services";
import type {
  JournalDetailEntry,
  JournalDetailPageModel,
  JournalDetailReflectionSection,
  JournalDetailSelectedWord,
} from "../types";

export function useJournalDetail(): JournalDetailPageModel {
  const navigate = useNavigate();
  const { entryId } = useParams<{ entryId: string }>();
  const { t, isRtl } = useLanguage();
  const { toast } = useToast();
  const { userInfo } = useAuth();
  const [entry, setEntry] = useState<JournalDetailEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [updatingFavorite, setUpdatingFavorite] = useState(false);
  const [studiedWordSheetOpen, setStudiedWordSheetOpen] = useState(false);
  const [selectedStudiedWord, setSelectedStudiedWord] = useState<JournalDetailSelectedWord | null>(null);

  const fetchEntry = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getJournalEntry(entryId);
      if (response?.returnCode === 200 && response.returnData) {
        setEntry(response.returnData as JournalDetailEntry);
      } else {
        toast({ title: t.journal.entryNotFound || "Entry not found", variant: "destructive" });
        navigate("/journal");
      }
    } catch {
      toast({ title: t.journal.failedToLoadEntry || "Failed to load", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [entryId, navigate, t.journal.entryNotFound, t.journal.failedToLoadEntry, toast]);

  useEffect(() => {
    if (entryId) void fetchEntry();
  }, [entryId, fetchEntry]);

  const handleCopy = useCallback(async () => {
    if (!entry) return;
    try {
      await navigator.clipboard.writeText(`${entry.title || ""}\n\n${entry.content || ""}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: t.journal.failedToCopy || "Failed to copy", variant: "destructive" });
    }
  }, [entry, t.journal.failedToCopy, toast]);

  const handleShare = useCallback(async () => {
    if (!entry) return;
    if (!navigator.share) {
      await handleCopy();
      return;
    }
    try {
      await navigator.share({ title: entry.title || undefined, text: entry.content || undefined });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast({ title: "Failed to share", variant: "destructive" });
    }
  }, [entry, handleCopy, toast]);

  const handleToggleFavorite = useCallback(async () => {
    if (!entry || updatingFavorite) return;
    setUpdatingFavorite(true);
    try {
      const response = await toggleJournalFavorite(entry.id);
      if (response?.returnCode === 200) {
        const isFavorite = !entry.isFavorite;
        setEntry((current) => current ? { ...current, isFavorite } : current);
        toast({ title: isFavorite ? t.journal.entryFavorited : t.journal.entryUnfavorited });
      } else {
        toast({ title: t.journal.failedToUpdate || "Failed to update", variant: "destructive" });
      }
    } catch {
      toast({ title: t.journal.failedToUpdate || "Failed to update", variant: "destructive" });
    } finally {
      setUpdatingFavorite(false);
    }
  }, [entry, t.journal.entryFavorited, t.journal.entryUnfavorited, t.journal.failedToUpdate, toast, updatingFavorite]);

  const handleDelete = useCallback(async () => {
    if (!entry) return;
    setDeleting(true);
    try {
      const response = await deleteJournalEntry(entry.id);
      if (response?.returnCode === 200) {
        toast({ title: t.journal.entryDeleted || "Deleted" });
        navigate("/journal");
      } else {
        toast({ title: t.journal.failedToDelete || "Delete failed", variant: "destructive" });
      }
    } catch {
      toast({ title: t.journal.failedToDelete || "Delete failed", variant: "destructive" });
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  }, [entry, navigate, t.journal.entryDeleted, t.journal.failedToDelete, toast]);

  const handleExportPdf = useCallback(async () => {
    if (!entry) return;
    setExporting(true);
    try {
      const response = await exportJournalEntry(entry.id);
      if (response?.returnCode !== 200 || !response.returnData) {
        toast({ title: "Export failed", variant: "destructive" });
        return;
      }
      const { content, filename, mimeType } = response.returnData as { content: string; filename?: string; mimeType?: string };
      const bytes = Uint8Array.from(atob(content), (character) => character.charCodeAt(0));
      const url = URL.createObjectURL(new Blob([bytes], { type: mimeType || "application/pdf" }));
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename || `journal-entry-${entry.id}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      toast({ title: "PDF downloaded" });
    } catch {
      toast({ title: "Export failed", variant: "destructive" });
    } finally {
      setExporting(false);
    }
  }, [entry, toast]);

  const goBack = useCallback(() => navigate("/journal"), [navigate]);
  const handleEdit = useCallback(() => {
    if (entry) navigate(`/journal/entry/${entry.id}`);
  }, [entry, navigate]);
  const openDeleteDialog = useCallback(() => setShowDeleteDialog(true), []);
  const closeDeleteDialog = useCallback(() => setShowDeleteDialog(false), []);
  const handleDeleteDialogChange = useCallback((open: boolean) => setShowDeleteDialog(open), []);
  const handleStudiedWordSheetChange = useCallback((open: boolean) => setStudiedWordSheetOpen(open), []);
  const openWordStudy = useCallback((strongsId: string, surfaceText: string) => {
    setSelectedStudiedWord({ strongsId, surfaceText });
    setStudiedWordSheetOpen(true);
  }, []);
  const formatDateShort = useCallback(
    (date: string) => new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    [],
  );

  const catMeta = CATEGORY_META[entry?.category || "general"] || CATEGORY_META.general;
  const moodInfo = entry?.mood ? MOOD_EMOJI_MAP[entry.mood] || null : null;
  const tagsArray = useMemo(
    () => entry?.tags?.split(",").map((tag) => tag.trim()).filter(Boolean) || [],
    [entry?.tags],
  );
  const reflectionSections = useMemo<JournalDetailReflectionSection[]>(() => {
    if (!entry) return [];
    return [
      { key: "learnings", icon: Lightbulb, label: t.journal.whatILearned || "What I Learned", subtitle: t.journal.learnSubtitle || "Insights & revelations", content: entry.learnings || "", iconColor: "text-amber-500" },
      { key: "application", icon: Pencil, label: t.journal.howIllApply || "How I'll Apply", subtitle: t.journal.applySubtitle || "Practical steps", content: entry.application || "", iconColor: "text-blue-500" },
      { key: "gratitude", icon: Heart, label: t.journal.gratitude || "Gratitude", subtitle: t.journal.gratitudeSubtitle || "Counting blessings", content: entry.gratitude || "", iconColor: "text-rose-500" },
      { key: "prayers", icon: Star, label: t.journal.prayers || "Prayers", subtitle: t.journal.prayerSubtitle || "Conversations with the Father", content: entry.prayers || "", iconColor: "text-violet-500" },
    ].filter((section) => Boolean(section.content));
  }, [entry, t.journal]);
  const isOwner = Boolean(userInfo?.id && entry && String(userInfo.id) === String(entry.userId));

  return {
    data: {
      t, isRtl, entry, loading, deleting, showDeleteDialog, copied, exporting,
      updatingFavorite, studiedWordSheetOpen, selectedStudiedWord, isOwner,
      catMeta, moodInfo, tagsArray, reflectionSections,
    },
    actions: {
      goBack, handleEdit, handleShare, handleCopy, handleDelete,
      handleExportPdf, handleToggleFavorite, openDeleteDialog, closeDeleteDialog,
      handleDeleteDialogChange, handleStudiedWordSheetChange, openWordStudy,
      formatDate, formatDateShort,
    },
  };
}
