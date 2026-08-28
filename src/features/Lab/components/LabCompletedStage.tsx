import { CheckCircle2, BookOpen, ArrowRight, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Props {
  passageRef: string;
  onReset: () => void;
  journalEntryId?: string | null;
}

export default function LabCompletedStage({ passageRef, onReset, journalEntryId }: Props) {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-6 max-w-sm mx-auto px-4">
        {/* Celebration icon */}
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-500/5 flex items-center justify-center mx-auto ring-1 ring-emerald-500/10">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <div className="absolute -top-1 -right-1 text-lg">✨</div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: "'Cinzel', serif" }}>
            Study Complete!
          </h2>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            You've journeyed through <span className="font-semibold text-foreground">{passageRef}</span> with the 5-stage method.
          </p>
        </div>

        {/* Stage summary */}
        <div className="flex items-center justify-center gap-1.5">
          {["Look", "Listen", "Learn", "Abide"].map((stage, idx) => (
            <div key={stage} className="flex items-center gap-1.5">
              <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-600 font-semibold">{stage}</span>
              {idx < 3 && <span className="text-muted-foreground/30">·</span>}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 pt-2">
          {journalEntryId && (
            <button onClick={() => navigate(`/journal/${journalEntryId}`)}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-lg hover:shadow-xl hover:opacity-90 transition-all">
              <BookOpen className="w-4 h-4" />
              View in Journal
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
          <button onClick={onReset}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-border/40 text-muted-foreground text-sm font-medium hover:bg-muted/20 transition-colors">
            <RotateCcw className="w-4 h-4" />
            Start New Study
          </button>
        </div>
      </div>
    </div>
  );
}
