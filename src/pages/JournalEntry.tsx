import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Loader2,
  Star,
  BookOpen,
  Calendar,
  Tag,
  Heart,
  Lightbulb,
  Sparkles,
  Send,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { sendPostRequest } from "@/services/api";
import { routes } from "@/components/Routes/routes";
import {
  getBooksByTestament,
  getChaptersForBook,
  getVersesCountForChapter,
  getVerseText,
} from "@/utilities/bibleUtils";
import { Combobox } from "@/components/ui/combobox";

const TESTAMENTS = [
  { value: "Old", label: "Old Testament" },
  { value: "New", label: "New Testament" },
];

const CATEGORIES = [
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
  id?: number;
  title: string;
  content: string;
  bookName: string;
  chapter: string;
  verseNumber: string;
  category: string;
  mood: string;
  prayers: string;
  gratitude: string;
  learnings: string;
  application: string;
  isFavorite: boolean;
  tags: string;
}

const DEFAULT_ENTRY: JournalEntry = {
  title: "",
  content: "",
  bookName: "",
  chapter: "",
  verseNumber: "",
  category: "general",
  mood: "",
  prayers: "",
  gratitude: "",
  learnings: "",
  application: "",
  isFavorite: false,
  tags: "",
};

const JournalEntryPage = () => {
  const { entryId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const isEditing = !!entryId && entryId !== "new";
  const isNewEntry = entryId === "new" || !entryId;

  const [entry, setEntry] = useState<JournalEntry>(() => {
    if (isNewEntry) {
      const book = searchParams.get("book");
      const chapter = searchParams.get("chapter");
      const verse = searchParams.get("verse");
      return {
        ...DEFAULT_ENTRY,
        bookName: book || "",
        chapter: chapter || "",
        verseNumber: verse || "",
      };
    }
    return DEFAULT_ENTRY;
  });
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  const [books, setBooks] = useState<string[]>([]);
  const [chapters, setChapters] = useState<number[]>([]);
  const [verses, setVerses] = useState<number[]>([]);
  const [verseText, setVerseText] = useState("");
  const [templates, setTemplates] = useState<{ id: number; name: string; prompts: string[] }[]>([]);

  useEffect(() => {
    if (isEditing) {
      fetchEntry();
    }
  }, [entryId]);

  useEffect(() => {
    if (entry.bookName) {
      setBooks(getBooksByTestament("Old").concat(getBooksByTestament("New")));
    }
  }, [entry.bookName]);

  useEffect(() => {
    if (entry.bookName) {
      const ch = getChaptersForBook(entry.bookName);
      setChapters(ch);
    }
  }, [entry.bookName]);

  useEffect(() => {
    if (entry.bookName && entry.chapter) {
      const v = getVersesCountForChapter(entry.bookName, parseInt(entry.chapter));
      setVerses(Array.from({ length: v }, (_, i) => i + 1));
    }
  }, [entry.bookName, entry.chapter]);

  useEffect(() => {
    if (entry.bookName && entry.chapter && entry.verseNumber) {
      const text = getVerseText(entry.bookName, parseInt(entry.chapter), parseInt(entry.verseNumber));
      setVerseText(text || "");
    } else {
      setVerseText("");
    }
  }, [entry.bookName, entry.chapter, entry.verseNumber]);

  useEffect(() => {
    if (isNewEntry) {
      fetchTemplates();
    }
  }, [isNewEntry]);

  const fetchTemplates = async () => {
    try {
      const res = await sendPostRequest("journal", "templates/get-all", { isActive: true });
      if (res.returnCode === 200 && res.returnData) {
        setTemplates(res.returnData);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
    }
  };

  const handleApplyTemplate = (templateId: number) => {
    const template = templates.find((t) => t.id === templateId);
    if (template && template.prompts.length > 0) {
      const promptsText = template.prompts.map((p, i) => `${i + 1}. ${p}`).join("\n\n");
      setEntry((prev) => ({
        ...prev,
        content: prev.content
          ? `${prev.content}\n\n---\n\n${template.name}:\n${promptsText}`
          : `${template.name}:\n${promptsText}`,
      }));
      setShowTemplates(true);
    }
  };

  const fetchEntry = async () => {
    try {
      const res = await sendPostRequest("journal", "get", { id: entryId });
      if (res.returnCode === 200 && res.returnData) {
        const data = res.returnData;
        setEntry({
          title: data.title || "",
          content: data.content || "",
          bookName: data.bookName || "",
          chapter: data.chapter ? String(data.chapter) : "",
          verseNumber: data.verseNumber ? String(data.verseNumber) : "",
          category: data.category || "general",
          mood: data.mood || "",
          prayers: data.prayers || "",
          gratitude: data.gratitude || "",
          learnings: data.learnings || "",
          application: data.application || "",
          isFavorite: data.isFavorite || false,
          tags: data.tags || "",
        });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to load entry", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!entry.content.trim()) {
      toast({ title: "Error", description: "Content is required", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...entry,
        chapter: entry.chapter ? parseInt(entry.chapter) : null,
        verseNumber: entry.verseNumber ? parseInt(entry.verseNumber) : null,
      };

      const endpoint = isEditing ? "update" : "create";
      if (isEditing) {
        payload.id = entryId;
      }

      const res = await sendPostRequest("journal", endpoint, payload);
      if (res.returnCode === 200) {
        toast({
          title: "Saved",
          description: isEditing ? "Entry updated" : "Entry created",
        });
        navigate(routes.journal.path);
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to save", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const applyTemplate = (template: string) => {
    switch (template) {
      case "study":
        setEntry((prev) => ({
          ...prev,
          content: "",
          learnings: "",
          application: "",
          category: "study",
        }));
        break;
      case "prayer":
        setEntry((prev) => ({
          ...prev,
          content: "",
          prayers: "",
          gratitude: "",
          category: "prayer",
        }));
        break;
      case "gratitude":
        setEntry((prev) => ({
          ...prev,
          content: "",
          gratitude: "",
          category: "gratitude",
        }));
        break;
      case "reflection":
        setEntry((prev) => ({
          ...prev,
          content: "",
          learnings: "",
          application: "",
          category: "reflection",
        }));
        break;
    }
    setShowTemplates(false);
  };

  const updateField = (field: keyof JournalEntry, value: unknown) => {
    setEntry((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5 border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate(routes.journal.path)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Journal
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setShowTemplates(true)}>
                <Sparkles className="w-4 h-4 mr-2" />
                Templates
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                <Save className="w-4 h-4 mr-2" />
                Save Entry
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Journal Entry
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Title (optional)</Label>
                  <Input
                    placeholder="Give your entry a title..."
                    value={entry.title}
                    onChange={(e) => updateField("title", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>What's on your mind?</Label>
                  <Textarea
                    placeholder="Write your thoughts, feelings, or reflections..."
                    value={entry.content}
                    onChange={(e) => updateField("content", e.target.value)}
                    className="min-h-[200px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={entry.category}
                      onValueChange={(v) => updateField("category", v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
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
                  <div className="space-y-2">
                    <Label>How are you feeling?</Label>
                    <Select value={entry.mood} onValueChange={(v) => updateField("mood", v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select mood" />
                      </SelectTrigger>
                      <SelectContent>
                        {MOODS.map((mood) => (
                          <SelectItem key={mood.value} value={mood.value}>
                            {mood.emoji} {mood.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  Reflection Questions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>What did you learn?</Label>
                  <Textarea
                    placeholder="Key insights or revelations from your reading..."
                    value={entry.learnings}
                    onChange={(e) => updateField("learnings", e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label>How will you apply this?</Label>
                  <Textarea
                    placeholder="How will this change your life or actions?"
                    value={entry.application}
                    onChange={(e) => updateField("application", e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>What are you grateful for?</Label>
                    <Textarea
                      placeholder="List your gratitude..."
                      value={entry.gratitude}
                      onChange={(e) => updateField("gratitude", e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Your prayers</Label>
                    <Textarea
                      placeholder="Prayers and requests..."
                      value={entry.prayers}
                      onChange={(e) => updateField("prayers", e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Link to Scripture
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Testament</Label>
                  <Select
                    value={entry.bookName ? (getBooksByTestament("Old").includes(entry.bookName) ? "Old" : "New") : ""}
                    onValueChange={(v) => {
                      setEntry((prev) => ({
                        ...prev,
                        bookName: "",
                        chapter: "",
                        verseNumber: "",
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select testament" />
                    </SelectTrigger>
                    <SelectContent>
                      {TESTAMENTS.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {entry.bookName && (
                  <>
                    <div className="space-y-2">
                      <Label>Book</Label>
                      <Select
                        value={entry.bookName}
                        onValueChange={(v) => {
                          setEntry((prev) => ({
                            ...prev,
                            bookName: v,
                            chapter: "",
                            verseNumber: "",
                          }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select book" />
                        </SelectTrigger>
                        <SelectContent>
                          {books.map((book) => (
                            <SelectItem key={book} value={book}>
                              {book}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {entry.bookName && chapters.length > 0 && (
                      <>
                        <div className="space-y-2">
                          <Label>Chapter</Label>
                          <Select
                            value={entry.chapter}
                            onValueChange={(v) => {
                              setEntry((prev) => ({
                                ...prev,
                                chapter: v,
                                verseNumber: "",
                              }));
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select chapter" />
                            </SelectTrigger>
                            <SelectContent>
                              {chapters.map((ch) => (
                                <SelectItem key={ch} value={String(ch)}>
                                  Chapter {ch}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {entry.chapter && verses.length > 0 && (
                          <div className="space-y-2">
                            <Label>Verse</Label>
                            <Select
                              value={entry.verseNumber}
                              onValueChange={(v) => updateField("verseNumber", v)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select verse" />
                              </SelectTrigger>
                              <SelectContent>
                                {verses.map((v) => (
                                  <SelectItem key={v} value={String(v)}>
                                    Verse {v}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        {verseText && (
                          <div className="space-y-2">
                            <Label>Verse Preview</Label>
                            <div className="bg-muted/50 rounded-lg p-3 text-sm font-serif leading-relaxed border border-border/50">
                              <p className="italic">"{verseText}"</p>
                              <p className="text-xs text-muted-foreground mt-2">
                                — {entry.bookName} {entry.chapter}:{entry.verseNumber}
                              </p>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}

                {entry.bookName && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      if (entry.bookName && entry.chapter && entry.verseNumber) {
                        navigate(
                          `/bible-reader?book=${entry.bookName}&chapter=${entry.chapter}`,
                        );
                      }
                    }}
                    disabled={!entry.bookName || !entry.chapter}
                  >
                    Open in Bible Reader
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  Additional
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <Input
                    placeholder="comma, separated, tags"
                    value={entry.tags}
                    onChange={(e) => updateField("tags", e.target.value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Add to favorites</Label>
                  <Switch
                    checked={entry.isFavorite}
                    onCheckedChange={(v) => updateField("isFavorite", v)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Choose a Template</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 max-h-[60vh] overflow-y-auto">
            {templates.length > 0 ? (
              templates.map((template) => (
                <Button
                  key={template.id}
                  variant="outline"
                  className="justify-start h-auto py-4"
                  onClick={() => {
                    handleApplyTemplate(template.id);
                    setShowTemplates(false);
                  }}
                >
                  <div className="text-left">
                    <p className="font-semibold">{template.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {template.prompts.length} prompts
                    </p>
                  </div>
                </Button>
              ))
            ) : (
              <>
                <Button
                  variant="outline"
                  className="justify-start h-auto py-4"
                  onClick={() => applyTemplate("study")}
                >
                  <div className="text-left">
                    <p className="font-semibold">📖 Bible Study</p>
                    <p className="text-xs text-muted-foreground">
                      Learnings + Application format
                    </p>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="justify-start h-auto py-4"
                  onClick={() => applyTemplate("prayer")}
                >
                  <div className="text-left">
                    <p className="font-semibold">🙏 Prayer Journal</p>
                    <p className="text-xs text-muted-foreground">
                      Prayers + Gratitude format
                    </p>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="justify-start h-auto py-4"
                  onClick={() => applyTemplate("gratitude")}
                >
                  <div className="text-left">
                    <p className="font-semibold">✨ Gratitude</p>
                    <p className="text-xs text-muted-foreground">
                      Focus on gratitude
                    </p>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="justify-start h-auto py-4"
                  onClick={() => applyTemplate("reflection")}
                >
                  <div className="text-left">
                    <p className="font-semibold">💭 Reflection</p>
                    <p className="text-xs text-muted-foreground">
                      What, So What, Now What
                    </p>
                  </div>
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JournalEntryPage;