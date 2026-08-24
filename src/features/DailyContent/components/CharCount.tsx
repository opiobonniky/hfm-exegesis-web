// CharCount — live character counter with color thresholds
import { cn } from "@/lib/utils";

interface Props { value: string; max: number }

export function CharCount({ value, max }: Props) {
  const pct = value.length / max;
  return (
    <span className={cn("text-xs tabular-nums", pct > 0.9 ? "text-destructive" : pct > 0.7 ? "text-amber-500" : "text-muted-foreground")}>
      {value.length}/{max}
    </span>
  );
}
