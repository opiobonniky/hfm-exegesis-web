// BookOverviewStartCTA — bottom "Start Reading" button
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BookOverviewStartCTAProps {
  onStart: () => void;
  resumeChapter: number | null;
}

export default function BookOverviewStartCTA({
  onStart,
  resumeChapter,
}: BookOverviewStartCTAProps) {
  return (
    <div className="sticky bottom-0 z-20 bg-background/95 backdrop-blur-sm border-t border-border p-4">
      <Button onClick={onStart} className="w-full h-12 text-base gap-2" size="lg">
        <BookOpen className="w-5 h-5" />
        {resumeChapter ? "Continue Reading" : "Start Reading"}
      </Button>
    </div>
  );
}
