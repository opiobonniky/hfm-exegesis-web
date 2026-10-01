import { useEffect, useState } from "react";
import { ArrowLeft, Search, BookOpen, Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingState, EmptyState } from "@/components/ui/states";
import { BIBLE_BOOKS } from "@/data/staticData";
import type { StrongsWord } from "../hooks/useStrongsDictionaryPage";
import { WordCard } from "./WordCard";
import { tt } from '@/components/languages/hardcodedTranslate';
import { StableLoadingContent } from "@/components/ui/StableLoadingContent";

interface StrongsHeaderProps {
  onBack: () => void;
}

export function StrongsHeader({ onBack }: StrongsHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-primary/[0.08] p-5 shadow-sm sm:p-8">
      <div className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary">{tt("Scripture tools / word study")}</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">{tt("Strong's Dictionary")}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">{tt("Explore Hebrew and Greek words with definitions, verse context, and explanation notes captured from the study library.")}</p>
      </div>
      <Button variant="outline" size="sm" onClick={onBack} className="relative w-fit gap-2 bg-background/70">
        <ArrowLeft className="h-4 w-4" />{tt("Back")}</Button>
      </div>
    </div>
  );
}

interface StrongsSearchTabProps {
  searchQuery: string;
  searchResults: StrongsWord[];
  searchLoading: boolean;
  searchCount: number;
  selectedWord: StrongsWord | null;
  isFavorited: (num: string) => boolean;
  onSetSearchQuery: (q: string) => void;
  onExecuteSearch: (query?: string) => void;
  onSetSelectedWord: (w: StrongsWord) => void;
  onToggleFavorite: (w: StrongsWord) => void;
  onLoadMore: () => void;
}

export function StrongsSearchTab({
  searchQuery,
  searchResults,
  searchLoading,
  searchCount,
  selectedWord,
  isFavorited,
  onSetSearchQuery,
  onExecuteSearch,
  onSetSelectedWord,
  onToggleFavorite,
  onLoadMore,
}: StrongsSearchTabProps) {
  const [draftQuery, setDraftQuery] = useState(searchQuery);

  useEffect(() => {
    setDraftQuery(searchQuery);
  }, [searchQuery]);

  const submitSearch = () => {
    const query = draftQuery.trim();
    if (!query) return;
    if (query === searchQuery.trim()) {
      onExecuteSearch(query);
      return;
    }
    onSetSearchQuery(query);
    onExecuteSearch(query);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-muted/30 p-2 shadow-inner sm:flex sm:gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder={tt("Search by word, Strong's number, or meaning...")} value={draftQuery}
            onChange={(e) => setDraftQuery(e.target.value)} className="pl-9"
            onKeyDown={(e) => e.key === "Enter" && submitSearch()} />
        </div>
        <Button onClick={submitSearch} disabled={searchLoading} className="mt-2 w-full sm:mt-0 sm:w-auto">
          <StableLoadingContent loading={searchLoading} idle={tt("Search")} pending={<Loader2 className="h-4 w-4 animate-spin" />} />
        </Button>
      </div>
      {searchResults.length > 0 && (
        <p className="text-sm font-medium text-muted-foreground">{searchCount}{tt("result")}{searchCount !== 1 ? "s" : ""}{tt("found")}</p>
      )}
      <div className="grid gap-3">
        {searchResults.map((w) => (
          <WordCard key={w.strongsNumber} word={w} isSelected={selectedWord?.strongsNumber === w.strongsNumber}
            isFavorited={isFavorited(w.strongsNumber)} onSelect={onSetSelectedWord} onToggleFavorite={onToggleFavorite} />
        ))}
      </div>
      {searchResults.length > 0 && searchResults.length < searchCount && (
        <Button variant="outline" className="w-full" onClick={onLoadMore} disabled={searchLoading}>{tt("Load More")}</Button>
      )}
      {searchResults.length === 0 && !searchLoading && searchQuery && (
        <EmptyState title={tt("No results")} message={`No words found for "${searchQuery}"`} icon={Search} />
      )}
    </div>
  );
}

