import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  Star,
  BookOpen,
  Calendar,
  Tag,
  Heart,
  Lightbulb,
  Pencil,
  Trash2,
  Share2,
  Copy,
  ExternalLink,
  CheckCircle2,
  MoreHorizontal,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { sendPostRequest } from "@/services/api";
import { routes } from "@/components/Routes/routes";
import { getVerseText } from "@/utilities/bibleUtils";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/languages/languageProvider";

const CATEGORIES: Record<string, { label: string; color: string }> = {
  general: { label: "General", color: "bg-gray-100 text-gray-700" },
  study: { label: "Bible Study", color: "bg-blue-100 text-blue-700" },
  prayer: { label: "Prayer", color: "bg-purple-100 text-purple-700" },
  gratitude: { label: "Gratitude", color: "bg-amber-100 text-amber-700" },
  reflection: { label: "Reflection", color: "bg-green-100 text-green-700" },
  application: { label: "Application", color: "bg-indigo-100 text-indigo-700" },
};

const MOODS: Record<string, { label: string; emoji: string }> = {
  happy: { label: "Happy", emoji: "😊" },
  grateful: { label: "Grateful", emoji: "🙏" },
  peaceful: { label: "Peaceful", emoji: "🕊️" },
  thoughtful: { label: "Thoughtful", emoji: "🤔" },
  motivated: { label: "Motivated", emoji: "💪" },
  hopeful: { label: "Hopeful", emoji: "🌟" },
  challenged: { label: "Challenged", emoji: "🧗" },
  blessed: { label: "Blessed", emoji: "✨" },
};

interface JournalEntryData {
  id: number;
  title: string | null;
  content: string;
  bookName: string | null;
  chapter: number | null;
  verseNumber: number | null;
  category: string;
  mood: string | null;
  prayers: string | null;
  gratitude: string | null;
  learnings: string | null;
  application: string | null;
  isPublished: boolean;
  isFavorite: boolean;
  tags: string | null;
  createdOn: string;
  updatedOn: string;
}

// ── Loading skeleton ────────────────────────────────────────────────────────
const LoadingSkeleton = () => (
  <div className="min-h-screen bg-background">
    <div className="bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5 border-b">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="h-10 w-32 bg-muted/50 rounded-lg animate-pulse" />
      </div>
    </div>
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="space-y-3">
        <div className="h-8 w-64 bg-muted/50 rounded-lg animate-pulse" />
        <div className="h-5 w-48 bg-muted/30 rounded-lg animate-pulse" />
      </div>
      <div className="h-40 bg-muted/30 rounded-xl animate-pulse" />
      <div className="h-32 bg-muted/20 rounded-xl animate-pulse" />
      <div className="grid grid-cols-2 gap-4">
        <div className="h-28 bg-muted/20 rounded-xl animate-pulse" />
        <div className="h-28 bg-muted/20 rounded-xl animate-pulse" />
      </div>
    </div>
  </div>
);

