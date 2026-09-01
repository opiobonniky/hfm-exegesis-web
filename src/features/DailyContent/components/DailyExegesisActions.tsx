/**
 * DailyExegesisActions — action buttons (Open in Bible + Save to Journal) for exegesis page.
 */
import { BookOpen, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  canOpenBible: boolean;
  onOpenBible: () => void;
  onSaveToJournal: () => void;
}

export function DailyExegesisActions({
  canOpenBible,
  onOpenBible,
  onSaveToJournal,
}: Props) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mt-8">
      <Button
        onClick={onOpenBible}
        disabled={!canOpenBible}
        className="flex-1 gap-2 h-11"
      >
        <BookOpen className="w-4 h-4" /> Open in Bible
      </Button>
      <Button
        variant="outline"
        onClick={onSaveToJournal}
        className="flex-1 gap-2 h-11"
      >
        <PenLine className="w-4 h-4" /> Save to Journal
      </Button>
    </div>
  );
}
