import { ArrowLeft } from "lucide-react";
import TierBadge from "@/components/TierBadge";
import { STAGE_ICONS, STAGE_LABELS } from "../constants";

interface Props {
  stage: string;
  onBack: () => void;
}

export default function LabFlowHeader({ stage, onBack }: Props) {
  const stageTitle = stage === "passage" ? "Select Passage"
    : stage === "completed" ? "Complete"
    : STAGE_LABELS[stage] || stage;

  return (
    <header className="flex-shrink-0 border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 sm:px-6 h-14">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="relative w-8 h-8 rounded-xl bg-muted/30 flex items-center justify-center hover:bg-muted/50 active:scale-[0.93] transition-all">
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-semibold tracking-wide text-foreground leading-none" style={{ fontFamily: "'Cinzel', serif" }}>Exegesis Lab</h1>
            <p className="text-[10px] text-muted-foreground/60 tracking-widest uppercase leading-none mt-0.5">{stageTitle}</p>
          </div>
        </div>
        <TierBadge />
      </div>
    </header>
  );
}
