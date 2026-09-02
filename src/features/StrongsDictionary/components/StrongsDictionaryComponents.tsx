import { Search, BookOpen, Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingState, EmptyState } from "@/components/ui/states";
import { BIBLE_BOOKS } from "@/data/staticData";
import type { StrongsWord } from "../hooks/useStrongsDictionaryPage";
import { WordCard } from "./WordCard";

interface StrongsHeaderProps {
  onBack: () => void;
}

export function StrongsHeader({ onBack }: StrongsHeaderProps) {
  return (
    <div>
      <h1>Strong's Dictionary</h1>
      <p>Browse Hebrew and Greek word definitions from Strong's Concordance</p>
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
  onExecuteSearch: () => void;
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
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by word, Strong's number, or meaning..." value={searchQuery}
            onChange={(e) => onSetSearchQuery(e.target.value)} className="pl-9"
            onKeyDown={(e) => e.key === "Enter" && onExecuteSearch()} />
        </div>
        <Button onClick={onExecuteSearch} disabled={searchLoading}>
          {searchLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
        </Button>
      </div>
      {searchResults.length > 0 && (
        <p>{searchCount} result{searchCount !== 1 ? "s" : ""} found</p>
      )}
      <div className="grid gap-3">
        {searchResults.map((w) => (
          <WordCard key={w.strongsNumber} word={w} isSelected={selectedWord?.strongsNumber === w.strongsNumber}
            isFavorited={isFavorited(w.strongsNumber)} onSelect={onSetSelectedWord} onToggleFavorite={onToggleFavorite} />
        ))}
      </div>
      {searchResults.length > 0 && searchResults.length < searchCount && (
        <Button variant="outline" className="w-full" onClick={onLoadMore} disabled={searchLoading}>Load More</Button>
      )}
      {searchResults.length === 0 && !searchLoading && searchQuery && (
        <EmptyState title="No results" message={`No words found for "${searchQuery}"`} icon={Search} />
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
  onSetSelectedWord,
  onToggleFavorite,
  onLoadMore,
}: StrongsBrowseTabProps) {
  return (
    <div className="space-y-4">
      <div>
        <label>Select a Book</label>
        <Select value={selectedBook} onValueChange={onSetSelectedBook}>
          <SelectTrigger className="w-full"><SelectValue placeholder="Choose a Bible book" /></SelectTrigger>
          <SelectContent>{BIBLE_BOOKS.map((book) => (<SelectItem key={book} value={book}>{book}</SelectItem>))}</SelectContent>
        </Select>
      </div>
      {browseLoading && <LoadingState message="Loading words..." />}
      {!browseLoading && browseWords.length > 0 && (
        <>
          <p>{browseWords.length} word{browseWords.length !== 1 ? "s" : ""} in {selectedBook}</p>
          <div className="grid gap-3">
            {browseWords.map((w) => (
              <WordCard key={w.strongsNumber} word={w} isSelected={selectedWord?.strongsNumber === w.strongsNumber}
                isFavorited={isFavorited(w.strongsNumber)} onSelect={onSetSelectedWord} onToggleFavorite={onToggleFavorite} />
            ))}
          </div>
        </>
      )}
      {!browseLoading && selectedBook && browseWords.length === 0 && (
        <EmptyState title="No words found" message={`No Strong's entries found for ${selectedBook}`} icon={BookOpen} />
      )}
      {!browseLoading && !selectedBook && (
        <EmptyState title="Select a book" message="Choose a Bible book to browse its Strong's entries" icon={BookOpen} />
      )}
      {browseWords.length > 0 && browseWords.length < browseCount && (
        <Button variant="outline" className="w-full" onClick={onLoadMore} disabled={browseLoading}>Load More</Button>
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
  if (favorites.length === 0) return <EmptyState title="No favorites yet" message="Star words in Search or Browse to save them here" icon={Heart} />;
  return (
    <div className="grid gap-3">
      {favorites.map((w) => (
        <WordCard key={w.strongsNumber} word={w} isSelected={selectedWord?.strongsNumber === w.strongsNumber}
          isFavorited={isFavorited(w.strongsNumber)} onSelect={onSetSelectedWord} onToggleFavorite={onToggleFavorite} />
      ))}
    </div>
  );
}
