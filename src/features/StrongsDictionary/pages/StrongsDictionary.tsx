import { Search, BookOpen, Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingState, EmptyState } from "@/components/ui/states";
import { BIBLE_BOOKS } from "@/data/staticData";
import { useStrongsDictionaryPage, type StrongsWord } from "../hooks/useStrongsDictionaryPage";
import { WordCard } from "../components/WordCard";
import { WordDetail } from "../components/WordDetail";
import { LanguageFilter } from "../components/LanguageFilter";

export default function StrongsDictionaryPage() {
  const h = useStrongsDictionaryPage();

  const WordList = ({ words, loading, count, label }: { words: StrongsWord[]; loading: boolean; count: number; label?: string }) => (
    <>
      {loading && <LoadingState message="Loading words..." />}
      {!loading && words.length > 0 && (
        <>
          {label && <p className="text-sm text-muted-foreground">{count} word{count !== 1 ? "s" : ""} {label}</p>}
          <div className="grid gap-3">{words.map((w) => (
            <WordCard key={w.strongsNumber} word={w} isSelected={h.selectedWord?.strongsNumber === w.strongsNumber}
              isFavorited={h.isFavorited(w.strongsNumber)} onSelect={h.setSelectedWord} onToggleFavorite={h.toggleFavorite} />
          ))}</div>
        </>
      )}
    </>
  );

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" /> Strong's Dictionary
        </h1>
        <p className="text-sm text-muted-foreground">Browse Hebrew and Greek word definitions from Strong's Concordance</p>
      </div>

      <LanguageFilter value={h.langFilter} onChange={h.setLangFilter} />

      <Tabs value={h.mode} onValueChange={(v) => h.setMode(v as any)}>
        <TabsList>
          <TabsTrigger value="search" className="gap-1"><Search className="h-3 w-3" />Search</TabsTrigger>
          <TabsTrigger value="browse" className="gap-1"><BookOpen className="h-3 w-3" />Browse</TabsTrigger>
          <TabsTrigger value="favorites" className="gap-1"><Heart className="h-3 w-3" />Favorites</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search by word, Strong's number, or meaning..." value={h.searchQuery}
                onChange={(e) => h.setSearchQuery(e.target.value)} className="pl-9"
                onKeyDown={(e) => e.key === "Enter" && h.executeSearch()} />
            </div>
            <Button onClick={() => h.executeSearch()} disabled={h.searchLoading}>
              {h.searchLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
            </Button>
          </div>
          {h.searchResults.length > 0 && (
            <p className="text-sm text-muted-foreground">{h.searchCount} result{h.searchCount !== 1 ? "s" : ""} found</p>
          )}
          <div className="grid gap-3">
            {h.searchResults.map((w) => (
              <WordCard key={w.strongsNumber} word={w} isSelected={h.selectedWord?.strongsNumber === w.strongsNumber}
                isFavorited={h.isFavorited(w.strongsNumber)} onSelect={h.setSelectedWord} onToggleFavorite={h.toggleFavorite} />
            ))}
          </div>
          {h.searchResults.length > 0 && h.searchResults.length < h.searchCount && (
            <Button variant="outline" className="w-full" onClick={h.loadMoreSearch} disabled={h.searchLoading}>Load More</Button>
          )}
          {h.searchResults.length === 0 && !h.searchLoading && h.searchQuery && (
            <EmptyState title="No results" message={`No words found for "${h.searchQuery}"`} icon={Search} />
          )}
        </TabsContent>

        <TabsContent value="browse" className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Select a Book</label>
            <Select value={h.selectedBook} onValueChange={h.setSelectedBook}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Choose a Bible book" /></SelectTrigger>
              <SelectContent>{BIBLE_BOOKS.map((book) => (<SelectItem key={book} value={book}>{book}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          <WordList words={h.browseWords} loading={h.browseLoading} count={h.browseCount} label={`in ${h.selectedBook}`} />
          {!h.browseLoading && h.selectedBook && h.browseWords.length === 0 && (
            <EmptyState title="No words found" message={`No Strong's entries found for ${h.selectedBook}`} icon={BookOpen} />
          )}
          {!h.browseLoading && !h.selectedBook && (
            <EmptyState title="Select a book" message="Choose a Bible book to browse its Strong's entries" icon={BookOpen} />
          )}
          {h.browseWords.length > 0 && h.browseWords.length < h.browseCount && (
            <Button variant="outline" className="w-full" onClick={h.loadMoreBrowse} disabled={h.browseLoading}>Load More</Button>
          )}
        </TabsContent>

        <TabsContent value="favorites" className="space-y-4">
          {h.favLoading ? (
            <LoadingState message="Loading favorites..." />
          ) : h.favorites.length === 0 ? (
            <EmptyState title="No favorites yet" message="Star words in Search or Browse to save them here" icon={Heart} />
          ) : (
            <div className="grid gap-3">
              {h.favorites.map((w) => (
                <WordCard key={w.strongsNumber} word={w} isSelected={h.selectedWord?.strongsNumber === w.strongsNumber}
                  isFavorited={h.isFavorited(w.strongsNumber)} onSelect={h.setSelectedWord} onToggleFavorite={h.toggleFavorite} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {h.selectedWord && (
        <WordDetail word={h.selectedWord} isFavorited={h.isFavorited(h.selectedWord.strongsNumber)} onToggleFavorite={h.toggleFavorite} />
      )}
    </div>
  );
}
