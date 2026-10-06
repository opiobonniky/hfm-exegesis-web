import { ArrowLeft, BookOpen, ChevronDown, ChevronRight, Layers3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { BibleChapterSelectionProps } from "../types";

export default function BibleChapterSelection({
  chapters,
  currentChapter,
  isRtl,
  title,
  subtitle,
  summaryLabel,
  totalLabel,
  chapterLabel,
  selectBookLabel,
  backLabel,
  onBack,
  onSelectBook,
  onSelectChapter,
}: BibleChapterSelectionProps) {
  return (
    <section className="flex h-full min-h-0 flex-col bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <header className="shrink-0 border-b border-primary-foreground/20 bg-primary text-primary-foreground shadow-sm">
        <div className="mx-auto flex min-h-16 max-w-3xl items-center gap-3 px-3 sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            aria-label={backLabel}
            className="shrink-0 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
          >
            <ArrowLeft className={cn("h-5 w-5", isRtl && "rotate-180")} />
          </Button>
          <button
            type="button"
            onClick={onSelectBook}
            aria-label={selectBookLabel}
            className="group min-w-0 flex-1 rounded-xl px-3 py-2 text-center transition-colors hover:bg-primary-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/70"
          >
            <span className="flex items-center justify-center gap-1.5">
              <span className="truncate font-[family-name:var(--font-heading)] text-lg font-bold tracking-tight sm:text-xl">{title}</span>
              <ChevronDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
            </span>
            <span className="mt-0.5 block text-[11px] font-medium text-primary-foreground/70">{subtitle}</span>
          </button>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-foreground/10">
            <BookOpen className="h-5 w-5" />
          </span>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl px-4 py-5 pb-12 sm:px-6">
          <div className="mb-4 flex items-center gap-3 rounded-2xl border border-border/50 bg-muted/30 px-4 py-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Layers3 className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-bold text-foreground">{summaryLabel}</span>
              <span className="mt-0.5 block text-xs font-medium text-muted-foreground">{totalLabel}</span>
            </span>
          </div>

          <div className="space-y-2">
            {chapters.map((chapter) => {
              const isCurrent = chapter === currentChapter;
              const label = chapterLabel.replace("{n}", String(chapter));
              return (
                <button
                  type="button"
                  key={chapter}
                  onClick={() => onSelectChapter(chapter)}
                  aria-current={isCurrent ? "page" : undefined}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl border bg-card p-3 text-start shadow-sm transition-all hover:border-primary/45 hover:bg-muted/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isCurrent && "border-primary/60 bg-primary/[0.06] ring-1 ring-primary/20",
                  )}
                >
                  <span className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-extrabold text-primary",
                    isCurrent && "bg-primary text-primary-foreground",
                  )}>
                    {chapter}
                  </span>
                  <span className={cn("min-w-0 flex-1 text-sm font-bold text-foreground", isCurrent && "text-primary")}>{label}</span>
                  <ChevronRight className={cn("h-4 w-4 text-muted-foreground", isRtl && "rotate-180")} />
                </button>
              );
            })}
          </div>
        </div>
      </main>
    </section>
  );
}
