// AdminTriviaHeader — header section for admin trivia page
import { Sparkles, Activity } from "lucide-react";

interface Props {
  onPerformanceClick: () => void;
}

export function AdminTriviaHeader({ onPerformanceClick }: Props) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
        <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <h1 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-heading)]">
          Trivia Management
        </h1>
        <p className="text-sm text-muted-foreground">
          Create, edit, and analyze Bible trivia questions
        </p>
      </div>
      <button
        onClick={onPerformanceClick}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors shrink-0"
      >
        <Activity className="w-3.5 h-3.5" /> Performance
      </button>
    </div>
  );
}
