/**
 * VerseResourcesHero — sticky header for the Verse Resources page.
 *
 * Shows which passage is being studied plus the rail of study sections. The
 * rail lives in the sticky header so a reader can move between sections
 * without scrolling back to the top.
 */
import { ReactNode } from "react";
import { BookOpen, Library } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VerseResourcesHeroProps {
  verseRef: string;
  /** Section heading covering the verse (e.g. "The Seventh Day"), if any. */
  sectionHeading?: string | null;
  goToReader: () => void;
  /** The section rail rendered under the title. */
  rail?: ReactNode;
}

export function VerseResourcesHero({
  verseRef,
  sectionHeading,
  goToReader,
  rail,
}: VerseResourcesHeroProps) {
  return (
    <div className="sticky top-0 z-20 border-b border-border/40 bg-background/95 backdrop-blur-sm">
      <div className="mx-auto max-w-3xl px-4 pt-3 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Library className="size-4 text-primary" strokeWidth={2.2} />
            </span>
            <div className="min-w-0">
              <h1 className="font-[family-name:var(--font-heading)] text-base font-bold leading-tight text-foreground">
                Verse Resources
              </h1>
              <p className="truncate text-[11px] text-muted-foreground">
                {verseRef}
                {sectionHeading && (
                  <span className="text-muted-foreground/60"> · {sectionHeading}</span>
                )}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-7 shrink-0 gap-1.5 px-2.5 text-[11px]"
            onClick={goToReader}
          >
            <BookOpen className="size-3" />
            <span className="hidden sm:inline">Reader</span>
          </Button>
        </div>

        {rail && <div className="mt-3 pb-3">{rail}</div>}
      </div>
    </div>
  );
}
