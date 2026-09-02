import { Gauge } from "lucide-react";
import { cn } from "@/lib/utils";
import { AUDIO_SPEED_OPTIONS } from "../../constants";

interface SpeedControlProps {
  speechRate: number;
  onSpeechRateChange: (rate: number) => void;
}

export function SpeedControl({ speechRate, onSpeechRateChange }: SpeedControlProps) {
  return (
    <section className="rounded-xl border border-border/60 bg-background/70 p-3">
      <div className="mb-2.5 flex items-center gap-2">
        <Gauge className="h-4 w-4 text-primary" />
        <span className="text-xs font-semibold text-foreground">Speed</span>
        <span className="ms-auto rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
          {speechRate}×
        </span>
      </div>
      <div className="grid grid-cols-6 gap-1">
        {AUDIO_SPEED_OPTIONS.map((rate) => (
          <button
            key={rate}
            type="button"
            onClick={() => onSpeechRateChange(rate)}
            aria-label={`Set reading speed to ${rate} times`}
            aria-pressed={speechRate === rate}
            className={cn(
              "rounded-lg px-1 py-1.5 text-[10px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              speechRate === rate
                ? "bg-primary text-primary-foreground"
                : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {rate}×
          </button>
        ))}
      </div>
    </section>
  );
}
