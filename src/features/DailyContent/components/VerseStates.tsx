import { ChevronLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

/** Loading skeleton for verse pages */
export function VerseLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <Skeleton className="h-8 w-48 mx-auto" />
        <Skeleton className="h-4 w-32 mx-auto" />
        <Skeleton className="h-20 w-full max-w-md mx-auto" />
      </div>
    </div>
  );
}

/** Empty state when no verse is available */
export function VerseEmptyState({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <Sparkles className="w-12 h-12 text-muted-foreground/30 mx-auto" />
        <p className="text-muted-foreground">No verse available today</p>
        <Button onClick={onBack} variant="outline">
          <ChevronLeft className="w-4 h-4 mr-1" /> Go back
        </Button>
      </div>
    </div>
  );
}

/** Loading skeleton for devotion pages */
export function DevotionLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <Skeleton className="h-8 w-48 mx-auto" />
        <Skeleton className="h-4 w-32 mx-auto" />
        <Skeleton className="h-20 w-full max-w-md mx-auto" />
      </div>
    </div>
  );
}

/** Empty state for devotion pages */
export function DevotionEmptyState({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <p className="text-muted-foreground">No devotion available today</p>
        <Button onClick={onBack} variant="outline">
          <ChevronLeft className="w-4 h-4 mr-1" /> Go back
        </Button>
      </div>
    </div>
  );
}
