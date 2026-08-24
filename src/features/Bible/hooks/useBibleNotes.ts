// Bible useBibleNotes — useBibleNotes state and API logic
import { useState, useCallback } from "react";
import { bibleApi } from "../services/bibleApi";
import type { Note } from "../types";

export function useBibleNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await bibleApi.getNotes(page);
      if (res.returnCode === 200) setNotes(res.returnData || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [page]);

  return { notes, loading, page, setPage, fetchNotes };
}
