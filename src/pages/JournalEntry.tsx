import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Loader2,
  BookOpen,
  Tag,
  Heart,
  Lightbulb,
  Sparkles,
  FileText,
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
import { useLanguage } from "@/components/languages/languageProvider";
import { cn } from "@/lib/utils";

const TESTAMENTS = [
  { value: "Old", labelKey: "oldTestament" },
  { value: "New", labelKey: "newTestament" },
];

// Helper to check testament
const getTestamentForBook = (book: string) => {
  const oldTestamentBooks = getBooksByTestament("Old");
  return oldTestamentBooks.includes(book) ? "Old" : "New";
};

const CATEGORIES = [
  { value: "general", key: "categoryGeneral" },
  { value: "study", key: "categoryStudy" },
  { value: "prayer", key: "categoryPrayer" },
  { value: "gratitude", key: "categoryGratitude" },
  { value: "reflection", key: "categoryReflection" },
  { value: "application", key: "categoryApplication" },
];

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

const MOOD_MAP = Object.fromEntries(MOODS.map(m => [m.value, m]));

function getCategoryLabel(t: any, catValue: string): string {
  const cat = CATEGORIES.find((c) => c.value === catValue);
  if (!cat) return catValue;
  return (t.journal as any)?.[cat.key] || catValue;
}

