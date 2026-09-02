import { Repeat, Repeat1 } from "lucide-react";
import { cn } from "@/lib/utils";

interface RepeatControlProps {
  repeatMode: "none" | "one" | "all";
  onCycle: () => void;
  label: string;
}

export function RepeatControl({ repeatMode, onCycle, label }: RepeatControlProps) {
  return (
    <button
      type="button"
      onClick={onCycle}
      aria-label={label}
      aria-pressed={repeatMode !== "none"}
      className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/70 p-3 text-start transition-colors hover:border-primary/30 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          repeatMode === "none"
            ? "bg-muted text-muted-foreground"
            : "bg-primary/10 text-primary",
        )}
      >
        {repeatMode === "one" ? (
          <Repeat1 className="h-4 w-4" />
        ) : (
          <Repeat className="h-4 w-4" />
        )}
      </span>
      <span>
        <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Repeat
        </span>
        <span className="block text-xs font-bold text-foreground">
          {repeatMode === "none" ? "Off" : repeatMode === "one" ? "One" : "All"}
        </span>
      </span>
    </button>
  );
}
