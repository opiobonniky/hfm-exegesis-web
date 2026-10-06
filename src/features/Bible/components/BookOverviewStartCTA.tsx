// BookOverviewStartCTA — compact bottom reading action
import { BookOpen, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { tt } from '@/components/languages/hardcodedTranslate';

interface BookOverviewStartCTAProps {
  onStart: () => void;
  resumeChapter: number | null;
  hasReturnUrl?: boolean;
}

export default function BookOverviewStartCTA({
  onStart,
  resumeChapter,
  hasReturnUrl = false,
}: BookOverviewStartCTAProps) {
  return (
    <div className="sticky bottom-0 z-20 border-t border-border/70 bg-background/90 px-4 py-2.5 backdrop-blur-md sm:px-6">
      <div className="mx-auto flex w-full max-w-3xl justify-end">
        <Button
          onClick={onStart}
          size="sm"
          className="h-10 gap-2 rounded-full px-4 text-sm font-semibold shadow-sm"
        >
          {hasReturnUrl ? (
            <>
              {tt("Continue to Reader")}
              <ArrowRight className="size-4" aria-hidden="true" />
            </>
          ) : (
            <>
              <BookOpen className="size-4" aria-hidden="true" />
              <span>{resumeChapter ? tt("Continue Reading") : tt("Start Reading")}</span>
              {resumeChapter && (
                <span className="border-s border-primary-foreground/25 ps-2 text-xs font-medium text-primary-foreground/75">
                  {tt("Chapter")} {resumeChapter}
                </span>
              )}
              <ArrowRight className="size-4" aria-hidden="true" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