function getMoodLabel(t: any, moodValue: string): string {
  const mood = MOODS.find((m) => m.value === moodValue);
  if (!mood) return moodValue;
  return (t.journal as any)?.[mood.key] || moodValue;
}

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
  const { t, isRtl } = useLanguage();
  const isEditing = !!entryId && entryId !== "new";
  const isNewEntry = entryId === "new" || !entryId;

  const [testament, setTestament] = useState<string>("");

  const [entry, setEntry] = useState<JournalEntry>(() => {
    if (isNewEntry) {
      const book = searchParams.get("book");
      const chapter = searchParams.get("chapter");
      const verse = searchParams.get("verse");
      const promptText = searchParams.get("promptText");
      return {
        ...DEFAULT_ENTRY,
        bookName: book || "",
        chapter: chapter || "",
        verseNumber: verse || "",
        content: promptText || "",
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
  const [templates, setTemplates] = useState<
    { id: number; name: string; prompts: string[] }[]
  >([]);

  // Word count for content
  const wordCount = useMemo(() => {
    const text = entry.content.trim();
    if (!text) return 0;
    return text.split(/\s+/).length;
  }, [entry.content]);

  useEffect(() => {
    if (isEditing) {
      fetchEntry();
    }
  }, [entryId]);

  // Load all books once
  const allBooks = useMemo(() => {
    return getBooksByTestament("Old").concat(getBooksByTestament("New"));
  }, []);

  // Filter books by testament
  useEffect(() => {
    if (testament) {
      setBooks(getBooksByTestament(testament));
    } else {
      setBooks(allBooks);
    }
  }, [testament, allBooks]);

  useEffect(() => {
    if (entry.bookName) {
      const ch = getChaptersForBook(entry.bookName);
      setChapters(ch);
      // Auto-detect testament when book is selected
      const detected = getTestamentForBook(entry.bookName);
      setTestament(detected);
    }
  }, [entry.bookName]);

  useEffect(() => {
    if (entry.bookName && entry.chapter) {
      const v = getVersesCountForChapter(
        entry.bookName,
        parseInt(entry.chapter),
      );
      setVerses(Array.from({ length: v }, (_, i) => i + 1));
    }
  }, [entry.bookName, entry.chapter]);

  useEffect(() => {
    if (entry.bookName && entry.chapter && entry.verseNumber) {
      const text = getVerseText(
        entry.bookName,
        parseInt(entry.chapter),
        parseInt(entry.verseNumber),
      );
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
      const res = await sendPostRequest("journal", "templates/get-all", {
        isActive: true,
      });
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
      const promptsText = template.prompts
        .map((p, i) => `${i + 1}. ${p}`)
        .join("\n\n");
      setEntry((prev) => ({
        ...prev,
        content: prev.content ? prev.content + "\n\n" + promptsText : promptsText,
      }));
      setShowTemplates(false);
      toast({
        title: t.journal?.templateApplied || "Template Applied",
        description: (t.journal?.templateAppliedDesc || '"{name}" prompts added to your entry.')
          .replace('{name}', template.name),
      });
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
      toast({
        title: t.common?.error || "Error",
        description: t.journal?.failedToLoadEntry || "Failed to load entry",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!entry.content.trim()) {
      toast({
        title: t.common?.error || "Error",
        description: t.journal?.contentRequired || "Content is required",
        variant: "destructive",
      });
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
          title: t.common?.save || "Saved",
          description: isEditing
            ? (t.journal?.entryUpdated || "Entry updated")
            : (t.journal?.entryCreated || "Entry created"),
        });
        navigate(routes.journal.path);
      }
    } catch (error) {
      toast({
        title: t.common?.error || "Error",
        description: t.journal?.failedToSave || "Failed to save",
        variant: "destructive",
      });
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
      <div className="min-h-screen flex items-center justify-center" dir={isRtl ? 'rtl' : 'ltr'}>
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5 border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate(routes.journal.path)}
            >
              <ArrowLeft className={cn("w-4 h-4", isRtl ? "ml-2" : "mr-2")} />
              {t.journal?.backToJournal || "Back to Journal"}
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setShowTemplates(true)}>
                <Sparkles className={cn("w-4 h-4", isRtl ? "ml-2" : "mr-2")} />
                {t.journal?.templates || "Templates"}
              </Button>
              <Button onClick={handleSave} disabled={saving} size="lg" className="gap-2">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                <Save className="w-4 h-4" />
                {saving
                  ? (t.journal?.saving || "Saving...")
                  : (t.journal?.saveEntry || "Save Entry")}
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
                  {t.journal?.journalEntry || "Journal Entry"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{t.journal?.titleOptional || "Title (optional)"}</Label>
                  <Input
                    placeholder={t.journal?.titlePlaceholder || "Give your entry a title..."}
                    value={entry.title}
                    onChange={(e) => updateField("title", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>{t.journal?.whatOnMind || "What's on your mind?"}</Label>
                    <span className="text-xs text-muted-foreground">
                      <FileText className="w-3 h-3 inline mr-1" />
                      {wordCount} {wordCount === 1
                        ? (t.journal?.word || "word")
                        : (t.journal?.words || "words")}
                    </span>
                  </div>
                  <Textarea
                    placeholder={t.journal?.contentPlaceholder || "Write your thoughts, feelings, or reflections..."}
                    value={entry.content}
                    onChange={(e) => updateField("content", e.target.value)}
                    className="min-h-[200px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t.journal?.promptCategory || "Category"}</Label>
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
                            {getCategoryLabel(t, cat.value)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t.journal?.howFeeling || "How are you feeling?"}</Label>
                    <Select
                      value={entry.mood}
                      onValueChange={(v) => updateField("mood", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t.journal?.selectMood || "Select mood"}>
                          {entry.mood && MOOD_MAP[entry.mood] ? (
                            <span>
                              {MOOD_MAP[entry.mood].emoji} {getMoodLabel(t, entry.mood)}
                            </span>
                          ) : (
                            t.journal?.selectMood || "Select mood"
                          )}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {MOODS.map((mood) => (
                          <SelectItem key={mood.value} value={mood.value}>
                            <span className="flex items-center gap-2">
                              <span className="text-lg">{mood.emoji}</span>
                              <span>{getMoodLabel(t, mood.value)}</span>
                            </span>
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
                  {t.journal?.reflectionQuestions || "Reflection Questions"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{t.journal?.whatDidYouLearn || "What did you learn?"}</Label>
                  <Textarea
                    placeholder={t.journal?.learnPlaceholder || "Key insights or revelations from your reading..."}
                    value={entry.learnings}
                    onChange={(e) => updateField("learnings", e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t.journal?.howApply || "How will you apply this?"}</Label>
                  <Textarea
                    placeholder={t.journal?.applyPlaceholder || "How will this change your life or actions?"}
                    value={entry.application}
                    onChange={(e) => updateField("application", e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t.journal?.whatGrateful || "What are you grateful for?"}</Label>
                    <Textarea
                      placeholder={t.journal?.gratPlaceholder || "List your gratitude..."}
                      value={entry.gratitude}
                      onChange={(e) => updateField("gratitude", e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t.journal?.yourPrayers || "Your prayers"}</Label>
                    <Textarea
                      placeholder={t.journal?.prayerPlaceholder || "Prayers and requests..."}
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
                  {t.journal?.linkToScripture || "Link to Scripture"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{t.dailyVerse?.testament || "Testament"}</Label>
                  <Select
                    value={testament}
                    onValueChange={(v) => {
                      setTestament(v);
                      setEntry((prev) => ({
                        ...prev,
                        bookName: "",
                        chapter: "",
                        verseNumber: "",
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t.journal?.selectTestament || "Select testament"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t.journal?.allBooks || "All Books"}</SelectItem>
                      {TESTAMENTS.map((tst) => (
                        <SelectItem key={tst.value} value={tst.value}>
                          {(t.dailyVerse as any)?.[tst.labelKey] || tst.labelKey}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t.dailyVerse?.book || "Book"}</Label>
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
                    disabled={!testament}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t.dailyVerse?.selectBook || "Select book"} />
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
                      <Label>{t.dailyVerse?.chapter || "Chapter"}</Label>
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
                          <SelectValue placeholder={t.dailyVerse?.selectChapter || "Select chapter"} />
                        </SelectTrigger>
                        <SelectContent>
                          {chapters.map((ch) => (
                            <SelectItem key={ch} value={String(ch)}>
                              {`${t.dailyVerse?.chapter || "Chapter"} ${ch}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {entry.chapter && verses.length > 0 && (
                      <div className="space-y-2">
                        <Label>{t.dailyVerse?.verse || "Verse"}</Label>
                        <Select
                          value={entry.verseNumber}
                          onValueChange={(v) =>
                            updateField("verseNumber", v)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t.dailyVerse?.selectVerse || "Select verse"} />
                          </SelectTrigger>
                          <SelectContent>
                            {verses.map((v) => (
                              <SelectItem key={v} value={String(v)}>
                                {`${t.dailyVerse?.verse || "Verse"} ${v}`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {verseText && (
                      <div className="space-y-2">
                        <Label>{t.journal?.versePreview || "Verse Preview"}</Label>
                        <div className="bg-muted/50 rounded-lg p-3 text-sm font-serif leading-relaxed border border-border/50">
                          <p className="italic">"{verseText}"</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            — {entry.bookName} {entry.chapter}:
                            {entry.verseNumber}
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {entry.bookName && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      if (
                        entry.bookName &&
                        entry.chapter &&
                        entry.verseNumber
                      ) {
                        navigate(
                          `/bible-reader?book=${entry.bookName}&chapter=${entry.chapter}`,
                        );
                      }
                    }}
                    disabled={!entry.bookName || !entry.chapter}
                  >
                    {t.journal?.openBibleReader || "Open in Bible Reader"}
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  {t.journal?.additional || "Additional"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{t.journal?.tags || "Tags"}</Label>
                  <Input
                    placeholder={t.journal?.tagsPlaceholder || "comma, separated, tags"}
                    value={entry.tags}
                    onChange={(e) => updateField("tags", e.target.value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>{t.journal?.addToFavorites || "Add to favorites"}</Label>
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
            <DialogTitle>{t.journal?.chooseTemplate || "Choose a Template"}</DialogTitle>
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
                      {(t.journal?.promptsLabel || "{n} prompts").replace("{n}", String(template.prompts.length))}
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
                    <p className="font-semibold">📖 {t.journal?.bibleStudy || "Bible Study"}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.journal?.bibleStudyDesc || "Learnings + Application format"}
                    </p>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="justify-start h-auto py-4"
                  onClick={() => applyTemplate("prayer")}
                >
                  <div className="text-left">
                    <p className="font-semibold">🙏 {t.journal?.prayerJournal || "Prayer Journal"}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.journal?.prayerJournalDesc || "Prayers + Gratitude format"}
                    </p>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="justify-start h-auto py-4"
                  onClick={() => applyTemplate("gratitude")}
                >
                  <div className="text-left">
                    <p className="font-semibold">✨ {t.journal?.gratitudeTitle || "Gratitude"}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.journal?.gratitudeDesc || "Focus on gratitude"}
                    </p>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="justify-start h-auto py-4"
                  onClick={() => applyTemplate("reflection")}
                >
                  <div className="text-left">
                    <p className="font-semibold">💭 {t.journal?.reflectionTitle || "Reflection"}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.journal?.reflectionDesc || "What, So What, Now What"}
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
