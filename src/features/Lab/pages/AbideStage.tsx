import { BookMarked as BookMarkedIcon, BookOpen, FileText, Heart, Lock, Save, Tag, Loader2, Sparkles, PenLine, Globe, Lightbulb, Cross, BookText, Timer } from "lucide-react";
import { useLanguage } from "@/components/languages/languageProvider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CathedralArch from "@/components/CathedralArch";
import { cn } from "@/lib/utils";

interface AbideStageProps {
  reflection: string;
  prayer: string;
  appText: string;
  tags: string;
  isPublic: boolean;
  passageRef: string | null;
  saving: boolean;
  onUpdate: (updates: Record<string, any>) => void;
  onSaveAbide: () => void;
  onSaveProgress: () => void;
  stageLabel: string;
}
export default function AbideStage({
  reflection,
  prayer,
  appText,
  tags,
  isPublic,
  passageRef,
  saving,
  onUpdate,
  onSaveAbide,
  onSaveProgress,
  stageLabel,
}: AbideStageProps) {
  const { isRtl } = useLanguage();
  const fieldBaseClass = "w-full resize-none rounded-xl border border-border/40 bg-background/60 p-3 text-sm leading-6 text-foreground placeholder:text-muted-foreground/45 transition-all focus:outline-none focus:border-rose-400/50 focus:ring-2 focus:ring-rose-500/10";
  return (
    <div className="flex flex-col gap-3 pt-2">
      {/* ── HERO ── */}
      <section className="relative overflow-hidden rounded-[1.6rem] border border-rose-500/15 bg-[radial-gradient(circle_at_top_left,rgba(244,63,94,0.24),transparent_34%),linear-gradient(135deg,rgba(225,29,72,0.13),rgba(251,113,133,0.06),transparent)] shadow-sm">
        <div className="absolute -right-12 top-2 h-32 w-32 rounded-full bg-rose-400/10 blur-3xl" />
        <div className="absolute -left-10 bottom-0 h-28 w-28 rounded-full bg-pink-500/10 blur-3xl" />
        <div className="relative px-4 py-4 sm:px-5">
          <CathedralArch />
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-500 text-white shadow-lg shadow-rose-500/25 ring-1 ring-white/20">
                <Heart className="h-6 w-6" />
              </div>
              <div>
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.22em] text-rose-700 dark:text-rose-300">
                    Step 4 of 4
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                    {stageLabel}
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-muted/50 border border-border/30">
                    <Timer className="w-2.5 h-2.5 text-muted-foreground/50" />
                    <span className="text-[8px] font-semibold text-muted-foreground/60">8–12 min</span>
                </div>
                <h2 className="text-2xl font-black tracking-tight text-foreground">Abide</h2>
                <p className="mt-0.5 max-w-md text-xs leading-5 text-muted-foreground/75">
                  Turn insight into prayer, obedience, and a saved legacy entry.
                </p>
            </div>
            {passageRef && (
              <Badge
                variant="outline"
                className="hidden shrink-0 rounded-full border-rose-500/20 bg-background/60 px-3 py-1 text-[10px] font-black text-rose-700 shadow-sm backdrop-blur sm:inline-flex dark:text-rose-300"
              >
                <BookOpen className="mr-1 h-3 w-3" />
                {passageRef}
              </Badge>
            )}
          </div>
        </div>
      </section>
      <section className="rounded-[1.35rem] border border-rose-500/15 bg-gradient-to-br from-rose-500/10 via-card to-card p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 ring-1 ring-rose-500/15 dark:text-rose-300">
            <Sparkles className="h-5 w-5" />
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500/70">Final Response</p>
            <h3 className="text-base font-black tracking-tight text-foreground">Shape your study into a lived answer</h3>
            <p className="mt-1 text-xs leading-5 text-muted-foreground/70">
              Capture what you received, how you respond to God, and the next faithful step.
            </p>
      {/* ── REFLECTION ── */}
      <section>
        <div className="rounded-[1.35rem] bg-gradient-to-b from-card to-card/80 border border-border/50 shadow-sm overflow-hidden">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-rose-500/10 flex items-center justify-center ring-1 ring-rose-500/15">
                <PenLine className="w-4 h-4 text-rose-500" />
                <p className="text-sm font-black text-foreground">My Reflection</p>
                <p className="text-[10px] text-muted-foreground/60">What has God shown you?</p>
            <textarea
              value={reflection}
              onChange={(e) => onUpdate({ reflection: e.target.value })}
              placeholder="Write what God has revealed to you through this study..."
              rows={4}
              className={fieldBaseClass}
            />
      {/* ── PRAYER ── */}
                <Cross className="w-4 h-4 text-rose-500" />
                <p className="text-sm font-black text-foreground">My Prayer</p>
                <p className="text-[10px] text-muted-foreground/60">Respond to God in prayer</p>
              value={prayer}
              onChange={(e) => onUpdate({ prayer: e.target.value })}
              placeholder="Write your prayer response to what you've read..."
      {/* ── APPLICATION ── */}
                <Lightbulb className="w-4 h-4 text-rose-500" />
                <p className="text-sm font-black text-foreground">Practical Step</p>
                <p className="text-[10px] text-muted-foreground/60">What will you do?</p>
              value={appText}
              onChange={(e) => onUpdate({ appText: e.target.value })}
              placeholder="Write one concrete action you will take in response to God's Word..."
              rows={2}
      {/* ── TAGS ── */}
                <Tag className="w-4 h-4 text-rose-500" />
                <p className="text-sm font-black text-foreground">Tags</p>
                <p className="text-[10px] text-muted-foreground/60">Categorize your study</p>
            <input
              type="text"
              value={tags}
              onChange={(e) => onUpdate({ tags: e.target.value })}
              placeholder="#Faith #Grace #John #EternalLife"
              className="w-full h-10 rounded-xl border border-border/40 bg-background/60 text-foreground text-sm px-3 focus:outline-none focus:border-rose-400/50 focus:ring-2 focus:ring-rose-500/10 placeholder:text-muted-foreground/45 transition-all"
            {tags.trim() && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {tags.split(/\s+/).filter(Boolean).map((tag, i) => (
                  <Badge
                    key={i}
                    variant="outline"
                    className="text-[9px] font-semibold px-1.5 py-0 bg-rose-500/5 border-rose-500/20 text-rose-600 dark:text-rose-400"
                  >
                    {tag.startsWith("#") ? tag : `#${tag}`}
                  </Badge>
                ))}
      {/* ── PRIVACY TOGGLE ── */}
        <button
          onClick={() => onUpdate({ isPublic: !isPublic })}
          className={cn(
            "flex items-center gap-2 p-3 rounded-xl border transition-all active:scale-[0.98] [touch-action:manipulation] w-full",
            isPublic
              ? "bg-amber-500/5 border-amber-500/20"
              : "bg-card border-border/50 shadow-sm",
          )}
        >
          <div className={cn(
            "w-7 h-7 rounded-lg flex items-center justify-center",
            isPublic ? "bg-amber-500/10" : "bg-emerald-500/10",
          )}>
            {isPublic ? (
              <Globe className="w-3.5 h-3.5 text-amber-500" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-emerald-500" />
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold text-foreground">
              {isPublic ? "Public Study" : "Private Study"}
            <p className="text-[9px] text-muted-foreground/60">
              {isPublic
                ? "Anyone with the link can read this study"
                : "Only you can see this study"}
        </button>
      {/* ── ACTIONS ── */}
      <div className="flex items-center gap-2 pb-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onSaveProgress}
          disabled={saving}
          className="gap-1.5 h-9 rounded-lg border-border/60 text-[11px] font-semibold flex-1"
          <Save className="w-3 h-3" />
          {saving ? "Saving..." : "Save"}
        </Button>
        <div className="flex-1" />
          onClick={onSaveAbide}
          className="gap-1.5 h-9 text-[11px] font-bold rounded-lg shadow shadow-rose-500/20 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-700 hover:to-rose-600 dark:from-rose-500 dark:to-rose-400 text-white border-0 flex-1"
          {saving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <BookMarkedIcon className="w-3.5 h-3.5" />
          {saving ? "Saving..." : "Save Ledger"}
      </div>
      {/* ── CARRY FORWARD ── */}
      <section className="rounded-xl bg-gradient-to-r from-green-500/[0.04] to-transparent border border-green-500/20 p-3">
        <div className="flex items-start gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0 mt-0.5">
            <BookText className="w-3 h-3 text-green-500" />
            <p className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase tracking-wider mb-0.5">
              What happens next &rarr; Complete
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Once saved, your full study — observations, listening notes, research, prayer, and application — will be preserved
              in the <strong className="text-foreground">Legacy Ledger</strong>. You can review, share, or revisit it anytime.
    </div>
  );
