"use client";

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Highlighter,
  Star,
  FileText,
  History,
  BookOpen,
  ChevronRight,
  Trash2,
  Loader2,
  Search,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { sendPostRequest } from "@/services/api";
import { HIGHLIGHT_COLORS } from "@/hooks/useBible";
import { getVerseText } from "@/utilities/bibleUtils";

const formatTimeAgo = (dateString: string | null | undefined): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  if (diffDays < 14) return days[date.getDay()];
  
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined });
};

interface HighlightItem {
  id: number;
  bookName: string;
  chapter: number;
  verseNumber: number;
  colorId: number;
  note?: string;
  createdOn: string;
}

interface NoteItem {
  id: number;
  bookName: string;
  chapter: number;
  verseNumber: number;
  note: string;
  createdOn: string;
}

interface FavoriteItem {
  id: number;
  bookName: string;
  chapter: number;
  verseNumber: number;
  createdOn: string;
}

interface ReadHistoryItem {
  id: number;
  bookName: string;
  chapter: number;
  verseNumber: number;
  createdOn: string;
}

type TabType = "highlights" | "notes" | "favorites" | "history";

const BOOKS = [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy",
  "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel",
  "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles",
  "Ezra", "Nehemiah", "Esther", "Job", "Psalms", "Proverbs",
  "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah",
  "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel",
  "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk",
  "Zephaniah", "Haggai", "Zechariah", "Malachi",
  "Matthew", "Mark", "Luke", "John", "Acts",
  "Romans", "1 Corinthians", "2 Corinthians", "Galatians",
  "Ephesians", "Philippians", "Colossians", "1 Thessalonians",
  "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus",
  "Philemon", "Hebrews", "James", "1 Peter", "2 Peter",
  "1 John", "2 John", "3 John", "Jude", "Revelation",
];

