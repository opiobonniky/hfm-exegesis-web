// Highlights — standalone page for viewing and managing verse highlights
"use client";

import { useHighlightsPage } from "../hooks/useHighlightsPage";
import { BiblePageLayout } from "../components/BiblePageLayout";
import { HighlightCard } from "../components/HighlightCard";
import { BibleGroupSection, BibleSubGroup } from "../components/BibleGroupSection";

export default function Highlights() {
  const h = useHighlightsPage();

  return (
    <BiblePageLayout
      title="My Highlights"
      count={h.highlights.length}
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
      {Object.entries(h.grouped).map(([book, chapters]) => (
        <BibleGroupSection key={book} label={book}>
          {Object.entries(chapters).map(([chapter, verses]) => (
            <BibleSubGroup key={chapter} label={`Chapter ${chapter}`}>
              {verses.map((v) => (
                <HighlightCard
                  key={v.id}
                  bookName={v.bookName}
                  chapter={v.chapter}
                  verseNumber={v.verseNumber}
                  verseText={h.verseTextMap[`${v.bookName} ${v.chapter}:${v.verseNumber}`]}
                  color={h.getColor(v.colorId)}
                  note={v.note}
                  createdOn={v.createdOn}
                  deleting={h.deleting === v.id}
                  onGoToReader={() => h.goToReader(v.bookName, v.chapter)}
                  onDelete={() => h.deleteHighlight(v.id)}
                />
              ))}
            </BibleSubGroup>
          ))}
        </BibleGroupSection>
      ))}
    </BiblePageLayout>
  );
}
