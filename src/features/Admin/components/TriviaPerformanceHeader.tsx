// TriviaPerformanceHeader — sticky header for trivia performance page
import { ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TriviaPerformanceHeaderProps {
  onBack: () => void;
  onRefresh: () => void;
}

export function TriviaPerformanceHeader({
  onBack,
  onRefresh,
}: TriviaPerformanceHeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="flex items-center gap-3 px-4 sm:px-6 py-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold">Trivia Performance</h1>
          <p className="text-xs text-muted-foreground">Analytics and statistics</p>
        </div>
        <Button variant="outline" size="sm" onClick={onRefresh} className="gap-1.5">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </Button>
      </div>
    </header>
  );
}
