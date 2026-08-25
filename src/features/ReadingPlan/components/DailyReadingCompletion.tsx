import { CheckCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  isCompleted: boolean;
  canComplete: boolean;
  isSubmitting: boolean;
  dayNumber: number;
  onSubmit: () => void;
}

export function DailyCompletionButton({ isCompleted, canComplete, isSubmitting, dayNumber, onSubmit }: Props) {
  if (isCompleted) {
    return (
      <div className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-green-500/5 border border-green-200">
        <CheckCircle className="w-5 h-5 text-green-600" />
        <span className="text-sm font-semibold text-green-700">Day {dayNumber} completed!</span>
      </div>
    );
  }

  return (
    <Button
      onClick={onSubmit}
      disabled={!canComplete || isSubmitting}
      className="w-full h-12 rounded-2xl text-sm font-semibold"
    >
      {isSubmitting ? (
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Submitting...
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <Send className="w-4 h-4" />
          Complete Day {dayNumber}
        </span>
      )}
    </Button>
  );
}
