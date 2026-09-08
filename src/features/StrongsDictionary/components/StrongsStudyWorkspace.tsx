import { BookOpen, Heart, Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { LanguageFilter } from "./LanguageFilter";
import {
  StrongsBrowseTab,
  StrongsFavoritesTab,
  StrongsSearchTab,
} from "./StrongsDictionaryComponents";
import type { useStrongsDictionaryPage } from "../hooks/useStrongsDictionaryPage";

type PageModel = ReturnType<typeof useStrongsDictionaryPage>;

interface StrongsStudyWorkspaceProps {
  mode: PageModel["mode"];
  searchCount: PageModel["searchCount"];
  langFilter: PageModel["langFilter"];
  onSetLangFilter: PageModel["setLangFilter"];
  onSetMode: PageModel["setMode"];
  searchTab: Pick<
    PageModel,
    | "searchQuery"
    | "searchResults"
    | "searchLoading"
    | "selectedWord"
    | "isFavorited"
    | "setSearchQuery"
    | "executeSearch"
    | "setSelectedWord"
    | "toggleFavorite"
    | "loadMoreSearch"
  >;
  browseTab: Pick<
    PageModel,
    | "selectedBook"
    | "loadSelectedBook"
    | "browseWords"
    | "browseLoading"
    | "browseCount"
    | "selectedWord"
    | "isFavorited"
    | "setSelectedBook"
    | "setSelectedWord"
    | "toggleFavorite"
    | "loadMoreBrowse"
  >;
  favoritesTab: Pick<
    PageModel,
    | "favorites"
    | "favLoading"
    | "selectedWord"
    | "isFavorited"
    | "setSelectedWord"
    | "toggleFavorite"
  >;
}

export function StrongsStudyWorkspace({
  mode,
  searchCount,
  langFilter,
  onSetLangFilter,
  onSetMode,
  searchTab,
  browseTab,
  favoritesTab,
}: StrongsStudyWorkspaceProps) {
  return (
    <Card className="overflow-hidden border-border/70 shadow-sm">
      <CardContent className="p-4 sm:p-6">
        <div className="mb-5 flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                Study workspace
              </p>
              {searchCount > 0 && (
                <span className="text-xs text-muted-foreground">{searchCount} matches</span>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Search definitions, original words, and verse-based study notes.
            </p>
          </div>
          <LanguageFilter value={langFilter} onChange={onSetLangFilter} />
        </div>

        <Tabs value={mode} onValueChange={(value) => onSetMode(value as PageModel["mode"])}>
          <TabsList className="grid h-auto w-full grid-cols-3 bg-muted/70 p-1 sm:w-fit sm:min-w-[360px]">
            <TabsTrigger value="search" className="gap-2 py-2.5">
              <Search className="h-4 w-4" /> Search
            </TabsTrigger>
            <TabsTrigger value="browse" className="gap-2 py-2.5">
              <BookOpen className="h-4 w-4" /> Browse
            </TabsTrigger>
            <TabsTrigger value="favorites" className="gap-2 py-2.5">
              <Heart className="h-4 w-4" /> Saved
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="mt-5">
            <StrongsSearchTab
              searchQuery={searchTab.searchQuery}
              searchResults={searchTab.searchResults}
              searchLoading={searchTab.searchLoading}
              searchCount={searchCount}
              selectedWord={searchTab.selectedWord}
              isFavorited={searchTab.isFavorited}
              onSetSearchQuery={searchTab.setSearchQuery}
              onExecuteSearch={searchTab.executeSearch}
              onSetSelectedWord={searchTab.setSelectedWord}
              onToggleFavorite={searchTab.toggleFavorite}
              onLoadMore={searchTab.loadMoreSearch}
            />
          </TabsContent>
          <TabsContent value="browse" className="mt-5">
            <StrongsBrowseTab
              selectedBook={browseTab.selectedBook}
              browseWords={browseTab.browseWords}
              browseLoading={browseTab.browseLoading}
              browseCount={browseTab.browseCount}
              selectedWord={browseTab.selectedWord}
              isFavorited={browseTab.isFavorited}
              onSetSelectedBook={browseTab.setSelectedBook}
              onLoadBook={browseTab.loadSelectedBook}
              onSetSelectedWord={browseTab.setSelectedWord}
              onToggleFavorite={browseTab.toggleFavorite}
              onLoadMore={browseTab.loadMoreBrowse}
            />
          </TabsContent>
          <TabsContent value="favorites" className="mt-5">
            <StrongsFavoritesTab
              favorites={favoritesTab.favorites}
              favLoading={favoritesTab.favLoading}
              selectedWord={favoritesTab.selectedWord}
              isFavorited={favoritesTab.isFavorited}
              onSetSelectedWord={favoritesTab.setSelectedWord}
              onToggleFavorite={favoritesTab.toggleFavorite}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
