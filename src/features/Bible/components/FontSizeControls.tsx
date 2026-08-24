// Font size controls — A− / A+ buttons with current size display
import { cn } from "@/lib/utils";

interface FontSizeControlsProps {
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}
export default function FontSizeControls({
  fontSize, onFontSizeChange, min = 12, max = 40, step = 2, className,
}: FontSizeControlsProps) {
  return (
    <div className={cn("flex items-center gap-1 bg-muted/50 rounded-lg px-1.5 py-0.5", className)}>
      <button
        type="button"
        onClick={() => onFontSizeChange(Math.max(min, fontSize - step))}
        disabled={fontSize <= min}
        aria-label="Decrease font size"
        className="h-9 min-w-9 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"
      >
        A−
      </button>
      <span aria-live="polite" className="text-[10px] font-mono text-muted-foreground w-7 text-center">{fontSize}</span>
        onClick={() => onFontSizeChange(Math.min(max, fontSize + step))}
        disabled={fontSize >= max}
        aria-label="Increase font size"
        A+
    </div>
  );
