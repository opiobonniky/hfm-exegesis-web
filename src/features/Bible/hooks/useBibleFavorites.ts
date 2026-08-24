// Bible useBibleFavorites — useBibleFavorites state and API logic
import { useState, useCallback } from "react";
import { bibleApi } from "../services/bibleApi";
import type { Favorite } from "../types";

export function useBibleFavorites() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  const fetchFavorites = useCallback(async () => {
    setLoading(true);
    try {
      const res = await bibleApi.getFavorites(page);
      if (res.returnCode === 200) setFavorites(res.returnData || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [page]);

  return { favorites, loading, page, setPage, fetchFavorites };
}
