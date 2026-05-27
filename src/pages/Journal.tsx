import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  PenLine,
  Plus,
  Search,
  Filter,
  Star,
  StarOff,
  BookOpen,
  Calendar,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Edit2,
  MoreVertical,
  X,
  Tag,
  Heart,
  Sparkles,
  TrendingUp,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { sendPostRequest } from "@/services/api";
import { routes } from "@/components/Routes/routes";
import { cn } from "@/lib/utils";
import { getVerseText } from "@/utilities/bibleUtils";
import { useLanguage } from "@/components/languages/languageProvider";

interface JournalEntry {
  id: number;
  title: string | null;
  content: string;
  bookName: string | null;
  chapter: number | null;
  verseNumber: number | null;
  category: string;
  mood: string | null;
  prayers: string | null;
  gratitude: string | null;
  learnings: string | null;
  application: string | null;
  isPublished: boolean;
  isFavorite: boolean;
  tags: string | null;
  createdOn: string;
  updatedOn: string;
}

interface JournalStats {
  totalEntries: number;
  favoriteCount: number;
  categoryBreakdown: { category: string; count: number }[];
  recentEntries: { id: number; title: string; category: string; createdOn: string }[];
  entriesThisMonth: number;
  entriesThisWeek: number;
}

const MOOD_EMOJIS: Record<string, string> = {
  happy: "😊",
  grateful: "🙏",
  peaceful: "🕊️",
  thoughtful: "🤔",
  motivated: "💪",
  hopeful: "🌟",
  challenged: "🧗",
  blessed: "✨",
};

const MOODS = [
  { value: "happy", key: "moodHappy", emoji: "😊" },
  { value: "grateful", key: "moodGrateful", emoji: "🙏" },
  { value: "peaceful", key: "moodPeaceful", emoji: "🕊️" },
  { value: "thoughtful", key: "moodThoughtful", emoji: "🤔" },
  { value: "motivated", key: "moodMotivated", emoji: "💪" },
  { value: "hopeful", key: "moodHopeful", emoji: "🌟" },
  { value: "challenged", key: "moodChallenged", emoji: "🧗" },
  { value: "blessed", key: "moodBlessed", emoji: "✨" },
];

const CATEGORIES = [
  { value: "all", key: "categoryAll" },
  { value: "general", key: "categoryGeneral" },
  { value: "study", key: "categoryStudy" },
  { value: "prayer", key: "categoryPrayer" },
  { value: "gratitude", key: "categoryGratitude" },
  { value: "reflection", key: "categoryReflection" },
  { value: "application", key: "categoryApplication" },
];

function getMoodLabel(t: any, moodKey: string | null): string {
  if (!moodKey) return "";
  const mood = MOODS.find((m) => m.value === moodKey);
  if (!mood) return moodKey;
  return (t.journal as any)?.[mood.key] || moodKey;
}

function getCategoryLabel(t: any, catValue: string): string {
  if (catValue === "all") return t.journal?.categoryAll || "All Categories";
  const cat = CATEGORIES.find((c) => c.value === catValue);
  if (!cat) return catValue;
  return (t.journal as any)?.[cat.key] || catValue;
}

