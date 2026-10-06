import BibleBookSelectionView from "../components/BibleBookSelection";
import { useBibleBookSelectionPage } from "../hooks/useBibleBookSelectionPage";

export default function BibleBookSelection() {
  const { data, actions } = useBibleBookSelectionPage();

  return (
    <BibleBookSelectionView
      books={data.books}
      tabs={data.tabs}
      activeTestament={data.activeTestament}
      selectedBook={data.selectedBook}
      searchQuery={data.searchQuery}
      isFiltering={data.isFiltering}
      isRtl={data.isRtl}
      title={data.title}
      subtitle={data.subtitle}
      searchPlaceholder={data.searchPlaceholder}
      noResultsLabel={data.noResultsLabel}
      chaptersLabel={data.chaptersLabel}
      currentBookLabel={data.currentBookLabel}
      backLabel={data.backLabel}
      onBack={actions.goBack}
      onSearchChange={actions.setSearchQuery}
      onClearSearch={actions.clearSearch}
      onTestamentChange={actions.setActiveTestament}
      onSelectBook={actions.selectBook}
    />
  );
}