export default function MyActivity() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>("highlights");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBook, setFilterBook] = useState<string>("all");

  const [highlights, setHighlights] = useState<HighlightItem[]>([]);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [readHistory, setReadHistory] = useState<ReadHistoryItem[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [highlightsRes, notesRes, favoritesRes, historyRes] = await Promise.all([
        sendPostRequest("bible", "get-highlights", { pageSize: 100 }),
        sendPostRequest("bible", "get-verse-note", {}),
        sendPostRequest("bible", "get-favorites", { pageSize: 100 }),
        sendPostRequest("bible", "get-read-history", { pageSize: 100 }),
      ]);

      if (highlightsRes.returnCode === 200) {
        setHighlights(highlightsRes.returnData?.highlights || []);
      }
      if (notesRes.returnCode === 200) {
        setNotes(notesRes.returnData || []);
      }
      if (favoritesRes.returnCode === 200) {
        setFavorites(favoritesRes.returnData?.favorites || []);
      }
      if (historyRes.returnCode === 200) {
        setReadHistory(historyRes.returnData?.readHistories || []);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const deleteHighlight = async (id: number) => {
    try {
      const res = await sendPostRequest("bible", "delete-highlight", { highlightId: id });
      if (res.returnCode === 200) {
        setHighlights((prev) => prev.filter((h) => h.id !== id));
        toast({ title: "Highlight removed" });
      }
    } catch (error) {
      toast({ title: "Failed to remove highlight", variant: "destructive" });
    }
  };

  const deleteNote = async (id: number) => {
    try {
      const res = await sendPostRequest("bible", "delete-verse-note", { noteId: id });
      if (res.returnCode === 200) {
        setNotes((prev) => prev.filter((n) => n.id !== id));
        toast({ title: "Note removed" });
      }
    } catch (error) {
      toast({ title: "Failed to remove note", variant: "destructive" });
    }
  };

  const deleteFavorite = async (id: number) => {
    try {
      const res = await sendPostRequest("bible", "delete-favorite", { favoriteId: id });
      if (res.returnCode === 200) {
        setFavorites((prev) => prev.filter((f) => f.id !== id));
        toast({ title: "Favorite removed" });
      }
    } catch (error) {
      toast({ title: "Failed to remove favorite", variant: "destructive" });
    }
  };

  const getColorById = (colorId: number) => {
    const color = HIGHLIGHT_COLORS.find((c) => c.id === colorId);
    return color?.color || "#F87171";
  };

  const filterByBook = (item: { bookName: string }) => {
    if (filterBook === "all") return true;
    return item.bookName.toLowerCase() === filterBook.toLowerCase();
  };

  const filterBySearch = (item: { bookName: string; chapter: number; verseNumber: number; note?: string }) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const location = `${item.bookName} ${item.chapter}:${item.verseNumber}`.toLowerCase();
    const noteMatch = item.note?.toLowerCase().includes(query);
    return location.includes(query) || noteMatch;
  };

  const goToVerse = (bookName: string, chapter: number, verseNumber?: number) => {
    navigate(`/bible-reader?book=${bookName}&chapter=${chapter}`);
  };

  const renderHighlight = (item: HighlightItem) => {
    const verseText = getVerseText(item.bookName, item.chapter, item.verseNumber);
    return (
      <div
        key={item.id}
        className="group relative p-4 rounded-lg border bg-card hover:bg-gray-50 transition-colors"
        style={{
          borderLeftColor: getColorById(item.colorId),
          borderLeftWidth: "4px",
        }}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 cursor-pointer" onClick={() => goToVerse(item.bookName, item.chapter, item.verseNumber)}>
            <div className="flex items-center justify-between mb-1">
              <Badge variant="outline" className="text-xs">
                {item.bookName} {item.chapter}:{item.verseNumber}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatTimeAgo(item.createdOn)}
              </span>
            </div>
            {verseText && (
              <p className="text-sm mt-2 line-clamp-2 italic">{verseText}</p>
            )}
            {item.note && (
              <p className="text-sm text-muted-foreground mt-2 bg-muted/50 p-2 rounded">{item.note}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="opacity-0 group-hover:opacity-100 h-8 w-8 shrink-0"
            onClick={() => deleteHighlight(item.id)}
          >
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      </div>
    );
  };

  const renderNote = (item: NoteItem) => {
    const verseText = getVerseText(item.bookName, item.chapter, item.verseNumber);
    return (
      <div
        key={item.id}
        className="group relative p-4 rounded-lg border bg-card hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 cursor-pointer" onClick={() => goToVerse(item.bookName, item.chapter, item.verseNumber)}>
            <div className="flex items-center justify-between mb-1">
              <Badge variant="outline" className="text-xs">
                {item.bookName} {item.chapter}:{item.verseNumber}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatTimeAgo(item.createdOn)}
              </span>
            </div>
            {verseText && (
              <p className="text-sm mt-2 line-clamp-2 italic">{verseText}</p>
            )}
            <p className="text-sm mt-2 bg-yellow-50 p-2 rounded border-l-2 border-yellow-400">{item.note}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="opacity-0 group-hover:opacity-100 h-8 w-8 shrink-0"
            onClick={() => deleteNote(item.id)}
          >
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      </div>
    );
  };

  const renderFavorite = (item: FavoriteItem) => {
    const verseText = getVerseText(item.bookName, item.chapter, item.verseNumber);
    return (
      <div
        key={item.id}
        className="group relative p-4 rounded-lg border bg-card hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 cursor-pointer" onClick={() => goToVerse(item.bookName, item.chapter, item.verseNumber)}>
            <div className="flex items-center justify-between mb-1">
              <Badge variant="outline" className="text-xs">
                {item.bookName} {item.chapter}:{item.verseNumber}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatTimeAgo(item.createdOn)}
              </span>
            </div>
            {verseText && (
              <p className="text-sm mt-2 line-clamp-2 italic">{verseText}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="opacity-0 group-hover:opacity-100 h-8 w-8 shrink-0"
            onClick={() => deleteFavorite(item.id)}
          >
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      </div>
    );
  };

  const renderHistory = (item: ReadHistoryItem) => {
    const verseText = getVerseText(item.bookName, item.chapter, item.verseNumber);
    return (
      <div
        key={item.id}
        className="group relative p-4 rounded-lg border bg-card hover:bg-gray-50 transition-colors cursor-pointer"
        onClick={() => goToVerse(item.bookName, item.chapter, item.verseNumber)}
      >
        <div className="flex items-center justify-between mb-1">
          <Badge variant="outline" className="text-xs">
            {item.bookName} {item.chapter}:{item.verseNumber}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {formatTimeAgo(item.createdOn)}
          </span>
        </div>
        {verseText && (
          <p className="text-sm mt-2 line-clamp-2">{verseText}</p>
        )}
      </div>
    );
  };

  const filteredHighlights = highlights.filter(
    (item) => filterByBook(item) && filterBySearch(item)
  );
  const filteredNotes = notes.filter(
    (item) => filterByBook(item) && filterBySearch(item)
  );
  const filteredFavorites = favorites.filter(filterByBook);
  const filteredHistory = readHistory.filter(filterByBook);

  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">My Activity</h1>
        <p className="text-muted-foreground">
          View and manage your highlights, notes, favorites, and reading history
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by verse or note..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterBook} onValueChange={setFilterBook}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by book" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Books</SelectItem>
            {BOOKS.map((book) => (
              <SelectItem key={book} value={book}>
                {book}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="highlights" className="gap-2">
            <Highlighter className="w-4 h-4" />
            <span className="hidden sm:inline">Highlights</span>
            <Badge variant="secondary" className="ml-1 text-xs">
              {highlights.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="notes" className="gap-2">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Notes</span>
            <Badge variant="secondary" className="ml-1 text-xs">
              {notes.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="favorites" className="gap-2">
            <Star className="w-4 h-4" />
            <span className="hidden sm:inline">Favorites</span>
            <Badge variant="secondary" className="ml-1 text-xs">
              {favorites.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="w-4 h-4" />
            <span className="hidden sm:inline">History</span>
            <Badge variant="secondary" className="ml-1 text-xs">
              {readHistory.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="highlights" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Highlighter className="w-5 h-5" />
                Highlights
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : filteredHighlights.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Highlighter className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No highlights yet</p>
                  <p className="text-sm">Highlight verses in the Bible Reader to see them here</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {filteredHighlights.map(renderHighlight)}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : filteredNotes.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No notes yet</p>
                  <p className="text-sm">Add notes to verses in the Bible Reader to see them here</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {filteredNotes.map(renderNote)}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="favorites" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                Favorites
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : filteredFavorites.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Star className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No favorites yet</p>
                  <p className="text-sm">Favorite verses in the Bible Reader to see them here</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {filteredFavorites.map(renderFavorite)}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Reading History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : filteredHistory.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No reading history yet</p>
                  <p className="text-sm">Read verses in the Bible Reader to see them here</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {filteredHistory.map(renderHistory)}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}