interface StrongsBrowseTabProps {
  selectedBook: string;
  browseWords: StrongsWord[];
  browseLoading: boolean;
  browseCount: number;
  selectedWord: StrongsWord | null;
  isFavorited: (num: string) => boolean;
  onSetSelectedBook: (book: string) => void;
  onLoadBook: (book: string) => void;
  onSetSelectedWord: (w: StrongsWord) => void;
  onToggleFavorite: (w: StrongsWord) => void;
  onLoadMore: () => void;
}

export function StrongsBrowseTab({
  selectedBook,
  browseWords,
  browseLoading,
  browseCount,
  selectedWord,
  isFavorited,
  onSetSelectedBook,
  onLoadBook,
  onSetSelectedWord,
  onToggleFavorite,
  onLoadMore,
}: StrongsBrowseTabProps) {
  return (
    <div className="space-y-4">
      <div>
        <label>{tt("Select a Book")}</label>
        <Select
          value={selectedBook}
          onValueChange={(book) => {
            onSetSelectedBook(book);
            onLoadBook(book);
          }}
        >
          <SelectTrigger className="w-full"><SelectValue placeholder={tt("Choose a Bible book")} /></SelectTrigger>
          <SelectContent>{BIBLE_BOOKS.map((book) => (<SelectItem key={book} value={book}>{tt(book)}</SelectItem>))}</SelectContent>
        </Select>
      </div>
      {browseLoading && <LoadingState message="Loading words..." />}
      {!browseLoading && browseWords.length > 0 && (
        <>
          <p>{browseWords.length}{tt("word")}{browseWords.length !== 1 ? "s" : ""} in {selectedBook}</p>
          <div className="grid gap-3">
            {browseWords.map((w) => (
              <WordCard key={w.strongsNumber} word={w} isSelected={selectedWord?.strongsNumber === w.strongsNumber}
                isFavorited={isFavorited(w.strongsNumber)} onSelect={onSetSelectedWord} onToggleFavorite={onToggleFavorite} />
            ))}
          </div>
        </>
      )}
      {!browseLoading && selectedBook && browseWords.length === 0 && (
        <EmptyState title={tt("No words found")} message={`No Strong's entries found for ${selectedBook}`} icon={BookOpen} />
      )}
      {!browseLoading && !selectedBook && (
        <EmptyState title={tt("Select a book")} message="Choose a Bible book to browse its Strong's entries" icon={BookOpen} />
      )}
      {browseWords.length > 0 && browseWords.length < browseCount && (
        <Button variant="outline" className="w-full" onClick={onLoadMore} disabled={browseLoading}>{tt("Load More")}</Button>
      )}
    </div>
  );
}

interface StrongsFavoritesTabProps {
  favorites: StrongsWord[];
  favLoading: boolean;
  selectedWord: StrongsWord | null;
  isFavorited: (num: string) => boolean;
  onSetSelectedWord: (w: StrongsWord) => void;
  onToggleFavorite: (w: StrongsWord) => void;
}

export function StrongsFavoritesTab({
  favorites,
  favLoading,
  selectedWord,
  isFavorited,
  onSetSelectedWord,
  onToggleFavorite,
}: StrongsFavoritesTabProps) {
  if (favLoading) return <LoadingState message="Loading favorites..." />;
  if (favorites.length === 0) return <EmptyState title={tt("No favorites yet")} message="Star words in Search or Browse to save them here" icon={Heart} />;
  return (
    <div className="grid gap-3">
      {favorites.map((w) => (
        <WordCard key={w.strongsNumber} word={w} isSelected={selectedWord?.strongsNumber === w.strongsNumber}
          isFavorited={isFavorited(w.strongsNumber)} onSelect={onSetSelectedWord} onToggleFavorite={onToggleFavorite} />
      ))}
    </div>
  );
}
