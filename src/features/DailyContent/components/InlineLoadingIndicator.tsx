/**
 * InlineLoadingIndicator — small loading text with spinner.
 */
import { Loader2 } from "lucide-react";

interface InlineLoadingIndicatorProps {
  text: string;
}

export function InlineLoadingIndicator({ text }: InlineLoadingIndicatorProps) {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <Loader2 className="w-3.5 h-3.5 animate-spin" /> {text}
    </div>
  );
}
