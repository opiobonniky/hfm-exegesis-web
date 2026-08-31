// Highlights — standalone page for viewing and managing verse highlights
"use client";

import { Highlighter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHighlightsPage } from "../hooks/useHighlightsPage";
import { BiblePageLayout } from "../components/BiblePageLayout";
import { HighlightCard } from "../components/HighlightCard";

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
        <div key={book} className="mb-6">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 px-1">
            {book}
          </h3>
          {Object.entries(chapters).map(([chapter, verses]) => (
            <div key={chapter} className="mb-4 ml-2">
              <p className="text-[11px] font-medium text-muted-foreground/50 mb-2 px-1">
                Chapter {chapter}
              </p>
              <div className="space-y-2">
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
              </div>
            </div>
          ))}
        </div>
      ))}
    </BiblePageLayout>
  );
}
