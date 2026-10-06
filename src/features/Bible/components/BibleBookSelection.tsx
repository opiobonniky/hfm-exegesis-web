import { ArrowLeft, BookOpen, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { BibleBookSelectionProps } from "../types";

export default function BibleBookSelection({
  books,
  tabs,
  activeTestament,
  selectedBook,
  searchQuery,
  isFiltering,
  isRtl,
  title,
  subtitle,
  searchPlaceholder,
  noResultsLabel,
  chaptersLabel,
  currentBookLabel,
  backLabel,
  onBack,
  onSearchChange,
  onClearSearch,
  onTestamentChange,
  onSelectBook,
}: BibleBookSelectionProps) {
  return (
    <section className="flex h-full min-h-0 flex-col bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <header className="shrink-0 border-b border-primary-foreground/20 bg-primary text-primary-foreground shadow-sm">
        <div className="mx-auto flex min-h-16 max-w-5xl items-center gap-3 px-3 sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            aria-label={backLabel}
            className="shrink-0 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
          >
            <ArrowLeft className={cn("h-5 w-5", isRtl && "rotate-180")} />
          </Button>
          <div className="min-w-0 flex-1 text-center">
            <h1 className="truncate font-[family-name:var(--font-heading)] text-lg font-bold tracking-tight sm:text-xl">{title}</h1>
            <p className="mt-0.5 text-[11px] font-medium text-primary-foreground/70">{subtitle}</p>
          </div>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-foreground/10">
            <BookOpen className="h-5 w-5" />
          </span>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-5xl shrink-0 flex-col gap-3 border-b border-border/50 px-4 py-4 sm:px-6">
        <div className="relative">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
            className="h-11 rounded-xl bg-muted/35 ps-10 pe-10"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={onClearSearch}
              aria-label={searchPlaceholder}
              className="absolute end-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {!isFiltering && (
          <div className="grid grid-cols-2 gap-1 rounded-xl border border-border/50 bg-muted/45 p-1">
            {tabs.map((tab) => (
              <button
                type="button"
                key={tab.value}
                onClick={() => onTestamentChange(tab.value)}
                className={cn(
                  "flex min-h-10 items-center justify-center gap-2 rounded-lg px-3 text-xs font-bold transition-all",
                  activeTestament === tab.value
                    ? "bg-background text-foreground shadow-sm ring-1 ring-border/50"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span>{tab.label}</span>
                <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">{tab.count}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-5xl px-4 py-5 pb-12 sm:px-6">
          {books.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-center text-muted-foreground">
              <BookOpen className="h-9 w-9 stroke-[1.5]" />
              <p className="text-sm font-medium">{noResultsLabel} &quot;{searchQuery}&quot;</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
              {books.map((book) => {
                const isCurrent = book.bookName === selectedBook;
                return (
                  <button
                    type="button"
                    key={book.bookName}
                    onClick={() => onSelectBook(book.bookName)}
                    className={cn(
                      "group relative min-h-24 rounded-2xl border bg-card px-3 py-4 text-start shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/45 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      isCurrent && "border-primary/60 bg-primary/[0.06] ring-1 ring-primary/20",
                    )}
                  >
                    <span className="block truncate font-[family-name:var(--font-heading)] text-sm font-bold text-foreground sm:text-base">{book.bookName}</span>
                    <span className={cn("mt-2 block text-[11px] font-semibold text-muted-foreground", isCurrent && "text-primary")}>
                      {isCurrent && <span className="me-1" aria-label={currentBookLabel}>●</span>}
                      {book.maxChapter} {chaptersLabel}
                    </span>
                    <span className={cn(
                      "absolute inset-y-3 start-0 w-0.5 rounded-full opacity-55 transition-opacity group-hover:opacity-100",
                      book.testament === "Old" ? "bg-indigo-500" : "bg-amber-500",
                    )} />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </section>
  );
}
