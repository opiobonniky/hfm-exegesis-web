// BibleLibrary — book browser with search and chapter navigation
import { BookOpen, Loader2, Search, ScrollText, X, Scroll, Library, Bookmark } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useBibleLibrary } from "../hooks/useBibleLibrary";
import BookCard from "../components/BookCard";

export default function BibleLibrary() {
  const h = useBibleLibrary();
  if (h.loading) return (
    <div className="min-h-full flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-sm font-semibold">Loading the Bible Library</p>
      </div>
    </div>
  );
  const tabIcons = { all: Library, ot: Scroll, nt: Bookmark };
  return (
    <div className="min-h-full bg-gradient-to-b from-background via-background to-muted/20" dir={h.isRtl ? "rtl" : "ltr"}>
      {/* Header */}
      <header className="sticky top-0 z-30 bg-gradient-to-b from-background via-background/98 to-background/80 backdrop-blur-lg border-b border-border/40">
        <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-3">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-amber-500/20 flex items-center justify-center border border-indigo-500/10">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-background flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-card" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-tight" style={{ fontFamily: "'Cinzel', serif" }}>The Bible</h1>
              <p className="text-[11px] text-muted-foreground/70 tracking-wider mt-0.5">
                <span className="text-indigo-500 font-semibold">66 books</span> · <span className="text-amber-500 font-semibold">{h.stats.chapters} chapters</span>
                {h.stats.verses > 0 && <> · <span className="font-semibold">{h.stats.verses.toLocaleString()} verses</span></>}
              </p>
          </div>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 pointer-events-none" />
            <Input ref={h.searchRef} placeholder="Search books..." value={h.searchQuery} onChange={(e) => h.setSearchQuery(e.target.value)}
              className="pl-10 pr-10 h-10 text-sm bg-muted/40 border-border/40 rounded-xl" />
            {h.searchQuery && <button onClick={h.clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground"><X className="w-4 h-4" /></button>}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/60 border border-border/30">
            {h.tabs.map((tab) => {
              const Icon = tabIcons[tab.value];
              return (
                <button key={tab.value} onClick={() => h.selectCovenant(tab.value)}
                  className={cn("flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-[11px] font-bold transition-all",
                    h.covenant === tab.value ? "bg-background text-foreground shadow-sm border border-border/40" : "text-muted-foreground/70 hover:text-foreground hover:bg-muted/40")}>
                  <Icon className={cn("w-3.5 h-3.5", h.covenant === tab.value ? "text-primary" : "text-muted-foreground/50")} />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.value === "all" ? "All" : tab.value === "ot" ? "OT" : "NT"}</span>
                  <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-bold", h.covenant === tab.value ? "bg-primary/10 text-primary" : "bg-muted/50 text-muted-foreground/60")}>{tab.count}</span>
                </button>
              );
            })}
        </div>
      </header>
      {/* Book list */}
      <div className="px-4 sm:px-6 py-4 pb-24 max-w-4xl mx-auto">
        {h.filteredBooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <ScrollText className="w-10 h-10 text-muted-foreground/40 mb-4" />
            <h3 className="text-base font-bold text-foreground mb-2">{h.searchQuery ? `No books for "${h.searchQuery}"` : "No books available"}</h3>
            {h.searchQuery && <button onClick={h.clearSearch} className="mt-4 px-5 py-2.5 rounded-xl bg-primary/10 text-primary text-sm font-bold hover:bg-primary/20 transition-colors">Clear search</button>}
        ) : (
          <div className="space-y-2">
            {h.filteredBooks.map((book) => (
              <BookCard key={book.bookName} bookNumber={book.bookNumber} bookName={book.bookName} testament={book.testament}
                chaptersCount={book.chaptersCount} totalVerses={book.totalVerses}
                expanded={h.expandedBook === book.bookName} onToggle={() => h.toggleExpand(book.bookName)}
                onChapterClick={(ch) => h.goToChapter(book.bookName, ch)}
                onBookOverview={() => h.goToBookOverview(book.bookName)} isRtl={h.isRtl} />
            ))}
        )}
        {h.filteredBooks.length > 0 && (
          <div className="flex flex-col items-center gap-2 mt-10 pt-5 border-t border-border/20">
            <span className="text-[11px] text-muted-foreground/50 font-medium">{h.filteredBooks.length} of {h.books.length} books</span>
            <div className="h-0.5 w-12 rounded-full bg-gradient-to-r from-indigo-500/20 via-primary/20 to-amber-500/20" />
}
