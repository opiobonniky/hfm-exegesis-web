import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  Star,
  BookOpen,
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
  FileDown,
  Quote,
  Globe,
  Lock,
} from "lucide-react";
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
import { useAuth } from "@/contexts/AuthContext";
import { sendPostRequest } from "@/services/api";
import { routes } from "@/components/Routes/routes";
import { getVerseText } from "@/utilities/bibleUtils";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/languages/languageProvider";
import WordDetailSheet from "@/components/WordDetailSheet";

const CATEGORY_META: Record<string, { labelKey: string; label: string; color: string }> = {
  general: { labelKey: "categoryGeneral", label: "General", color: "bg-zinc-500" },
  study: { labelKey: "categoryStudy", label: "Study", color: "bg-blue-500" },
  prayer: { labelKey: "categoryPrayer", label: "Prayer", color: "bg-violet-500" },
  gratitude: { labelKey: "categoryGratitude", label: "Gratitude", color: "bg-amber-500" },
  reflection: { labelKey: "categoryReflection", label: "Reflection", color: "bg-emerald-500" },
  application: { labelKey: "categoryApplication", label: "Application", color: "bg-indigo-500" },
};

const MOOD_EMOJI: Record<string, { label: string; emoji: string }> = {
  happy: { label: "Happy", emoji: "😊" }, grateful: { label: "Grateful", emoji: "🙏" },
  peaceful: { label: "Peaceful", emoji: "🕊️" }, thoughtful: { label: "Thoughtful", emoji: "🤔" },
  motivated: { label: "Motivated", emoji: "💪" }, hopeful: { label: "Hopeful", emoji: "🌟" },
  challenged: { label: "Challenged", emoji: "🧗" }, blessed: { label: "Blessed", emoji: "✨" },
};

interface StudiedWord { strongsId: string; surfaceText: string; lemma?: string }

interface JournalEntryData {
  id: number; userId: string; title: string | null; content: string;
  bookName: string | null; chapter: number | null; verseNumber: number | null;
  category: string; mood: string | null;
  prayers: string | null; gratitude: string | null; learnings: string | null; application: string | null;
  isPublished: boolean; isFavorite: boolean; tags: string | null;
  strongsWords?: string | null; strongsIds?: string | null;
  createdOn: string; updatedOn: string;
}

/* ── Loading ── */
const PageSkeleton = () => (
  <div className="min-h-full bg-amber-50/30 dark:bg-stone-950">
    {[1, 2, 3].map((i) => (
      <div key={i} className="max-w-2xl mx-auto px-5 py-4">            <div className="h-4 w-16 bg-muted rounded animate-pulse mb-3" />
        <div className="h-6 w-3/4 bg-muted rounded animate-pulse mb-2" />
        <div className="h-4 w-full bg-muted dark:bg-stone-800/50 rounded animate-pulse mb-1" />
        <div className="h-4 w-5/6 bg-muted dark:bg-stone-800/50 rounded animate-pulse" />
      </div>
    ))}
  </div>
);

/* ── Decorative divider ── */
const LeafDivider = () => (
  <div className="flex items-center gap-3 my-8 select-none">
    <span className="flex-1 h-px bg-border" />
    <span className="text-muted-foreground/50 dark:text-foreground/80 text-xs tracking-[0.3em]">✦ ✦ ✦</span>
    <span className="flex-1 h-px bg-border" />
  </div>
);

