/**
 * VerseResourcesErrorState — error or empty state for VerseResources page.
 */
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { tt } from '@/components/languages/hardcodedTranslate';

interface VerseResourcesErrorStateProps {
  error?: string;
  verseRef?: string;
  goToReader?: () => void;
}

export function VerseResourcesErrorState({ error, verseRef, goToReader }: VerseResourcesErrorStateProps) {
  return (
    <div className="p-4">
      <div className="rounded-xl bg-card border border-border p-8 text-center">
        <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm font-semibold text-foreground mb-1">{tt("No Resources Available")}</p>
        <p className="text-xs text-muted-foreground leading-relaxed">{error || tt("Could not load verse resources for this passage.")}</p>
      </div>
      {goToReader && (
        <Button variant="outline" size="sm" onClick={goToReader} className="mt-3 mx-auto block gap-1.5">
          <BookOpen className="w-3.5 h-3.5" />{tt("Open")}{verseRef}{tt("in Reader")}</Button>
      )}
    </div>
  );
}
