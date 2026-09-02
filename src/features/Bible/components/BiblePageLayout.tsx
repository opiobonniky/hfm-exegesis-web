/**
 * BiblePageLayout — root wrapper for Bible feature pages.
 */
import { ReactNode } from "react";
import { Loader2, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BIBLE_BOOKS } from "../constants";

interface BiblePageLayoutProps {
  children: ReactNode;
  isRtl?: boolean;
  className?: string;
  title?: string;
  count?: number;
  contentCount?: number;
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  filterBook?: string;
  onFilterBookChange?: (value: string) => void;
  loading?: boolean;
  onRefresh?: () => void;
  searchPlaceholder?: string;
  emptyTitle?: string;
  emptyMessage?: string;
  emptyIcon?: ReactNode;
  actions?: ReactNode;
}

export function BiblePageLayout({
  children, isRtl, className, title, count = 0, contentCount = count,
  searchQuery = "", onSearchChange, filterBook = "all", onFilterBookChange,
  loading = false, onRefresh, searchPlaceholder = "Search...",
  emptyTitle = "Nothing here yet", emptyMessage = "Items will appear here.",
  emptyIcon, actions,
}: BiblePageLayoutProps) {
  const collectionMode = title !== undefined;

  return (
    <div className={`min-h-screen bg-background ${className || ""}`} dir={isRtl ? "rtl" : "ltr"}>
      {collectionMode ? (
        <>
          <header className="sticky top-0 z-30 border-b border-border/40 bg-background/95 backdrop-blur-sm">
            <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
              <div>
                <h1 className="font-[family-name:var(--font-heading)] text-xl font-bold text-foreground">{title}</h1>
                <p className="text-xs text-muted-foreground">{count} items</p>
              </div>
              <div className="flex items-center gap-2">
                {actions}
                {onRefresh && (
                  <Button variant="ghost" size="icon" onClick={onRefresh} disabled={loading} title="Refresh">
                    <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                  </Button>
                )}
              </div>
            </div>
            {(onSearchChange || onFilterBookChange) && (
              <div className="mx-auto flex max-w-4xl gap-2 px-4 pb-4 sm:px-6">
                {onSearchChange && (
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                    <input
                      value={searchQuery}
                      onChange={(event) => onSearchChange(event.target.value)}
                      placeholder={searchPlaceholder}
                      className="h-10 w-full rounded-xl border border-border/60 bg-background pl-9 pr-3 text-sm focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                )}
                {onFilterBookChange && (
                  <select
                    value={filterBook}
                    onChange={(event) => onFilterBookChange(event.target.value)}
                    className="h-10 max-w-40 rounded-xl border border-border/60 bg-background px-3 text-xs text-foreground"
                  >
                    <option value="all">All Books</option>
                    {BIBLE_BOOKS.map((book) => (
                      <option key={book.bookName} value={book.bookName}>{book.bookName}</option>
                    ))}
                  </select>
                )}
              </div>
            )}
          </header>
          <main className="mx-auto max-w-4xl space-y-3 px-4 py-6 pb-24 sm:px-6">
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : contentCount === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                {emptyIcon}
                <h2 className="text-base font-semibold text-foreground">{emptyTitle}</h2>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">{emptyMessage}</p>
              </div>
            ) : children}
          </main>
        </>
      ) : children}
    </div>
  );
}

/**
 * BiblePageInner — content wrapper with padding and max-width.
 */
export function BiblePageInner({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={`max-w-4xl mx-auto px-4 sm:px-6 py-4 ${className || ""}`}>
      {children}
    </div>
  );
}

/**
 * BiblePageStickyHeader — sticky header wrapper.
 */
export function BiblePageStickyHeader({ children }: { children: ReactNode }) {
  return (
    <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border/40">
      {children}
    </header>
  );
}
