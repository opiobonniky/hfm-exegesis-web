import { useStrongsDictionaryPage } from "../hooks/useStrongsDictionaryPage";
import {
  StrongsDictionaryShell,
  StrongsHeader,
  StrongsOverviewStats,
  StrongsSelectionPanel,
  StrongsStudyGrid,
  StrongsStudyWorkspace,
} from "../components";

export default function StrongsDictionaryPage() {
  const { data, actions } = useStrongsDictionaryPage();
  const p = { ...data, ...actions };

  return (
    <StrongsDictionaryShell>
      <StrongsHeader onBack={p.goBack} />
      <StrongsOverviewStats />
      <StrongsStudyGrid>
        <StrongsStudyWorkspace
          mode={p.mode}
          searchCount={p.searchCount}
          langFilter={p.langFilter}
          onSetLangFilter={p.setLangFilter}
          onSetMode={p.setMode}
          searchTab={{
            searchQuery: p.searchQuery,
            searchResults: p.searchResults,
            searchLoading: p.searchLoading,
            selectedWord: p.selectedWord,
            isFavorited: p.isFavorited,
            setSearchQuery: p.setSearchQuery,
            executeSearch: p.executeSearch,
            setSelectedWord: p.setSelectedWord,
            toggleFavorite: p.toggleFavorite,
            loadMoreSearch: p.loadMoreSearch,
          }}
          browseTab={{
            selectedBook: p.selectedBook,
            loadSelectedBook: p.loadSelectedBook,
            browseWords: p.browseWords,
            browseLoading: p.browseLoading,
            browseCount: p.browseCount,
            selectedWord: p.selectedWord,
            isFavorited: p.isFavorited,
            setSelectedBook: p.setSelectedBook,
            setSelectedWord: p.setSelectedWord,
            toggleFavorite: p.toggleFavorite,
            loadMoreBrowse: p.loadMoreBrowse,
          }}
          favoritesTab={{
            favorites: p.favorites,
            favLoading: p.favLoading,
            selectedWord: p.selectedWord,
            isFavorited: p.isFavorited,
            setSelectedWord: p.setSelectedWord,
            toggleFavorite: p.toggleFavorite,
          }}
        />
        <StrongsSelectionPanel
          selectedWord={p.selectedWord}
          isFavorited={p.isFavorited}
          onToggleFavorite={p.toggleFavorite}
          onClose={() => p.setSelectedWord(null)}
        />
      </StrongsStudyGrid>
    </StrongsDictionaryShell>
  );
}
