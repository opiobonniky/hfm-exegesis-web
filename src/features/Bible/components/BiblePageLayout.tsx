// BiblePageLayout — shared layout for standalone Bible pages (Highlights, Notes, Favorites)
"use client";

import { Search, X, BookOpen, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/PageHeader";

const BOOKS = [
  "Genesis","Exodus","Leviticus","Numbers","Deuteronomy","Joshua","Judges","Ruth",
  "1 Samuel","2 Samuel","1 Kings","2 Kings","1 Chronicles","2 Chronicles","Ezra",
  "Nehemiah","Esther","Job","Psalms","Proverbs","Ecclesiastes","Song of Solomon",
  "Isaiah","Jeremiah","Lamentations","Ezekiel","Daniel","Hosea","Joel","Amos",
  "Obadiah","Jonah","Micah","Nahum","Habakkuk","Zephaniah","Haggai","Zechariah",
  "Malachi","Matthew","Mark","Luke","John","Acts","Romans","1 Corinthians",
  "2 Corinthians","Galatians","Ephesians","Philippians","Colossians",
  "1 Thessalonians","2 Thessalonians","1 Timothy","2 Timothy","Titus","Philemon",
  "Hebrews","James","1 Peter","2 Peter","1 John","2 John","3 John","Jude","Revelation",
];

interface BiblePageLayoutProps {
  title: string;
  subtitle?: string;
  count?: number;
  isRtl: boolean;
  searchQuery: string;
  onSearchChange: (v: string) => void;
  filterBook: string;
  onFilterBookChange: (v: string) => void;
  loading: boolean;
  onRefresh?: () => void;
  searchPlaceholder?: string;
  children: React.ReactNode;
  emptyIcon?: React.ReactNode;
  emptyTitle?: string;
  emptyMessage?: string;
  actions?: React.ReactNode;
}

export function BiblePageLayout({
  title,
  subtitle,
  count,
  isRtl,
  searchQuery,
  onSearchChange,
  filterBook,
  onFilterBookChange,
  loading,
  onRefresh,
  searchPlaceholder = "Search verses or notes...",
  children,
  emptyIcon,
  emptyTitle = "Nothing here yet",
  emptyMessage,
  actions,
}: BiblePageLayoutProps) {
  const itemCount = count ?? 0;

  return (
    <div className="min-h-full bg-background" dir={isRtl ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="border-b bg-gradient-to-br from-primary/[0.04] via-background to-accent/[0.04]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <PageHeader
            title={title}
            subtitle={subtitle || `${itemCount} ${itemCount === 1 ? "item" : "items"}`}
            back={false}
            action={actions}
          />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {/* Search + book filter */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6 pb-5 border-b border-border/40">
          <div className="relative flex-1 w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 h-9 text-sm rounded-xl"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/30 hover:text-muted-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select value={filterBook} onValueChange={onFilterBookChange}>
              <SelectTrigger className="w-full sm:w-[150px] h-9 text-xs rounded-xl">
                <SelectValue placeholder="All books" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Books</SelectItem>
                {BOOKS.map((b) => (
                  <SelectItem key={b} value={b} className="text-xs">
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {onRefresh && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefresh}
                className="h-9 w-9 p-0 rounded-xl"
              >
                <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-28 w-full rounded-2xl" />
            ))}
          </div>
        ) : itemCount === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            {emptyIcon || <BookOpen className="w-8 h-8 text-muted-foreground/30 mb-4" />}
            <p className="text-sm font-medium text-foreground/50">{emptyTitle}</p>
            {emptyMessage && (
              <p className="text-xs text-muted-foreground/40 mt-1">{emptyMessage}</p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground/50 mb-1">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </p>
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
