// Highlights — standalone page for viewing and managing verse highlights
"use client";

import { useHighlightsPage } from "../hooks/useHighlightsPage";
import { BiblePageLayout } from "../components/BiblePageLayout";
import { HighlightsList } from "../components";

export default function Highlights() {
  const h = useHighlightsPage();

  return (
    <BiblePageLayout
      title="My Highlights"
      count={h.highlights.length}
      contentCount={h.filtered.length}
      isRtl={h.isRtl}
      searchQuery={h.searchQuery}
      onSearchChange={h.setSearchQuery}
      filterBook={h.filterBook}
      onFilterBookChange={h.setFilterBook}
      loading={h.loading}
      onRefresh={h.refresh}
      searchPlaceholder="Search highlights by verse or note..."
      emptyTitle="No highlights yet"
      emptyMessage="Highlight verses while reading to see them here"
    >
      <HighlightsList
        grouped={h.grouped}
        verseTextMap={h.verseTextMap}
        deleting={h.deleting}
        getColor={h.getColor}
        onGoToReader={h.goToReader}
        onDelete={h.deleteHighlight}
      />
    </BiblePageLayout>
  );
}
