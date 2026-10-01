import { CheckCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { tt } from '@/components/languages/hardcodedTranslate';
import { StableLoadingContent } from "@/components/ui/StableLoadingContent";

interface Props {
  isCompleted: boolean;
  canComplete: boolean;
  isSubmitting: boolean;
  dayNumber: number;
  onSubmit: () => void;
  incompleteMessage?: string;
}

export function DailyCompletionButton({ isCompleted, canComplete, isSubmitting, dayNumber, onSubmit, incompleteMessage }: Props) {
  if (isCompleted) {
    return (
      <div className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-green-500/5 border border-green-200">
        <CheckCircle className="w-5 h-5 text-green-600" />
        <span className="text-sm font-semibold text-green-700">{tt("Day")}{dayNumber}{tt("completed!")}</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={onSubmit}
        disabled={!canComplete || isSubmitting}
        className="w-full h-12 rounded-2xl text-sm font-semibold"
      >
        <StableLoadingContent
          loading={isSubmitting}
          idle={<><Send className="w-4 h-4" /><span>{tt("Complete Day")}{dayNumber}</span></>}
          pending={<><span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /><span>{tt("Submitting...")}</span></>}
        />
      </Button>
      {!canComplete && incompleteMessage && (
        <p className="text-center text-xs text-muted-foreground">{incompleteMessage}</p>
      )}
    </div>
  );
}
