// Favorites — standalone page for viewing and managing favorite verses
"use client";

import { Star } from "lucide-react";
import { useFavoritesPage } from "../hooks/useFavoritesPage";
import { BiblePageLayout } from "../components/BiblePageLayout";
import { FavoritesList } from "../components";

export default function Favorites() {
  const h = useFavoritesPage();

  return (
    <BiblePageLayout
      title="My Favorites"
      count={h.favorites.length}
      contentCount={h.filtered.length}
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
      <FavoritesList
        items={h.filtered}
        verseTextMap={h.verseTextMap}
        deleting={h.deleting}
        onGoToReader={h.goToReader}
        onDelete={h.deleteFavorite}
        formatDate={h.formatDate}
      />
    </BiblePageLayout>
  );
}
