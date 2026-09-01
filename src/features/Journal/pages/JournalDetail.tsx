// JournalDetail — thin compositor, no logic in page
import { ArrowLeft, Loader2, Star, BookOpen, Tag, Heart, Lightbulb, Pencil, Trash2, Share2, Copy, CheckCircle2, Download, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { routes } from "@/components/Routes/routes";
import { useJournalDetail } from "../hooks/useJournalDetail";
import { CATEGORY_META, MOOD_EMOJI_MAP } from "../constants";
import { ReflectionSection } from "../components/ReflectionSection";
import { WordDetailSheet } from "@/components/WordDetailSheet";
import JournalDetailLoadingSkeleton from "../components/JournalDetailLoadingSkeleton";

const LeafDivider = () => (
  <div className="flex items-center gap-3 my-8 select-none">
    <span className="flex-1 h-px bg-border" />
    <span className="text-muted-foreground/50 dark:text-foreground/80 text-xs tracking-[0.3em]">✦ ✦ ✦</span>
  </div>
);

const JournalDetailPage = () => {
  const h = useJournalDetail();

  if (h.loading) return <JournalDetailLoadingSkeleton />;
  if (!h.entry) return null;

  const catMeta = CATEGORY_META[h.entry.category] || CATEGORY_META.general;
  const moodInfo = h.entry.mood ? MOOD_EMOJI_MAP[h.entry.mood] : null;
  const tagsArray = h.entry.tags ? h.entry.tags.split(",").map((t: string) => t.trim()).filter(Boolean) : [];
  const reflectionSections = [
    { key: "learnings", icon: Lightbulb, label: "What I Learned", subtitle: "Insights & revelations", content: h.entry.learnings, iconColor: "text-amber-500" },
    { key: "application", icon: Pencil, label: "How I'll Apply", subtitle: "Practical steps", content: h.entry.application, iconColor: "text-blue-500" },
    { key: "gratitude", icon: Heart, label: "Gratitude", subtitle: "Counting blessings", content: h.entry.gratitude, iconColor: "text-rose-500" },
    { key: "prayers", icon: Star, label: "Prayers", subtitle: "Conversations with the Father", content: h.entry.prayers, iconColor: "text-violet-500" },
  ].filter((s) => s.content);

  return (
    <div className="min-h-full bg-amber-50/30 dark:bg-stone-950" dir={h.isRtl ? "rtl" : "ltr"}>
      {/* Top bar */}
      <div className="sticky top-0 z-20 border-b border-border/60 dark:border-stone-800/60 bg-amber-50/80 dark:bg-stone-950/80 backdrop-blur-md">
        <div className="max-w-2xl mx-auto px-4 flex items-center justify-between h-12">
          <button onClick={() => h.navigate(routes.journal.path)} className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />Journal
          </button>
          <div className="flex items-center gap-0.5">
            <button onClick={() => {}} className="p-1.5 rounded-lg hover:bg-stone-200/60 dark:hover:bg-stone-800/60 transition-colors"><Star className={cn("w-3.5 h-3.5", h.entry.isFavorite ? "text-amber-500 fill-amber-500" : "text-muted-foreground/70")} /></button>
            <button onClick={h.handleShare} className="p-1.5 rounded-lg hover:bg-stone-200/60 dark:hover:bg-stone-800/60 transition-colors"><Share2 className="w-3.5 h-3.5 text-muted-foreground/70" /></button>
            <button onClick={h.handleExportPdf} disabled={h.exporting} className="p-1.5 rounded-lg hover:bg-stone-200/60 dark:hover:bg-stone-800/60 transition-colors">
              {h.exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground/70" /> : <Download className="w-3.5 h-3.5 text-muted-foreground/70" />}
            </button>
            <button onClick={h.handleCopy} className="p-1.5 rounded-lg hover:bg-stone-200/60 dark:hover:bg-stone-800/60 transition-colors">
              {h.copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground/70" />}
            </button>
            {h.isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1.5 rounded-lg hover:bg-stone-200/60 dark:hover:bg-stone-800/60 transition-colors"><MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground/70" /></button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl border-border dark:border-stone-800">
                  <DropdownMenuItem onClick={() => h.navigate(`/journal/entry/${h.entry.id}`)} className="text-xs"><Pencil className="w-3.5 h-3.5 mr-2" />Edit</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => h.setShowDeleteDialog(true)} className="text-xs text-red-600 dark:text-red-400"><Trash2 className="w-3.5 h-3.5 mr-2" />Delete</DropdownMenuItem>
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
            <span className="text-muted-foreground dark:text-muted-foreground/70">{(h.t.journal as any)?.[catMeta.labelKey] || catMeta.label}</span>
          </span>
          {moodInfo && <span className="text-sm leading-none">{moodInfo.emoji}</span>}
          <span className="text-[11px] text-muted-foreground/70 dark:text-muted-foreground">{h.formatDate(h.entry.createdOn)}</span>
        </div>
        {h.entry.title && <h1 className="text-3xl sm:text-4xl font-bold text-foreground dark:text-stone-100 leading-tight mb-2 tracking-tight" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>{h.entry.title}</h1>}
        {h.entry.bookName && <div className="flex items-center gap-1.5 mt-1 mb-6 text-xs text-muted-foreground/70 dark:text-muted-foreground"><BookOpen className="w-3 h-3" /><span className="font-medium">{h.entry.bookName} {h.entry.chapter}:{h.entry.verseNumber}</span></div>}
        {h.entry.content && <div className="mb-6"><p className="text-sm sm:text-base leading-[1.8] text-foreground/80 dark:text-muted-foreground/50 whitespace-pre-line" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>{h.entry.content}</p></div>}
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
          <p className="text-[11px] text-muted-foreground/70 dark:text-muted-foreground">Written {h.formatDateShort(h.entry.createdOn)}</p>
          <p className="text-[11px] text-muted-foreground/50 dark:text-muted-foreground">Last edited {h.formatDateShort(h.entry.updatedOn)}</p>
        </div>
      </div>

      <Dialog open={h.showDeleteDialog} onOpenChange={h.setShowDeleteDialog}>
        <DialogContent className="rounded-2xl border-border dark:border-stone-800">
          <DialogHeader><DialogTitle>Delete Entry</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground dark:text-muted-foreground/70">This cannot be undone.</p>
          {h.entry.title && <p className="text-sm font-medium text-foreground dark:text-stone-200">&ldquo;{h.entry.title}&rdquo;</p>}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => h.setShowDeleteDialog(false)} className="rounded-xl">Cancel</Button>
            <Button variant="destructive" onClick={h.handleDelete} disabled={h.deleting} className="rounded-xl">
              {h.deleting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <WordDetailSheet open={h.studiedWordSheetOpen} onOpenChange={h.setStudiedWordSheetOpen} wordEntry={h.selectedStudiedWord || null} strongsId={h.selectedStudiedWord?.strongsId || null} />
    </div>
  );
};

export default JournalDetailPage;
