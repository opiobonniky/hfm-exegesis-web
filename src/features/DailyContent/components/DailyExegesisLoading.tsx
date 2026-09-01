/**
 * DailyExegesisLoading — loading state for DailyExegesis page.
 */
import { Loader2 } from "lucide-react";

export function DailyExegesisLoading() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm font-semibold text-muted-foreground">
          Preparing today's teaching…
        </p>
      </div>
    </div>
  );
}
