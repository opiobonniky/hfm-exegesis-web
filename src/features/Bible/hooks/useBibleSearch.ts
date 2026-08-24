// Bible useBibleSearch — useBibleSearch state and API logic
import { useState, useCallback } from "react";
import { bibleApi } from "../services/bibleApi";

export function useBibleSearch() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");

  const search = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setQuery(q);
    setLoading(true);
    try {
      const res = await bibleApi.search(q);
      if (res.returnCode === 200) setResults(res.returnData || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  return { results, loading, query, search, setQuery };
}
