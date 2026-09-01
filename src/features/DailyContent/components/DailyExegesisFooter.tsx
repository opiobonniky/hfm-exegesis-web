/**
 * DailyExegesisFooter — branded footer for DailyExegesis page.
 */
import { Sparkles } from "lucide-react";

export function DailyExegesisFooter() {
  return (
    <footer className="flex items-center justify-center gap-2 py-4 border-t border-border/30 text-xs text-muted-foreground/60">
      <Sparkles className="w-3 h-3 text-muted-foreground/40" />
      <span>Lordsbook Daily Exegesis</span>
    </footer>
  );
}
