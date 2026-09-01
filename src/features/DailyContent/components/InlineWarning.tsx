/**
 * InlineWarning — small warning text with icon.
 */
import { AlertCircle } from "lucide-react";

interface InlineWarningProps {
  message: string;
}

export function InlineWarning({ message }: InlineWarningProps) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-amber-600">
      <AlertCircle className="w-3.5 h-3.5" /> {message}
    </div>
  );
}
