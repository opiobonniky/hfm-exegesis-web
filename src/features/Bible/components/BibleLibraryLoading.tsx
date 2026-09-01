/**
 * BibleLibraryLoading — loading state for BibleLibrary.
 */
import { Loader2 } from "lucide-react";

export function BibleLibraryLoading() {
  return (
    <div className="min-h-full flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-sm font-semibold">Loading the Bible Library</p>
      </div>
    </div>
  );
}
