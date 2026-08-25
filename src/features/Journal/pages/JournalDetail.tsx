import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Star, BookOpen, Tag, Heart, Lightbulb, Pencil, Trash2, Share2, Copy, CheckCircle2, FileDown, MoreHorizontal, Globe, Lock, ExternalLink, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { routes } from "@/components/Routes/routes";
import { useJournalDetail } from "../hooks/useJournalDetail";
import { formatDate, formatDate as formatDateFull } from "../constants";
import { ReflectionSection } from "../components/ReflectionSection";
import { WordDetailSheet } from "@/components/WordDetailSheet";
import JournalDetailLoadingSkeleton from "../components/JournalDetailLoadingSkeleton";

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

const LeafDivider = () => (
  <div className="flex items-center gap-3 my-8 select-none">
    <span className="flex-1 h-px bg-border" />
    <span className="text-muted-foreground/50 dark:text-foreground/80 text-xs tracking-[0.3em]">✦ ✦ ✦</span>
  </div>
);

const JournalDetailPage = () => {
  const p = useJournalDetail();
  const { t, isRtl, navigate, entry, loading, deleting, showDeleteDialog, setShowDeleteDialog, copied, handleCopy, handleShare, handleDelete, studiedWordSheetOpen, setStudiedWordSheetOpen, selectedStudiedWord, openWordStudy } = p;
  const { userInfo } = useAuth();
  if (loading) return <JournalDetailLoadingSkeleton />;
  if (!entry) return null;
  const catMeta = CATEGORY_META[entry.category] || CATEGORY_META.general;
  const moodInfo = entry.mood ? MOOD_EMOJI[entry.mood] : null;
  const tagsArray = entry.tags ? entry.tags.split(",").map((t: string) => t.trim()).filter(Boolean) : [];
  const reflectionSections = [
    { key: "learnings", icon: Lightbulb, label: "What I Learned", subtitle: "Insights & revelations", content: entry.learnings, iconColor: "text-amber-500" },
    { key: "application", icon: Pencil, label: "How I'll Apply", subtitle: "Practical steps", content: entry.application, iconColor: "text-blue-500" },
    { key: "gratitude", icon: Heart, label: "Gratitude", subtitle: "Counting blessings", content: entry.gratitude, iconColor: "text-rose-500" },
    { key: "prayers", icon: Star, label: "Prayers", subtitle: "Conversations with the Father", content: entry.prayers, iconColor: "text-violet-500" },
  ].filter((s) => s.content);
  const formatDateShort = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <div className="min-h-full bg-amber-50/30 dark:bg-stone-950" dir={isRtl ? "rtl" : "ltr"}>
      {/* Top bar */}
      <div className="sticky top-0 z-20 border-b border-border/60 dark:border-stone-800/60 bg-amber-50/80 dark:bg-stone-950/80 backdrop-blur-md">
        <div className="max-w-2xl mx-auto px-4 flex items-center justify-between h-12">
          <button onClick={() => navigate(routes.journal.path)} className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />Journal
          </button>
          <div className="flex items-center gap-0.5">
            <button onClick={() => {}} className="p-1.5 rounded-lg hover:bg-stone-200/60 dark:hover:bg-stone-800/60 transition-colors"><Star className={cn("w-3.5 h-3.5", entry.isFavorite ? "text-amber-500 fill-amber-500" : "text-muted-foreground/70")} /></button>
            <button onClick={handleShare} className="p-1.5 rounded-lg hover:bg-stone-200/60 dark:hover:bg-stone-800/60 transition-colors"><Share2 className="w-3.5 h-3.5 text-muted-foreground/70" /></button>
            <button onClick={handleCopy} className="p-1.5 rounded-lg hover:bg-stone-200/60 dark:hover:bg-stone-800/60 transition-colors">
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground/70" />}
            </button>
            {userInfo?.id && String(entry.userId) === String(userInfo.id) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1.5 rounded-lg hover:bg-stone-200/60 dark:hover:bg-stone-800/60 transition-colors"><MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground/70" /></button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl border-border dark:border-stone-800">
                  <DropdownMenuItem onClick={() => navigate(`/journal/entry/${entry.id}`)} className="text-xs"><Pencil className="w-3.5 h-3.5 mr-2" />Edit</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-xs text-red-600 dark:text-red-400"><Trash2 className="w-3.5 h-3.5 mr-2" />Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-5 py-8 sm:py-12">
        <div className="flex items-center gap-3 flex-wrap mb-4">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wide uppercase">
            <span className={cn("w-2 h-2 rounded-full", catMeta.color)} />
            <span className="text-muted-foreground dark:text-muted-foreground/70">{(t.journal as any)?.[catMeta.labelKey] || catMeta.label}</span>
          </span>
          {moodInfo && <span className="text-sm leading-none">{moodInfo.emoji}</span>}
          <span className="text-[11px] text-muted-foreground/70 dark:text-muted-foreground">{formatDate(entry.createdOn)}</span>
        </div>
        {entry.title && <h1 className="text-3xl sm:text-4xl font-bold text-foreground dark:text-stone-100 leading-tight mb-2 tracking-tight" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>{entry.title}</h1>}
        {entry.bookName && <div className="flex items-center gap-1.5 mt-1 mb-6 text-xs text-muted-foreground/70 dark:text-muted-foreground"><BookOpen className="w-3 h-3" /><span className="font-medium">{entry.bookName} {entry.chapter}:{entry.verseNumber}</span></div>}
        {entry.content && <div className="mb-6"><p className="text-sm sm:text-base leading-[1.8] text-foreground/80 dark:text-muted-foreground/50 whitespace-pre-line" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>{entry.content}</p></div>}
        {reflectionSections.length > 0 && <><LeafDivider /><div className="space-y-8 mb-6">{reflectionSections.map((s) => <ReflectionSection key={s.key} {...s} />)}</div></>}
        {tagsArray.length > 0 && (
          <div className="mb-6">
            <LeafDivider />
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground dark:text-muted-foreground/70 mb-3 flex items-center gap-1.5"><Tag className="w-3 h-3" />Tags</h3>
            <div className="flex flex-wrap gap-1.5">{tagsArray.map((tag, i) => <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-medium bg-muted dark:bg-stone-800 text-muted-foreground dark:text-muted-foreground/70"># {tag}</span>)}</div>
          </div>
        )}
        <LeafDivider />
        <div className="text-center space-y-0.5 pb-8">
          <p className="text-[11px] text-muted-foreground/70 dark:text-muted-foreground">Written {formatDateShort(entry.createdOn)}</p>
          <p className="text-[11px] text-muted-foreground/50 dark:text-muted-foreground">Last edited {formatDateShort(entry.updatedOn)}</p>
        </div>
      </div>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="rounded-2xl border-border dark:border-stone-800">
          <DialogHeader><DialogTitle>Delete Entry</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground dark:text-muted-foreground/70">This cannot be undone.</p>
          {entry.title && <p className="text-sm font-medium text-foreground dark:text-stone-200">&ldquo;{entry.title}&rdquo;</p>}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} className="rounded-xl">Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting} className="rounded-xl">
              {deleting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Word Detail Sheet */}
      <WordDetailSheet open={studiedWordSheetOpen} onOpenChange={setStudiedWordSheetOpen} wordEntry={selectedStudiedWord || null} strongsId={selectedStudiedWord?.strongsId || null} />
    </div>
  );
};

export default JournalDetailPage;
