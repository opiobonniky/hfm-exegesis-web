import { BookOpen } from "lucide-react";
import { tt } from '@/components/languages/hardcodedTranslate';

export function SowerFooter() {
  return (
    <footer className="border-t border-border/50 py-8 bg-card">
      <div className="max-w-6xl mx-auto px-5 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground" style={{ fontFamily: "'Cinzel', serif" }}>{tt("EXEGESIS")}</span>
        </div>
        <p className="text-xs text-muted-foreground text-center">{tt("The Word remains free. Scripture is never locked behind a subscription.")}</p>
        <p className="text-[10px] text-muted-foreground/50">© {new Date().getFullYear()}{tt("Exegesis Project")}</p>
      </div>
    </footer>
  );
}
