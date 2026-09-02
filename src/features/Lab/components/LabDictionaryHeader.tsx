import { ArrowLeft } from "lucide-react";
import TierBadge from "@/components/TierBadge";

interface Props {
  onGoBack: () => void;
}

export function LabDictionaryHeader({ onGoBack }: Props) {
  return (
    <header className="flex-shrink-0 border-b bg-background/95 backdrop-blur-sm sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3">
        <div className="flex items-center gap-3">
          <button onClick={onGoBack} className="relative w-8 h-8 rounded-full bg-muted/30 flex items-center justify-center hover:bg-muted/50 transition-all">
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-semibold tracking-wide text-foreground leading-none" style={{ fontFamily: "'Cinzel', serif" }}>Dictionary</h1>
            <p className="text-[10px] text-muted-foreground tracking-widest uppercase leading-none mt-0.5">Original Language Word Study</p>
          </div>
        </div>
        <TierBadge />
      </div>
    </header>
  );
}