const JournalDetailPage = () => {
  const { entryId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userInfo } = useAuth();
  const { t, isRtl } = useLanguage();

  const [entry, setEntry] = useState<JournalEntryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [copied, setCopied] = useState(false);
  const [studiedWordSheetOpen, setStudiedWordSheetOpen] = useState(false);
  const [selectedStudiedWord, setSelectedStudiedWord] = useState<{ strongsId: string; surfaceText: string } | null>(null);

  const fetchEntry = async () => {
    try {
      const res = await sendPostRequest("journal", "get", { id: entryId });
      if (res.returnCode === 200 && res.returnData) setEntry(res.returnData);
      else { toast({ title: "Error", description: "Entry not found", variant: "destructive" }); navigate(routes.journal.path); }
    } catch { toast({ title: "Error", description: "Failed to load", variant: "destructive" }); navigate(routes.journal.path); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (entryId) fetchEntry(); }, [entryId]);

  const handleDelete = async () => {
    if (!entry) return;
    setDeleting(true);
    try {
      const res = await sendPostRequest("journal", "delete", { id: entry.id });
      if (res.returnCode === 200) { toast({ title: "Deleted" }); navigate(routes.journal.path); }
    } catch { toast({ title: "Error", variant: "destructive" }); }
    finally { setDeleting(false); setShowDeleteDialog(false); }
  };

  const handleToggleFavorite = async () => {
    if (!entry) return;
    try {
      const res = await sendPostRequest("journal", "toggle-favorite", { id: entry.id });
      if (res.returnCode === 200) {
        setEntry((p) => p ? { ...p, isFavorite: !p.isFavorite } : null);
        toast({ title: entry.isFavorite ? "Removed from favorites" : "Added to favorites" });
      }
    } catch { toast({ title: "Error", variant: "destructive" }); }
  };

  const handleTogglePublish = async () => {
    if (!entry) return;
    const next = !entry.isPublished;
    try {
      const res = await sendPostRequest("journal", "update", { id: entry.id, isPublished: next });
      if (res.returnCode === 200) {
        setEntry((p) => p ? { ...p, isPublished: next } : null);
        toast({ title: next ? "Published to Community" : "Set to Private" });
      }
    } catch { toast({ title: "Error", variant: "destructive" }); }
  };

  const handleCopy = useCallback(async () => {
    if (!entry) return;
    let text = entry.title ? `${entry.title}\n\n` : "";
    text += entry.content;
    if (entry.learnings) text += `\n\nWhat I learned:\n${entry.learnings}`;
    if (entry.application) text += `\n\nApplication:\n${entry.application}`;
    if (entry.gratitude) text += `\n\nGratitude:\n${entry.gratitude}`;
    if (entry.prayers) text += `\n\nPrayers:\n${entry.prayers}`;
    if (entry.bookName) text += `\n\n— ${entry.bookName} ${entry.chapter}:${entry.verseNumber}`;
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); toast({ title: "Copied" }); }
    catch { toast({ title: "Error", variant: "destructive" }); }
  }, [entry]);

  const handleShare = useCallback(async () => {
    if (!entry) return;
    const text = entry.title ? `${entry.title}\n\n${entry.content}` : entry.content;
    if (navigator.share) { try { await navigator.share({ title: entry.title || "Entry", text }); } catch { } }
    else await handleCopy();
  }, [entry, handleCopy]);

  const handleDownloadPDF = useCallback(async () => {
    if (!entry) return;
    try {
      toast({ title: "Generating PDF..." });
      const res = await sendPostRequest("journal", "export-one", { id: entry.id, format: "pdf" });
      if (res.returnCode === 200 && res.returnData) {
        const { content, filename } = res.returnData;
        const bytes = Uint8Array.from(atob(content), (c) => c.charCodeAt(0));
        const blob = new Blob([bytes], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url; a.download = filename || "entry.pdf";
        document.body.appendChild(a); a.click();
        setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 500);
        toast({ title: "Downloaded" });
      }
    } catch { toast({ title: "Error", variant: "destructive" }); }
  }, [entry]);

  const formatDate = (ds: string) => ds ? new Date(ds).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : "";
  const formatDateShort = (ds: string) => ds ? new Date(ds).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "";

  if (loading) return <PageSkeleton />;

  if (!entry) return (
    <div className="min-h-full bg-amber-50/30 dark:bg-stone-950 flex items-center justify-center">
      <div className="text-center px-6">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted dark:bg-stone-900 flex items-center justify-center">
          <BookOpen className="w-7 h-7 text-muted-foreground/70" />
        </div>
        <h2 className="text-lg font-semibold text-foreground dark:text-stone-200 mb-1">Journal entry not found</h2>
        <p className="text-sm text-muted-foreground dark:text-muted-foreground/70 mb-5">It may have been deleted or moved.</p>
        <Button
          onClick={() => navigate(routes.journal.path)}
          className="            rounded-xl bg-foreground/10 hover:bg-foreground/20 text-foreground"
        >
          ← Back to Journal
        </Button>
      </div>
    </div>
  );

  const verseText = entry.bookName && entry.chapter && entry.verseNumber ? getVerseText(entry.bookName, entry.chapter, entry.verseNumber) : null;
  const tagsArray = entry.tags ? entry.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
  const moodInfo = entry.mood ? MOOD_EMOJI[entry.mood] : null;
  const catMeta = CATEGORY_META[entry.category] || CATEGORY_META.general;

  const studiedWords: StudiedWord[] = (() => {
    if (!entry.strongsWords) return [];
    try { const p = typeof entry.strongsWords === 'string' ? JSON.parse(entry.strongsWords) : entry.strongsWords; if (Array.isArray(p)) return p; } catch { }
    return [];
  })();

  const reflectionSections = [
    entry.learnings && { key: "learnings", icon: Lightbulb, label: t.journal?.whatILearned || "What I Learned", subtitle: t.journal?.learnSubtitle || "Insights & revelations from this reading", content: entry.learnings, iconColor: "text-amber-600 dark:text-amber-400" },
    entry.application && { key: "application", icon: Pencil, label: t.journal?.howIllApply || "How I'll Apply", subtitle: t.journal?.applySubtitle || "Practical steps to live out this truth", content: entry.application, iconColor: "text-indigo-600 dark:text-indigo-400" },
    entry.gratitude && { key: "gratitude", icon: Heart, label: t.journal?.gratitude || "Gratitude", subtitle: t.journal?.gratitudeSubtitle || "Counting blessings and gifts", content: entry.gratitude, iconColor: "text-rose-600 dark:text-rose-400" },
    entry.prayers && { key: "prayers", icon: Star, label: t.journal?.prayers || "Prayers", subtitle: t.journal?.prayerSubtitle || "Conversations with the Father", content: entry.prayers, iconColor: "text-violet-600 dark:text-violet-400" },
  ].filter(Boolean) as { key: string; icon: any; label: string; subtitle: string; content: string; iconColor: string }[];

  return (
    <div className="min-h-full bg-amber-50/30 dark:bg-stone-950" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* ═══════ Top Navigation Bar ═══════ */}
      <div className="sticky top-0 z-20 border-b border-border/60 dark:border-stone-800/60 bg-amber-50/80 dark:bg-stone-950/80 backdrop-blur-md">
        <div className="max-w-2xl mx-auto px-4 flex items-center justify-between h-12">
          <button
            onClick={() => navigate(routes.journal.path)}
            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground dark:text-muted-foreground/70 dark:hover:text-stone-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Journal
          </button>

          <div className="flex items-center gap-0.5">
            <button onClick={handleToggleFavorite} className="p-1.5 rounded-lg hover:bg-stone-200/60 dark:hover:bg-stone-800/60 transition-colors" title="Favorite">
              <Star className={cn("w-3.5 h-3.5", entry.isFavorite ? "text-amber-500 fill-amber-500" : "text-muted-foreground/70")} />
            </button>
            <button onClick={handleShare} className="p-1.5 rounded-lg hover:bg-stone-200/60 dark:hover:bg-stone-800/60 transition-colors" title="Share">
              <Share2 className="w-3.5 h-3.5 text-muted-foreground/70" />
            </button>
            <button onClick={handleCopy} className="p-1.5 rounded-lg hover:bg-stone-200/60 dark:hover:bg-stone-800/60 transition-colors" title="Copy">
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground/70" />}
            </button>
            <button onClick={handleDownloadPDF} className="p-1.5 rounded-lg hover:bg-stone-200/60 dark:hover:bg-stone-800/60 transition-colors" title="Download PDF">
              <FileDown className="w-3.5 h-3.5 text-muted-foreground/70" />
            </button>
            {userInfo?.id && String(entry.userId) === String(userInfo.id) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1.5 rounded-lg hover:bg-stone-200/60 dark:hover:bg-stone-800/60 transition-colors">
                    <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground/70" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl border-border dark:border-stone-800">
                  <DropdownMenuItem onClick={() => navigate(`/journal/entry/${entry.id}`)} className="text-xs">
                    <Pencil className="w-3.5 h-3.5 mr-2" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-xs text-red-600 dark:text-red-400">
                    <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>

      {/* ═══════ Content ═══════ */}
      <div className="max-w-2xl mx-auto px-5 py-8 sm:py-12">

        {/* ── Category + Mood + Date ── */}
        <div className="flex items-center gap-3 flex-wrap mb-4">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wide uppercase">
            <span className={cn("w-2 h-2 rounded-full", catMeta.color)} />
            <span className="text-muted-foreground dark:text-muted-foreground/70">
              {(t.journal as any)?.[catMeta.labelKey] || catMeta.label}
            </span>
          </span>
          {moodInfo && (
            <span className="text-sm leading-none">{moodInfo.emoji}</span>
          )}
          <span className="text-[11px] text-muted-foreground/70 dark:text-muted-foreground">
            {formatDate(entry.createdOn)}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); handleTogglePublish(); }}
            className={cn(
              "inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border transition-colors",
              entry.isPublished
                ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-950/50"
                : "bg-stone-100 dark:bg-stone-800/50 text-stone-500 dark:text-stone-400 border-stone-200 dark:border-stone-700 hover:bg-stone-200 dark:hover:bg-stone-800"
            )}
          >
            {entry.isPublished ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
            {entry.isPublished ? "Published" : "Private"}
          </button>
        </div>

        {/* ── Title ── */}
        {entry.title && (
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground dark:text-stone-100 leading-tight mb-2 tracking-tight" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
            {entry.title}
          </h1>
        )}

        {/* ── Chapter ref inline ── */}
        {entry.bookName && (
          <div className="flex items-center gap-1.5 mt-1 mb-6 text-xs text-muted-foreground/70 dark:text-muted-foreground">
            <BookOpen className="w-3 h-3" />
            <span className="font-medium">{entry.bookName} {entry.chapter}:{entry.verseNumber}</span>
          </div>
        )}

        {/* ── Scripture Quote ── */}
        {verseText && (
          <div
            onClick={() => { if (entry.bookName && entry.chapter) navigate(`/bible-reader?book=${entry.bookName}&chapter=${entry.chapter}`); }}
            className="group relative mb-10 p-5 sm:p-6 rounded-2xl bg-card dark:bg-stone-900/80 border border-border dark:border-stone-800 shadow-sm hover:shadow-md cursor-pointer transition-all active:scale-[0.99]"
            style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
          >
            <Quote className="absolute top-3 left-3 w-5 h-5 text-muted-foreground/20 group-hover:text-muted-foreground/50 transition-colors" />
            <p className="text-base sm:text-lg leading-relaxed italic text-foreground/80 dark:text-muted-foreground/50 pl-2">
              &ldquo;{verseText}&rdquo;
            </p>
            <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground/70 dark:text-muted-foreground group-hover:text-muted-foreground dark:group-hover:text-muted-foreground/70 transition-colors">
              <span>&mdash; {entry.bookName} {entry.chapter}:{entry.verseNumber}</span>
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </div>
          </div>
        )}

        {/* ── Main content ── */}
        {entry.content && (
          <div className="mb-6">
            <p className="text-sm sm:text-base leading-[1.8] text-foreground/80 dark:text-muted-foreground/50 whitespace-pre-line" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
              {entry.content}
            </p>
          </div>
        )}

        {/* ── Reflection sections (paragraph style with prominent headings) ── */}
        {reflectionSections.length > 0 && (
          <>
            <LeafDivider />
            <div className="space-y-8 mb-6">
              {reflectionSections.map(({ key, icon: Icon, label, subtitle, content, iconColor }) => (
                <div key={key} className="rounded-2xl bg-card/70 dark:bg-stone-900/50 border border-border/70 dark:border-stone-800/70 p-6 hover:bg-card dark:hover:bg-stone-900/80 transition-colors shadow-sm">
                  {/* Section heading row */}
                  <div className="flex items-start gap-4 mb-4 pb-4 border-b border-border/50 dark:border-stone-800/60">
                    <div className="w-10 h-10 rounded-xl bg-muted dark:bg-stone-800 flex items-center justify-center shrink-0 ring-1 ring-stone-200/50 dark:ring-stone-700/50">
                      <Icon className={cn("w-5 h-5", iconColor)} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-foreground dark:text-stone-200 leading-tight">
                        {label}
                      </h3>
                      {subtitle && (
                        <p className="text-[11px] text-muted-foreground/70 dark:text-muted-foreground mt-0.5">
                          {subtitle}
                        </p>
                      )}
                    </div>
                  </div>
                  {/* Content as flowing paragraphs */}
                  <div className="text-sm sm:text-base leading-[1.9] text-foreground/80 dark:text-muted-foreground/50" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
                    {content.split('\n').filter(Boolean).map((paragraph, i) => (
                      <p key={i} className={i > 0 ? 'mt-4' : ''}>
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── Studied Words ── */}
        {studiedWords.length > 0 && (
          <div className="mb-6">
            <LeafDivider />
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground dark:text-muted-foreground/70 mb-3 flex items-center gap-1.5">
              <BookOpen className="w-3 h-3" />
              Studied Words
            </h3>
            <div className="flex flex-wrap gap-2">
              {studiedWords.map((w, idx) => (
                <button
                  key={idx}
                  onClick={() => { setSelectedStudiedWord({ strongsId: w.strongsId, surfaceText: w.surfaceText }); setStudiedWordSheetOpen(true); }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border dark:border-stone-800 bg-card dark:bg-stone-900 text-xs font-medium text-muted-foreground dark:text-muted-foreground/70 hover:border-amber-300 dark:hover:border-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/20 hover:text-amber-700 dark:hover:text-amber-300 transition-all active:scale-[0.97]"
                >
                  <BookOpen className="w-3 h-3 shrink-0" />
                  <span>{w.surfaceText || w.strongsId}</span>
                  <span className="text-[10px] font-mono text-muted-foreground/70/60">{w.strongsId}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Tags ── */}
        {tagsArray.length > 0 && (
          <div className="mb-6">
            <LeafDivider />
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground dark:text-muted-foreground/70 mb-3 flex items-center gap-1.5">
              <Tag className="w-3 h-3" />
              Tags
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {tagsArray.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-medium bg-muted dark:bg-stone-800 text-muted-foreground dark:text-muted-foreground/70"
                >
                  # {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        <LeafDivider />
        <div className="text-center space-y-0.5 pb-8">
          <p className="text-[11px] text-muted-foreground/70 dark:text-muted-foreground">
            Written {formatDateShort(entry.createdOn)}
          </p>
          <p className="text-[11px] text-muted-foreground/50 dark:text-muted-foreground">
            Last edited {formatDateShort(entry.updatedOn)}
          </p>
        </div>
      </div>

      <WordDetailSheet
        open={studiedWordSheetOpen}
        onOpenChange={setStudiedWordSheetOpen}
        strongsId={selectedStudiedWord?.strongsId}
        surfaceText={selectedStudiedWord?.surfaceText}
        verseRef={entry.bookName ? `${entry.bookName} ${entry.chapter}:${entry.verseNumber}` : undefined}
        verseText={verseText || undefined}
      />

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="rounded-2xl border-border dark:border-stone-800">
          <DialogHeader><DialogTitle>Delete Entry</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground dark:text-muted-foreground/70">This cannot be undone.</p>
          {entry.title && <p className="text-sm font-medium text-foreground dark:text-stone-200">&ldquo;{entry.title}&rdquo;</p>}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} className="rounded-xl">Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting} className="rounded-xl">
              {deleting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JournalDetailPage;
