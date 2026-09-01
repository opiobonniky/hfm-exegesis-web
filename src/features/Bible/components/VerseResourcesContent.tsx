/**
 * VerseResourcesContent — content wrapper for VerseResources page.
 */
import { ReactNode } from "react";
import { BookMarked, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface VerseResourcesContentProps {
  bookName?: string;
  prologueLoading?: boolean;
  prologue?: ReactNode;
  prologueEmpty?: string;
  children: ReactNode;
}

export function VerseResourcesContent({ bookName, prologueLoading, prologue, prologueEmpty, children }: VerseResourcesContentProps) {
  return (
    <div className="p-4 space-y-4">
      {bookName && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-0.5 h-4 rounded-full bg-primary/40" />
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <BookMarked className="w-3.5 h-3.5" /> Book Prologue — {bookName}
            </h3>
            {prologueLoading && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
          </div>
          {prologueLoading ? (
            <div className="rounded-xl bg-card border border-border p-4 space-y-3">
              <Skeleton className="h-4 w-24" /><Skeleton className="h-12 w-full" /><Skeleton className="h-8 w-3/4" />
            </div>
          ) : prologue || (
            <div className="rounded-xl bg-card border border-border p-6 text-center">
              <BookMarked className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">{prologueEmpty || `No book prologue available for ${bookName}.`}</p>
            </div>
          )}
        </div>
      )}
      {children}
      <div className="h-8" />
    </div>
  );
}
