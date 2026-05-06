import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  Star,
  BookOpen,
  Calendar,
  Tag,
  Heart,
  Lightbulb,
  Pencil,
  Trash2,
  Share2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { sendPostRequest } from "@/services/api";
import { routes } from "@/components/Routes/routes";
import { getVerseText } from "@/utilities/bibleUtils";
import { cn } from "@/lib/utils";

const CATEGORIES: Record<string, { label: string; color: string }> = {
  general: { label: "General", color: "bg-gray-100 text-gray-700" },
  study: { label: "Bible Study", color: "bg-blue-100 text-blue-700" },
  prayer: { label: "Prayer", color: "bg-purple-100 text-purple-700" },
  gratitude: { label: "Gratitude", color: "bg-amber-100 text-amber-700" },
  reflection: { label: "Reflection", color: "bg-green-100 text-green-700" },
  application: { label: "Application", color: "bg-indigo-100 text-indigo-700" },
};

const MOODS: Record<string, string> = {
  happy: "😊",
  grateful: "🙏",
  peaceful: "🕊️",
  thoughtful: "🤔",
  motivated: "💪",
  hopeful: "🌟",
  challenged: "🧗",
  blessed: "✨",
};

interface JournalEntryData {
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

const JournalDetailPage = () => {
  const { entryId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [entry, setEntry] = useState<JournalEntryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (entryId) {
      fetchEntry();
    }
  }, [entryId]);

  const fetchEntry = async () => {
    try {
      const res = await sendPostRequest("journal", "get", { id: entryId });
      if (res.returnCode === 200 && res.returnData) {
        setEntry(res.returnData);
      } else {
        toast({ title: "Error", description: "Entry not found", variant: "destructive" });
        navigate(routes.journal.path);
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to load entry", variant: "destructive" });
      navigate(routes.journal.path);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!entry) return;
    const confirmed = window.confirm("Are you sure you want to delete this entry?");
    if (!confirmed) return;

    setDeleting(true);
    try {
      const res = await sendPostRequest("journal", "delete", { id: entry.id });
      if (res.returnCode === 200) {
        toast({ title: "Deleted", description: "Journal entry deleted" });
        navigate(routes.journal.path);
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!entry) return;
    try {
      const res = await sendPostRequest("journal", "toggle-favorite", { id: entry.id });
      if (res.returnCode === 200) {
        setEntry((prev) => prev ? { ...prev, isFavorite: !prev.isFavorite } : null);
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update", variant: "destructive" });
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Entry not found</h2>
          <Button onClick={() => navigate(routes.journal.path)} className="mt-4">
            Back to Journal
          </Button>
        </div>
      </div>
    );
  }

  const verseText = entry.bookName && entry.chapter && entry.verseNumber
    ? getVerseText(entry.bookName, entry.chapter, entry.verseNumber)
    : null;

  const tagsArray = entry.tags ? entry.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5 border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate(routes.journal.path)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Journal
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={handleToggleFavorite}>
                {entry.isFavorite ? (
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                ) : (
                  <Star className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate(`/journal/entry/${entry.id}`)}
              >
                <Pencil className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                className="text-destructive hover:text-destructive"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            {entry.title && (
              <h1 className="text-3xl font-bold mb-2">{entry.title}</h1>
            )}
            <div className="flex items-center gap-3 flex-wrap">
              <Badge className={CATEGORIES[entry.category]?.color || "bg-gray-100"}>
                {CATEGORIES[entry.category]?.label || entry.category}
              </Badge>
              {entry.mood && (
                <span className="text-lg" title={entry.mood}>
                  {MOODS[entry.mood]}
                </span>
              )}
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                {formatDate(entry.createdOn)}
              </div>
            </div>
          </div>
        </div>

        {verseText && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <BookOpen className="w-5 h-5 text-primary mt-1" />
                <div>
                  <p className="font-serif text-lg leading-relaxed italic">
                    "{verseText}"
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    — {entry.bookName} {entry.chapter}:{entry.verseNumber}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Journal Entry</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line text-base leading-relaxed">
              {entry.content}
            </p>
          </CardContent>
        </Card>

        {(entry.learnings || entry.application || entry.gratitude || entry.prayers) && (
          <div className="grid gap-6 md:grid-cols-2">
            {entry.learnings && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    What I Learned
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-line text-sm">{entry.learnings}</p>
                </CardContent>
              </Card>
            )}

            {entry.application && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Pencil className="w-4 h-4 text-indigo-500" />
                    How I'll Apply This
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-line text-sm">{entry.application}</p>
                </CardContent>
              </Card>
            )}

            {entry.gratitude && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-500" />
                    Gratitude
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-line text-sm">{entry.gratitude}</p>
                </CardContent>
              </Card>
            )}

            {entry.prayers && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Star className="w-4 h-4 text-purple-500" />
                    Prayers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-line text-sm">{entry.prayers}</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {tagsArray.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Tags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {tagsArray.map((tag, idx) => (
                  <Badge key={idx} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="text-sm text-muted-foreground text-center pt-4 border-t">
          Last updated: {formatDate(entry.updatedOn)}
        </div>
      </div>
    </div>
  );
};

export default JournalDetailPage;