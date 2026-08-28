// MyActivity — highlights, notes, favorites & reading history feed
"use client";
import { Highlighter, Star, FileText, History, BookOpen, Trash2, Loader2, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useMyActivity } from "../hooks/useMyActivity";
import ActivityFeedItem from "../components/ActivityFeedItem";
import { PageHeader } from "@/components/PageHeader";

const BOOKS = ["Genesis","Exodus","Leviticus","Numbers","Deuteronomy","Joshua","Judges","Ruth","1 Samuel","2 Samuel","1 Kings","2 Kings","1 Chronicles","2 Chronicles","Ezra","Nehemiah","Esther","Job","Psalms","Proverbs","Ecclesiastes","Song of Solomon","Isaiah","Jeremiah","Lamentations","Ezekiel","Daniel","Hosea","Joel","Amos","Obadiah","Jonah","Micah","Nahum","Habakkuk","Zephaniah","Haggai","Zechariah","Malachi","Matthew","Mark","Luke","John","Acts","Romans","1 Corinthians","2 Corinthians","Galatians","Ephesians","Philippians","Colossians","1 Thessalonians","2 Thessalonians","1 Timothy","2 Timothy","Titus","Philemon","Hebrews","James","1 Peter","2 Peter","1 John","2 John","3 John","Jude","Revelation"];

const FILTERS = [
  { key: "all" as const, label: "All", icon: BookOpen },
  { key: "highlights" as const, label: "Highlights", icon: Highlighter },
  { key: "notes" as const, label: "Notes", icon: FileText },
  { key: "favorites" as const, label: "Favorites", icon: Star },
  { key: "history" as const, label: "History", icon: History },
];

export default function MyActivity() {
  const h = useMyActivity();

  return (
    <div className="min-h-full bg-background" dir={h.isRtl ? "rtl" : "ltr"}>
      <div className="border-b bg-gradient-to-br from-primary/[0.04] via-background to-accent/[0.04]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <PageHeader title={h.t.sidebar?.myActivity || "My Activity"} subtitle="Your highlights, notes, favorites & reading history" back={false} />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {/* Filter chips */}
        <div className="flex flex-wrap items-center gap-1.5 mb-5">
          {FILTERS.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => h.setActiveFilter(key)}
              className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                h.activeFilter === key ? "bg-primary text-primary-foreground shadow-sm" : "bg-secondary/50 text-secondary-foreground/70 hover:bg-secondary")}>
              <Icon className="w-3.5 h-3.5" />{label}
              <span className={cn("ml-0.5 text-[10px] px-1.5 py-0 rounded-full", h.activeFilter === key ? "bg-primary-foreground/15" : "bg-muted-foreground/10")}>{h.counts[key]}</span>
            </button>
          ))}
        </div>

        {/* Search + book filter */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6 pb-5 border-b border-border/40">
          <div className="relative flex-1 w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
            <Input placeholder="Search verses or notes..." value={h.searchQuery} onChange={(e) => h.setSearchQuery(e.target.value)} className="pl-9 h-9 text-sm rounded-xl" />
            {h.searchQuery && <button onClick={() => h.setSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/30 hover:text-muted-foreground"><X className="w-3.5 h-3.5" /></button>}
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select value={h.filterBook} onValueChange={h.setFilterBook}>
              <SelectTrigger className="w-full sm:w-[150px] h-9 text-xs rounded-xl"><SelectValue placeholder="All books" /></SelectTrigger>
              <SelectContent><SelectItem value="all">All Books</SelectItem>{BOOKS.map((b) => <SelectItem key={b} value={b} className="text-xs">{b}</SelectItem>)}</SelectContent>
            </Select>
            {h.activeFilter === "history" && h.counts.history > 0 && (
              <Button variant="ghost" size="sm" onClick={h.clearHistory} disabled={h.clearingAll} className="h-9 text-xs text-destructive rounded-xl px-3">
                {h.clearingAll ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline ml-1">Clear</span>
              </Button>
            )}
          </div>
        </div>

        {/* Feed */}
        {h.loading ? (
          <div className="space-y-3">{[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}</div>
        ) : h.feed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <BookOpen className="w-8 h-8 text-muted-foreground/30 mb-4" />
            <p className="text-sm font-medium text-foreground/50">{h.activeFilter === "all" ? "Nothing here yet" : `No ${FILTERS.find((f) => f.key === h.activeFilter)?.label.toLowerCase()} found`}</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground/50 mb-1">{h.feed.length} {h.feed.length === 1 ? "item" : "items"}</p>
            {h.feed.map((item) => (
              <ActivityFeedItem key={item.id} type={item.type} data={item.data} verseTextMap={h.verseTextMap}
                formatTimeAgo={h.formatTimeAgo}
                onNavigate={(book, ch) => h.goToReader(book, ch)}
                onDelete={() => {
                  const endpoints: Record<string, [string, string]> = {
                    highlights: ["delete-highlight", "highlightId"],
                    notes: ["delete-verse-note", "noteId"],
                    favorites: ["delete-favorite", "favoriteId"],
                    history: ["delete-read-history", "readHistoryIds"],
                  };
                  const [ep, field] = endpoints[item.type];
                  h.deleteItem(item.type, item.data.id, ep, field);
                }}
                deleting={h.deleting === item.data.id} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
