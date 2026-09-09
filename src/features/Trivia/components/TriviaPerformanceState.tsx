import { RefreshCw } from "lucide-react";
import type { TriviaPerformanceStateProps } from "../types";

export default function TriviaPerformanceState({ loading, error, onRetry }: TriviaPerformanceStateProps) {
  if (loading) {
    return <div className="py-20 text-center text-sm text-muted-foreground">Loading your performance...</div>;
  }

  if (!error) return null;

  return (
    <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center">
      <p className="text-sm text-destructive">{error}</p>
      <button onClick={onRetry} className="mt-4 inline-flex items-center gap-2 rounded-xl border border-primary/25 px-4 py-2 text-sm font-semibold text-primary">
        <RefreshCw className="h-4 w-4" /> Retry
      </button>
    </div>
  );
}
