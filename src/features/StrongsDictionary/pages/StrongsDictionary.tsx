import { Search, BookOpen, Heart } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStrongsDictionaryPage } from "../hooks/useStrongsDictionaryPage";
import { WordDetail } from "../components/WordDetail";
import { LanguageFilter } from "../components/LanguageFilter";
import {
  StrongsHeader,
  StrongsSearchTab,
  StrongsBrowseTab,
  StrongsFavoritesTab,
} from "../components";

export default function StrongsDictionaryPage() {
  const h = useStrongsDictionaryPage();

  return (
    <div className="space-y-6 p-6">
      <StrongsHeader onBack={h.goBack} />
      <LanguageFilter value={h.langFilter} onChange={h.setLangFilter} />

      <Tabs value={h.mode} onValueChange={(v) => h.setMode(v as any)}>
        <TabsList>
          <TabsTrigger value="search" className="gap-1"><Search className="h-3 w-3" />Search</TabsTrigger>
          <TabsTrigger value="browse" className="gap-1"><BookOpen className="h-3 w-3" />Browse</TabsTrigger>
          <TabsTrigger value="favorites" className="gap-1"><Heart className="h-3 w-3" />Favorites</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-4">
          <StrongsSearchTab
            searchQuery={h.searchQuery}
            searchResults={h.searchResults}
            searchLoading={h.searchLoading}
            searchCount={h.searchCount}
            selectedWord={h.selectedWord}
            isFavorited={h.isFavorited}
            onSetSearchQuery={h.setSearchQuery}
            onExecuteSearch={h.executeSearch}
            onSetSelectedWord={h.setSelectedWord}
            onToggleFavorite={h.toggleFavorite}
            onLoadMore={h.loadMoreSearch}
          />
        </TabsContent>

        <TabsContent value="browse" className="space-y-4">
          <StrongsBrowseTab
            selectedBook={h.selectedBook}
            browseWords={h.browseWords}
            browseLoading={h.browseLoading}
            browseCount={h.browseCount}
            selectedWord={h.selectedWord}
            isFavorited={h.isFavorited}
            onSetSelectedBook={h.setSelectedBook}
            onSetSelectedWord={h.setSelectedWord}
            onToggleFavorite={h.toggleFavorite}
            onLoadMore={h.loadMoreBrowse}
          />
        </TabsContent>

        <TabsContent value="favorites" className="space-y-4">
          <StrongsFavoritesTab
            favorites={h.favorites}
            favLoading={h.favLoading}
            selectedWord={h.selectedWord}
            isFavorited={h.isFavorited}
            onSetSelectedWord={h.setSelectedWord}
            onToggleFavorite={h.toggleFavorite}
          />
        </TabsContent>
      </Tabs>

      {h.selectedWord && (
        <WordDetail word={h.selectedWord} isFavorited={h.isFavorited(h.selectedWord.strongsNumber)} onToggleFavorite={h.toggleFavorite} />
      )}
    </div>
  );
}