const JournalDetailPage = () => {
  const { entryId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, isRtl } = useLanguage();

  const [entry, setEntry] = useState<JournalEntryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [copied, setCopied] = useState(false);

  // Use useCallback for stable function reference but inline useEffect-based fetch
  useState(() => {
    if (entryId) {
      fetchEntry();
    }
  });

  const fetchEntry = async () => {
    try {
      const res = await sendPostRequest("journal", "get", { id: entryId });
      if (res.returnCode === 200 && res.returnData) {
        setEntry(res.returnData);
      } else {
        toast({ title: t.common?.error || "Error", description: t.journal?.entryNotFound || "Entry not found", variant: "destructive" });
        navigate(routes.journal.path);
      }
    } catch (error) {
      toast({ title: t.common?.error || "Error", description: t.journal?.failedToLoadEntry || "Failed to load entry", variant: "destructive" });
      navigate(routes.journal.path);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!entry) return;
    setDeleting(true);
    try {
      const res = await sendPostRequest("journal", "delete", { id: entry.id });
      if (res.returnCode === 200) {
        toast({ title: t.common?.delete || "Deleted", description: t.journal?.entryDeleted || "Journal entry deleted" });
        navigate(routes.journal.path);
      }
    } catch (error) {
      toast({ title: t.common?.error || "Error", description: t.journal?.failedToDelete || "Failed to delete", variant: "destructive" });
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!entry) return;
    try {
      const res = await sendPostRequest("journal", "toggle-favorite", { id: entry.id });
      if (res.returnCode === 200) {
        setEntry((prev) => prev ? { ...prev, isFavorite: !prev.isFavorite } : null);
        toast({
          title: entry.isFavorite
            ? (t.journal?.removedFromFavorites || "Removed from favorites")
            : (t.journal?.addedToFavorites || "Added to favorites"),
          description: entry.isFavorite
            ? (t.journal?.entryUnfavorited || "Entry unfavorited")
            : (t.journal?.entryFavorited || "Entry favorited"),
        });
      }
    } catch (error) {
      toast({ title: t.common?.error || "Error", description: t.journal?.failedToUpdate || "Failed to update", variant: "destructive" });
    }
  };

  const handleCopy = useCallback(async () => {
    if (!entry) return;
    try {
      let text = entry.title ? `${entry.title}\n\n` : "";
      text += entry.content;
      if (entry.learnings) text += `\n\n${t.journal?.whatILearned || 'What I learned'}:\n${entry.learnings}`;
      if (entry.application) text += `\n\n${t.journal?.howIllApply || "How I'll apply this"}:\n${entry.application}`;
      if (entry.gratitude) text += `\n\n${t.journal?.gratitude || 'Gratitude'}:\n${entry.gratitude}`;
      if (entry.prayers) text += `\n\n${t.journal?.prayers || 'Prayers'}:\n${entry.prayers}`;
      if (entry.bookName) text += `\n\n— ${entry.bookName} ${entry.chapter}:${entry.verseNumber}`;

      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({ title: t.common?.copy || "Copied", description: t.journal?.copiedToClipboard || "Entry copied to clipboard" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: t.common?.error || "Error", description: t.journal?.failedToCopy || "Failed to copy", variant: "destructive" });
    }
  }, [entry, toast, t]);

  const handleShare = useCallback(async () => {
    if (!entry) return;
    const shareText = entry.title
      ? `${entry.title}\n\n${entry.content}`
      : entry.content;

    if (navigator.share) {
      try {
        await navigator.share({
          title: entry.title || (t.journal?.journalEntry || "Journal Entry"),
          text: shareText,
        });
      } catch {
        // User cancelled
      }
    } else {
      await handleCopy();
    }
  }, [entry, handleCopy, t]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateShort = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ── Loading state ────────────────────────────────────────────────────────
  if (loading) return <LoadingSkeleton />;

  if (!entry) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">{t.journal?.entryNotFound || "Entry not found"}</h2>
          <p className="text-muted-foreground mb-4">{t.journal?.entryNotFoundDesc || "This journal entry may have been deleted."}</p>
          <Button onClick={() => navigate(routes.journal.path)}>
            {t.journal?.backToJournal || "Back to Journal"}
          </Button>
        </div>
      </div>
    );
  }

  const verseText = entry.bookName && entry.chapter && entry.verseNumber
    ? getVerseText(entry.bookName, entry.chapter, entry.verseNumber)
    : null;

  const tagsArray = entry.tags ? entry.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
  const moodInfo = entry.mood ? MOODS[entry.mood] : null;

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5 border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate(routes.journal.path)}>
              <ArrowLeft className={cn("w-4 h-4", isRtl ? "ml-2" : "mr-2")} />
              {t.journal?.backToJournal || "Back to Journal"}
            </Button>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={handleToggleFavorite} title={t.journal?.toggleFavorite || "Toggle favorite"}>
                {entry.isFavorite ? (
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                ) : (
                  <Star className="w-4 h-4" />
                )}
              </Button>
              <Button variant="ghost" size="icon" onClick={handleShare} title={t.common?.share || "Share"}>
                <Share2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleCopy} title={t.journal?.copyToClipboard || "Copy to clipboard"}>
                {copied ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isRtl ? "start" : "end"}>
                  <DropdownMenuItem onClick={() => navigate(`/journal/entry/${entry.id}`)}>
                    <Pencil className={cn("w-4 h-4", isRtl ? "ml-2" : "mr-2")} />
                    {t.common?.edit || "Edit"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-destructive"
                  >
                    <Trash2 className={cn("w-4 h-4", isRtl ? "ml-2" : "mr-2")} />
                    {t.common?.delete || "Delete"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {entry.title && (
              <h1 className="text-3xl font-bold mb-2 break-words">{entry.title}</h1>
            )}
            <div className="flex items-center gap-3 flex-wrap">
              <Badge className={CATEGORIES[entry.category]?.color || "bg-gray-100"}>
                {(() => {
                  const catMap: Record<string, string> = {
                    general: t.journal?.categoryGeneral || "General",
                    study: t.journal?.categoryStudy || "Bible Study",
                    prayer: t.journal?.categoryPrayer || "Prayer",
                    gratitude: t.journal?.categoryGratitude || "Gratitude",
                    reflection: t.journal?.categoryReflection || "Reflection",
                    application: t.journal?.categoryApplication || "Application",
                  };
                  return catMap[entry.category] || entry.category;
                })()}
              </Badge>
              {moodInfo && (
                <span className="inline-flex items-center gap-1 text-sm" title={moodInfo.label}>
                  <span className="text-lg">{moodInfo.emoji}</span>
                  <span className="text-muted-foreground">{moodInfo.label}</span>
                </span>
              )}
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                {formatDate(entry.createdOn)}
              </div>
            </div>
          </div>
        </div>

        {/* ── Linked scripture ────────────────────────────────────────────── */}
        {verseText && (
          <Card className="border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors">
            <CardContent className="py-4">
              <button
                className="w-full flex items-start gap-3 text-left"
                onClick={() => {
                  if (entry.bookName && entry.chapter) {
                    navigate(`/bible-reader?book=${entry.bookName}&chapter=${entry.chapter}`);
                  }
                }}
              >
                <BookOpen className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-serif text-lg leading-relaxed italic">
                    &ldquo;{verseText}&rdquo;
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <p className="text-sm text-muted-foreground">
                      — {entry.bookName} {entry.chapter}:{entry.verseNumber}
                    </p>
                    <ExternalLink className="w-3 h-3 text-muted-foreground" />
                  </div>
                </div>
              </button>
            </CardContent>
          </Card>
        )}

        {/* ── Main content ───────────────────────────────────────────────── */}
        {entry.content && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="w-5 h-5" />
                {t.journal?.journalEntry || "Journal Entry"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line text-base leading-relaxed">
                {entry.content}
              </p>
            </CardContent>
          </Card>
        )}

        {/* ── Reflection sections ─────────────────────────────────────────── */}
        {(entry.learnings || entry.application || entry.gratitude || entry.prayers) && (
          <div className="grid gap-6 md:grid-cols-2">
            {entry.learnings && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    {t.journal?.whatILearned || "What I Learned"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-line text-sm">{entry.learnings}</p>
                </CardContent>
              </Card>
            )}

            {entry.application && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Pencil className="w-4 h-4 text-indigo-500" />
                    {t.journal?.howIllApply || "How I'll Apply This"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-line text-sm">{entry.application}</p>
                </CardContent>
              </Card>
            )}

            {entry.gratitude && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-500" />
                    {t.journal?.gratitude || "Gratitude"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-line text-sm">{entry.gratitude}</p>
                </CardContent>
              </Card>
            )}

            {entry.prayers && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Star className="w-4 h-4 text-purple-500" />
                    {t.journal?.prayers || "Prayers"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-line text-sm">{entry.prayers}</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* ── Tags ────────────────────────────────────────────────────────── */}
        {tagsArray.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Tag className="w-4 h-4" />
                {t.journal?.tags || "Tags"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {tagsArray.map((tag, idx) => (
                  <Badge key={idx} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Footer metadata ─────────────────────────────────────────────── */}
        <div className="text-sm text-muted-foreground text-center pt-4 border-t">
          <p>{t.journal?.created || "Created:"} {formatDateShort(entry.createdOn)}</p>
          <p>{t.journal?.lastUpdated || "Last updated:"} {formatDateShort(entry.updatedOn)}</p>
        </div>
      </div>

      {/* ── Delete confirmation dialog ───────────────────────────────────── */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.journal?.deleteDialogTitle || "Delete Journal Entry"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p>{t.journal?.deleteDialogDesc2 || "Are you sure you want to delete this entry?"}</p>
            {entry.title && (
              <p className="text-sm text-muted-foreground">
                &ldquo;<span className="font-medium">{entry.title}</span>&rdquo;
              </p>
            )}
            <p className="text-sm text-destructive font-medium">
              {t.journal?.cannotUndo || "This action cannot be undone."}
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              {t.common?.cancel || "Cancel"}
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {deleting ? (t.journal?.deleting || "Deleting...") : (t.journal?.deleteEntry || "Delete Entry")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JournalDetailPage;
