// BookOverviewStartCTA — bottom "Start Reading" / "Continue to Reader" button
import { BookOpen, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <div className="sticky bottom-0 z-20 bg-background/95 backdrop-blur-sm border-t border-border p-4">
      <Button onClick={onStart} className="w-full h-12 text-base gap-2" size="lg">
        {hasReturnUrl ? (
          <>
            <ArrowRight className="w-5 h-5" />
            Continue to Reader
          </>
        ) : (
          <>
            <BookOpen className="w-5 h-5" />
            {resumeChapter ? "Continue Reading" : "Start Reading"}
          </>
        )}
      </Button>
    </div>
  );
}
