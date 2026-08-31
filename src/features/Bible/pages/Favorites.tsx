// Favorites — standalone page for viewing and managing favorite verses
"use client";

import { Star } from "lucide-react";
import { useFavoritesPage } from "../hooks/useFavoritesPage";
import { BiblePageLayout } from "../components/BiblePageLayout";
import { FavoriteCard } from "../components/FavoriteCard";

export default function Favorites() {
  const h = useFavoritesPage();

  return (
    <BiblePageLayout
      title="My Favorites"
      count={h.favorites.length}
      isRtl={h.isRtl}
      searchQuery={h.searchQuery}
      onSearchChange={h.setSearchQuery}
      filterBook={h.filterBook}
      onFilterBookChange={h.setFilterBook}
      loading={h.loading}
      onRefresh={h.refresh}
      searchPlaceholder="Search favorites by verse reference..."
      emptyTitle="No favorites yet"
      emptyMessage="Star verses while reading to save them here"
      emptyIcon={<Star className="w-8 h-8 text-muted-foreground/30 mb-4" />}
    >
      {h.filtered.map((f) => (
        <FavoriteCard
          key={f.id}
          bookName={f.bookName}
          chapter={f.chapter}
          verseNumber={f.verseNumber}
          verseText={h.verseTextMap[`${f.bookName} ${f.chapter}:${f.verseNumber}`]}
          createdOn={f.createdOn}
          deleting={h.deleting === f.id}
          onGoToReader={() => h.goToReader(f.bookName, f.chapter)}
          onDelete={() => h.deleteFavorite(f.id)}
          formatDate={h.formatDate}
        />
      ))}
    </BiblePageLayout>
  );
}
