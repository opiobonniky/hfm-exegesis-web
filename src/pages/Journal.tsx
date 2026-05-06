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

const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "general", label: "General" },
  { value: "study", label: "Bible Study" },
  { value: "prayer", label: "Prayer" },
  { value: "gratitude", label: "Gratitude" },
  { value: "reflection", label: "Reflection" },
  { value: "application", label: "Application" },
];

const MOODS = [
  { value: "happy", label: "Happy", emoji: "😊" },
  { value: "grateful", label: "Grateful", emoji: "🙏" },
  { value: "peaceful", label: "Peaceful", emoji: "🕊️" },
  { value: "thoughtful", label: "Thoughtful", emoji: "🤔" },
  { value: "motivated", label: "Motivated", emoji: "💪" },
  { value: "hopeful", label: "Hopeful", emoji: "🌟" },
  { value: "challenged", label: "Challenged", emoji: "🧗" },
  { value: "blessed", label: "Blessed", emoji: "✨" },
];

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

const Journal = () => {
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
        toast({ title: "Deleted", description: "Journal entry deleted" });
        setDeleteDialog(null);
        fetchEntries();
        fetchStats();
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
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
      toast({ title: "Error", description: "Failed to update", variant: "destructive" });
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
    const m = MOODS.find((x) => x.value === mood);
    return m?.emoji || "📝";
  };

  const filteredEntries = entries;

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-primary/10 via-accent/5 to-secondary/10 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <PenLine className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">My Journal</h1>
                <p className="text-muted-foreground text-sm">
                  Capture your thoughts, prayers, and insights
                </p>
              </div>
            </div>
            <Button
              onClick={() => navigate(routes.newJournalEntry.path)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              New Entry
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
                    <p className="text-xs text-muted-foreground">Total Entries</p>
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
                    <p className="text-xs text-muted-foreground">Favorites</p>
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
                    <p className="text-xs text-muted-foreground">This Week</p>
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
                    <p className="text-xs text-muted-foreground">This Month</p>
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search entries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
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
            <h3 className="text-lg font-semibold mb-2">No journal entries yet</h3>
            <p className="text-muted-foreground mb-4">
              Start writing your first journal entry
            </p>
            <Button onClick={() => navigate(routes.newJournalEntry.path)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Entry
            </Button>
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
                        {entry.category}
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
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/journal/view/${entry.id}`);
                            }}
                          >
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteDialog(entry);
                            }}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
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
                      "{getVerseText(entry.bookName, Number(entry.chapter), Number(entry.verseNumber)) || ""}"
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
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page + 1} of {totalPages}
            </span>
            <Button
              variant="outline"
              disabled={!hasNext}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </div>

      <Dialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Journal Entry</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this entry? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Journal;