const Journal = () => {
  const { t, isRtl } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [stats, setStats] = useState<JournalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);

  const [deleteDialog, setDeleteDialog] = useState<JournalEntry | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchEntries();
    fetchStats();
  }, [page, search, category]);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const payload: Record<string, unknown> = { page, pageSize: 12 };
      if (search) payload.search = search;
      if (category !== "all") payload.category = category;

      const res = await sendPostRequest("journal", "get-all", payload);
      if (res.returnCode === 200 && res.returnData) {
        setEntries(res.returnData.entries || []);
        setTotalPages(res.returnData.totalPages || 0);
        setHasNext(res.returnData.hasNext || false);
        setHasPrevious(res.returnData.hasPrevious || false);
      }
    } catch (error) {
      console.error("Error fetching entries:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await sendPostRequest("journal", "stats", {});
      if (res.returnCode === 200 && res.returnData) {
        setStats(res.returnData);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog) return;
    setDeleting(true);
    try {
      const res = await sendPostRequest("journal", "delete", { id: deleteDialog.id });
      if (res.returnCode === 200) {
        toast({ title: t.common?.delete || "Deleted", description: t.journal?.entryDeleted || "Journal entry deleted" });
        setDeleteDialog(null);
        fetchEntries();
        fetchStats();
      }
    } catch (error) {
      toast({ title: t.common?.error || "Error", description: t.journal?.failedToDelete || "Failed to delete", variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleFavorite = async (entry: JournalEntry) => {
    try {
      const res = await sendPostRequest("journal", "toggle-favorite", { id: entry.id });
      if (res.returnCode === 200) {
        setEntries((prev) =>
          prev.map((e) => (e.id === entry.id ? { ...e, isFavorite: !e.isFavorite } : e)),
        );
        fetchStats();
      }
    } catch (error) {
      toast({ title: t.common?.error || "Error", description: t.journal?.failedToUpdate || "Failed to update", variant: "destructive" });
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getMoodEmoji = (mood: string | null) => {
    return (mood && MOOD_EMOJIS[mood]) || "📝";
  };

  const filteredEntries = entries;

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="bg-gradient-to-r from-primary/10 via-accent/5 to-secondary/10 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <PenLine className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{t.journal?.myJournal || "My Journal"}</h1>
                <p className="text-muted-foreground text-sm">
                  {t.journal?.pageSubtitle || "Capture your thoughts, prayers, and insights"}
                </p>
              </div>
            </div>
            <Button
              onClick={() => navigate(routes.newJournalEntry.path)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              {t.journal?.newEntry || "New Entry"}
            </Button>
          </div>
        </div>
      </div>

      {stats && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <PenLine className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.totalEntries}</p>
                    <p className="text-xs text-muted-foreground">{t.journal?.totalEntries || "Total Entries"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Star className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.favoriteCount}</p>
                    <p className="text-xs text-muted-foreground">{t.journal?.favorites || "Favorites"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.entriesThisWeek}</p>
                    <p className="text-xs text-muted-foreground">{t.journal?.thisWeek || "This Week"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.entriesThisMonth}</p>
                    <p className="text-xs text-muted-foreground">{t.journal?.thisMonth || "This Month"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground", isRtl ? "right-3" : "left-3")} />
            <Input
              placeholder={t.journal?.searchEntries || "Search entries..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={cn(isRtl ? "pr-9" : "pl-9")}
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder={t.journal?.promptCategory || "Category"} />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {getCategoryLabel(t, cat.value)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <PenLine className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{t.journal?.noEntriesYet || "No journal entries yet"}</h3>
            <p className="text-muted-foreground mb-4">
              {search || category !== "all"
                ? t.journal?.noEntriesMatch || "No entries match your search"
                : t.journal?.startWriting || "Start writing your first entry!"}
            </p>
            {!search && category === "all" && (
              <Button onClick={() => navigate(routes.newJournalEntry.path)}>
                <Plus className="w-4 h-4 mr-2" />
                {t.journal?.createEntry || "Create Entry"}
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredEntries.map((entry) => (
              <Card
                key={entry.id}
                className={cn(
                  "border-border/50 hover:border-border transition-all cursor-pointer",
                  entry.isFavorite && "ring-1 ring-amber-200",
                )}
                onClick={() => navigate(`/journal/view/${entry.id}`)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getMoodEmoji(entry.mood)}</span>
                      <Badge variant="secondary" className="text-xs">
                        {getCategoryLabel(t, entry.category)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(entry);
                        }}
                      >
                        {entry.isFavorite ? (
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        ) : (
                          <StarOff className="w-4 h-4 text-muted-foreground" />
                        )}
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align={isRtl ? "start" : "end"}>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/journal/view/${entry.id}`);
                            }}
                          >
                            <Edit2 className={cn("w-4 h-4", isRtl ? "ml-2" : "mr-2")} />
                            {t.common?.edit || "Edit"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteDialog(entry);
                            }}
                            className="text-destructive"
                          >
                            <Trash2 className={cn("w-4 h-4", isRtl ? "ml-2" : "mr-2")} />
                            {t.common?.delete || "Delete"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {entry.title && (
                    <h3 className="font-semibold mb-2 line-clamp-1">{entry.title}</h3>
                  )}
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                    {entry.content}
                  </p>
                  {entry.bookName && entry.chapter && entry.verseNumber && (
                    <div className="bg-muted/30 rounded-md p-2 mb-3 text-xs font-serif italic text-muted-foreground border border-border/30">
                      &ldquo;{getVerseText(entry.bookName, Number(entry.chapter), Number(entry.verseNumber)) || ""}&rdquo;
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(entry.createdOn)}
                    </div>
                    {entry.bookName && (
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {entry.bookName} {entry.chapter}:{entry.verseNumber}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <Button
              variant="outline"
              disabled={!hasPrevious}
              onClick={() => setPage((p) => Math.max(p - 1, 0))}
            >
              <ChevronLeft className={cn("w-4 h-4", isRtl ? "ml-2 order-1" : "mr-2")} />
              {t.common?.previous || "Previous"}
            </Button>
            <span className="text-sm text-muted-foreground">
              {t.journal?.pageOf?.replace('{n}', String(page + 1)).replace('{total}', String(totalPages)) || `Page ${page + 1} of ${totalPages}`}
            </span>
            <Button
              variant="outline"
              disabled={!hasNext}
              onClick={() => setPage((p) => p + 1)}
            >
              {t.common?.next || "Next"}
              <ChevronRight className={cn("w-4 h-4", isRtl ? "mr-2" : "ml-2")} />
            </Button>
          </div>
        )}
      </div>

      <Dialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.journal?.deleteDialogTitle || "Delete Journal Entry"}</DialogTitle>
          </DialogHeader>
          <p>{t.journal?.deleteDialogDesc || "Are you sure you want to delete this entry? This action cannot be undone."}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(null)}>
              {t.common?.cancel || "Cancel"}
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {deleting ? (t.journal?.deleting || "Deleting...") : (t.journal?.deleteDialogConfirm || "Delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Journal;
