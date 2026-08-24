// Bible useBibleHighlights — useBibleHighlights state and API logic
import { useState, useCallback } from "react";
import { bibleApi } from "../services/bibleApi";
import type { Highlight } from "../types";

export function useBibleHighlights() {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  const fetchHighlights = useCallback(async () => {
    setLoading(true);
    try {
      const res = await bibleApi.getHighlights(page);
      if (res.returnCode === 200) setHighlights(res.returnData || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [page]);

  return { highlights, loading, page, setPage, fetchHighlights };
}
