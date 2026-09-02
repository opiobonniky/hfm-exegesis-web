import { Volume2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface VolumeControlProps {
  volume: number;
  onVolumeChange: (value: number) => void;
}

export function VolumeControl({ volume, onVolumeChange }: VolumeControlProps) {
  return (
    <section className="rounded-xl border border-border/60 bg-background/70 p-3">
      <div className="mb-3 flex items-center gap-2">
        <Volume2 className="h-4 w-4 text-primary" />
        <span className="text-xs font-semibold text-foreground">Volume</span>
        <span className="ms-auto text-[10px] font-semibold tabular-nums text-muted-foreground">
          {Math.round(volume * 100)}%
        </span>
      </div>
      <Slider
        value={[volume * 100]}
        min={0}
        max={100}
        step={5}
        aria-label="Reading volume"
        onValueChange={([value]) => onVolumeChange(value / 100)}
      />
    </section>
  );
}
