// useHighlightsPage — state, effects, and logic for standalone Highlights page
import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/components/languages/languageProvider";
import { sendPostRequest } from "@/services/api";
import { ensureDataLoaded, getVerseText } from "@/utilities/bibleUtils";

export interface HighlightItem {
  id: number;
  bookName: string;
  chapter: number;
  verseNumber: number;
  colorId: number;
  note?: string;
  createdOn: string;
}

const HIGHLIGHT_COLORS: Record<number, { color: string; label: string }> = {
  1: { color: "#FDE68A", label: "Yellow" },
  2: { color: "#BBF7D0", label: "Green" },
  3: { color: "#BFDBFE", label: "Blue" },
  4: { color: "#FBCFE8", label: "Pink" },
  5: { color: "#DDD6FE", label: "Purple" },
  6: { color: "#FED7AA", label: "Orange" },
};

export function useHighlightsPage() {
  const { t, isRtl } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [highlights, setHighlights] = useState<HighlightItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBook, setFilterBook] = useState("all");
  const [deleting, setDeleting] = useState<number | null>(null);
  const [verseTextMap, setVerseTextMap] = useState<Record<string, string>>({});

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await sendPostRequest("bible", "get-highlights", { pageSize: 200 });
      const items: HighlightItem[] = res.returnCode === 200 ? (res.returnData?.highlights || []) : [];
      setHighlights(items.filter(Boolean));

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

  const deleteHighlight = useCallback(async (id: number) => {
    setDeleting(id);
    try {
      const res = await sendPostRequest("bible", "delete-highlight", { highlightId: id });
      if (res.returnCode === 200) {
        setHighlights((p) => p.filter((h) => h.id !== id));
        toast({ title: "Highlight removed" });
      }
    } catch { toast({ title: "Failed to delete", variant: "destructive" }); }
    finally { setDeleting(null); }
  }, [toast]);

  const goToReader = useCallback((book: string, ch: number) => {
    navigate(`/bible-reader?book=${book}&chapter=${ch}`);
  }, [navigate]);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return highlights.filter((h) => {
      if (filterBook !== "all" && h.bookName !== filterBook) return false;
      if (q) {
        const ref = `${h.bookName} ${h.chapter}:${h.verseNumber}`.toLowerCase();
        const noteMatch = h.note?.toLowerCase().includes(q) || false;
        if (!ref.includes(q) && !noteMatch) return false;
      }
      return true;
    }).sort((a, b) => a.bookName.localeCompare(b.bookName) || a.chapter - b.chapter || a.verseNumber - b.verseNumber);
  }, [highlights, searchQuery, filterBook]);

  const grouped = useMemo(() => {
    const groups: Record<string, Record<number, HighlightItem[]>> = {};
    for (const h of filtered) {
      if (!groups[h.bookName]) groups[h.bookName] = {};
      if (!groups[h.bookName][h.chapter]) groups[h.bookName][h.chapter] = [];
      groups[h.bookName][h.chapter].push(h);
    }
    return groups;
  }, [filtered]);

  const getColor = useCallback((colorId: number) => HIGHLIGHT_COLORS[colorId] || HIGHLIGHT_COLORS[1], []);

  return {
    t, isRtl, loading, highlights, filtered, grouped, searchQuery, setSearchQuery,
    filterBook, setFilterBook, deleting, verseTextMap, getColor,
    deleteHighlight, goToReader, refresh: loadData,
  };
}
