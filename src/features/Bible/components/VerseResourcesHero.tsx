/**
 * VerseResourcesHero — sticky hero header for VerseResources page.
 */
import { ReactNode } from "react";
import { Library, ExternalLink, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VerseResourcesHeroProps {
  verseRef: string;
  goToReader: () => void;
  statsRow?: ReactNode;
  tabBar?: ReactNode;
  emptyMessage?: string;
}

export function VerseResourcesHero({ verseRef, goToReader, statsRow, tabBar, emptyMessage }: VerseResourcesHeroProps) {
  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/40 px-4 pb-3 pt-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Library className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-foreground truncate">Verse Resources</h1>
            <p className="text-[11px] text-muted-foreground">{verseRef}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="h-7 px-2 text-[11px] gap-1 shrink-0" onClick={goToReader}>
          <ExternalLink className="w-3 h-3" /><span className="hidden sm:inline">Reader</span>
        </Button>
      </div>
      {statsRow}
      {tabBar || (
        <div className="flex items-center gap-1.5 min-h-[36px] px-3 py-1.5 rounded-full bg-muted/50 border border-border/40">
          <Info className="w-3.5 h-3.5 text-muted-foreground" /><span className="text-[11px] font-medium text-muted-foreground">{emptyMessage || "No resources for this verse"}</span>
        </div>
      )}
    </div>
  );
}
