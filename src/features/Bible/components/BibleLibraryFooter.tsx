/**
 * BibleLibraryFooter — footer showing book count.
 */
interface BibleLibraryFooterProps {
  filteredCount: number;
  totalCount: number;
}

export function BibleLibraryFooter({ filteredCount, totalCount }: BibleLibraryFooterProps) {
  return (
    <div className="flex flex-col items-center gap-2 mt-10 pt-5 border-t border-border/20">
      <span className="text-[11px] text-muted-foreground/50 font-medium">{filteredCount} of {totalCount} books</span>
      <div className="h-0.5 w-12 rounded-full bg-gradient-to-r from-indigo-500/20 via-primary/20 to-amber-500/20" />
    </div>
  );
}
