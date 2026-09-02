import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { STAGE_ORDER } from "../constants";
import type { LabStage } from "../types";

interface Props {
  passageRef: string;
  stage: LabStage;
  saving: boolean;
  completed: boolean;
  onBack: () => void;
  onSave: () => void;
  onGoToStage: (stage: LabStage) => void;
}

const STAGE_META: Record<string, { label: string; icon: string }> = {
  look: { label: "Look", icon: "👁️" },
  listen: { label: "Listen", icon: "👂" },
  learn: { label: "Learn", icon: "📖" },
  abide: { label: "Abide", icon: "🙏" },
  apply: { label: "Apply", icon: "✅" },
};

export function LabFlowHeader({ passageRef, stage, saving, completed, onBack, onSave, onGoToStage }: Props) {
  const currentIdx = STAGE_ORDER.indexOf(stage as any);

  return (
    <header className="flex-shrink-0 border-b bg-background/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Top row: back, title, save */}
        <div className="flex items-center justify-between h-14">
          <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </button>
          <div className="text-center min-w-0 flex-1 mx-4">
            <h1 className="text-sm font-semibold text-foreground truncate">{passageRef || "Select Passage"}</h1>
            {!completed && stage !== "passage" && (
              <p className="text-[10px] text-muted-foreground tracking-wider uppercase">
                {STAGE_META[stage]?.icon} {STAGE_META[stage]?.label} Stage
              </p>
            )}
          </div>
          {stage !== "passage" && !completed && (
            <button onClick={onSave} disabled={saving}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-primary hover:bg-primary/5 border border-primary/20 transition-colors disabled:opacity-50">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save
            </button>
          )}
        </div>

        {/* Stage stepper */}
        {stage !== "passage" && !completed && (
          <div className="flex items-center gap-1 pb-3">
            {STAGE_ORDER.map((s, idx) => {
              const isActive = idx === currentIdx;
              const isDone = idx < currentIdx;
              return (
                <button key={s} onClick={() => idx < currentIdx && onGoToStage(s)}
                  disabled={idx > currentIdx}
                  className={cn(
                    "flex-1 h-1.5 rounded-full transition-all duration-300",
                    isActive ? "bg-primary" : isDone ? "bg-primary/40 hover:bg-primary/60 cursor-pointer" : "bg-muted-foreground/15"
                  )}
                  title={STAGE_META[s]?.label}
                />
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
}
