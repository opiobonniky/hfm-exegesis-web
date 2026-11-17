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
    <div className="book-overview-reading-bar sticky bottom-0 z-20 shrink-0 py-2.5">
      <div className="book-overview-bar flex w-full justify-end">
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
