import { ChevronLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { tt } from '@/components/languages/hardcodedTranslate';

interface Props {
  title: string; scrolled: boolean; refreshing: boolean;
  refreshLabel?: string;
  onBack: () => void; onRefresh: () => void;
}

export function DevotionStickyHeader({ title, scrolled, refreshing, onBack, onRefresh, refreshLabel = tt('Refresh devotion') }: Props) {
  return (
    <header className={`devotion-toolbar sticky top-0 z-30${scrolled ? ' devotion-toolbar-scrolled' : ''}`}>
      <div className="devotion-toolbar-inner">
        <Button variant="ghost" size="icon" onClick={onBack} aria-label={tt('Go back')}><ChevronLeft className="devotion-back-icon w-5 h-5" /></Button>
        <p className="text-sm font-medium truncate">{title}</p>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={onRefresh} disabled={refreshing} aria-label={refreshLabel}>
            <RefreshCw aria-hidden="true" className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>
    </header>
  );
}
