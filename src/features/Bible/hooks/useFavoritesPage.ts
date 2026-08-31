// useFavoritesPage — state, effects, and logic for standalone Favorites page
import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/components/languages/languageProvider";
import { sendPostRequest } from "@/services/api";
import { ensureDataLoaded, getVerseText } from "@/utilities/bibleUtils";

export interface FavoriteItem {
  id: number;
  bookName: string;
  chapter: number;
  verseNumber: number;
  createdOn: string;
}

export function useFavoritesPage() {
  const { t, isRtl } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBook, setFilterBook] = useState("all");
  const [deleting, setDeleting] = useState<number | null>(null);
  const [verseTextMap, setVerseTextMap] = useState<Record<string, string>>({});

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await sendPostRequest("bible", "get-favorites", { pageSize: 200 });
      const items: FavoriteItem[] = res.returnCode === 200 ? (res.returnData?.favorites || []) : [];
      setFavorites(items.filter(Boolean));

      try {
        await ensureDataLoaded();
        const map: Record<string, string> = {};
        for (const item of items.filter(Boolean)) {
          if (item.bookName && item.chapter && item.verseNumber) {
            const key = `${item.bookName} ${item.chapter}:${item.verseNumber}`;
            if (!(key in map)) {
              const text = getVerseText(item.bookName, Number(item.chapter), Number(item.verseNumber));
              if (text) map[key] = text;
            }
          }
        }
        setVerseTextMap(map);
      } catch { /* Bible data not available */ }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const deleteFavorite = useCallback(async (id: number) => {
    setDeleting(id);
    try {
      const res = await sendPostRequest("bible", "delete-favorite", { favoriteId: id });
      if (res.returnCode === 200) {
        setFavorites((p) => p.filter((f) => f.id !== id));
        toast({ title: "Favorite removed" });
      }
    } catch { toast({ title: "Failed to remove", variant: "destructive" }); }
    finally { setDeleting(null); }
  }, [toast]);

  const goToReader = useCallback((book: string, ch: number) => {
    navigate(`/bible-reader?book=${book}&chapter=${ch}`);
  }, [navigate]);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return favorites.filter((f) => {
      if (filterBook !== "all" && f.bookName !== filterBook) return false;
      if (q) {
        const ref = `${f.bookName} ${f.chapter}:${f.verseNumber}`.toLowerCase();
        if (!ref.includes(q)) return false;
      }
      return true;
    }).sort((a, b) => new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime());
  }, [favorites, searchQuery, filterBook]);

  const formatDate = useCallback((dateString: string | null | undefined): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    const diffMs = Date.now() - date.getTime();
    const days = Math.floor(diffMs / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }, []);

  return {
    t, isRtl, loading, favorites, filtered, searchQuery, setSearchQuery,
    filterBook, setFilterBook, deleting, verseTextMap,
    deleteFavorite, goToReader, formatDate, refresh: loadData,
  };
}
