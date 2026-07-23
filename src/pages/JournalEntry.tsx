import { useState, useEffect, useMemo, type ComponentType, type ReactNode } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Loader2,
  BookOpen,
  Tag,
  Lightbulb,
  Sparkles,
  FileText,
} from "lucide-react";
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
import { useLanguage } from "@/components/languages/languageProvider";

const TESTAMENTS = [
  { value: "Old", labelKey: "oldTestament" },
  { value: "New", labelKey: "newTestament" },
];

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

/* ── Reusable warm card wrapper ── */
function FormCard({ title, icon: Icon, children }: { title: string; icon: ComponentType<{ className?: string }>; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/80 p-5">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-stone-100 dark:border-stone-800/60">
        <div className="w-7 h-7 rounded-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
          <Icon className="w-3.5 h-3.5 text-stone-600 dark:text-stone-400" />
        </div>
        <h2 className="text-sm font-semibold text-stone-800 dark:text-stone-200">{title}</h2>
      </div>
      {children}
    </div>
  );
}

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

  const allBooks = useMemo(() => {
    return getBooksByTestament("Old").concat(getBooksByTestament("New"));
  }, []);

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
        description: (t.journal?.templateAppliedDesc || '\"{name}\" prompts added to your entry.')
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
      <div className="min-h-screen flex items-center justify-center bg-amber-50/30 dark:bg-stone-950" dir={isRtl ? 'rtl' : 'ltr'}>
        <Loader2 className="w-8 h-8 animate-spin text-stone-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50/30 dark:bg-stone-950" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* ═══════ Top Bar ═══════ */}
      <div className="border-b border-stone-200/60 dark:border-stone-800/60 bg-white/50 dark:bg-stone-900/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(routes.journal.path)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              {t.journal?.backToJournal || "Back to Journal"}
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowTemplates(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {t.journal?.templates || "Templates"}
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-stone-800 hover:bg-stone-700 text-white dark:bg-stone-200 dark:hover:bg-stone-300 dark:text-stone-900 transition-all disabled:opacity-50"
              >
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <Save className="w-3.5 h-3.5" />
                {saving
                  ? (t.journal?.saving || "Saving...")
                  : (t.journal?.saveEntry || "Save Entry")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════ Form Content ═══════ */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="grid gap-6 md:grid-cols-3">
          {/* ── Left Column (2/3) ── */}
          <div className="md:col-span-2 space-y-6">

            <FormCard title={t.journal?.journalEntry || "Journal Entry"} icon={BookOpen}>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-stone-700 dark:text-stone-300">{t.journal?.titleOptional || "Title (optional)"}</Label>
                  <Input
                    aria-label={t.journal?.titleOptional || "Entry title"}
                    placeholder={t.journal?.titlePlaceholder || "Give your entry a title..."}
                    value={entry.title}
                    onChange={(e) => updateField("title", e.target.value)}
                    className="rounded-xl border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-sm text-stone-800 dark:text-stone-200"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium text-stone-700 dark:text-stone-300">{t.journal?.whatOnMind || "What's on your mind?"}</Label>
                    <span className="text-[11px] text-stone-400">
                      <FileText className="w-3 h-3 inline mr-1" />
                      {wordCount} {wordCount === 1
                        ? (t.journal?.word || "word")
                        : (t.journal?.words || "words")}
                    </span>
                  </div>
                  <Textarea
                    aria-label={t.journal?.whatOnMind || "Journal content"}
                    placeholder={t.journal?.contentPlaceholder || "Write your thoughts, feelings, or reflections..."}
                    value={entry.content}
                    onChange={(e) => updateField("content", e.target.value)}
                    className="min-h-[200px] rounded-xl border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-sm text-stone-800 dark:text-stone-200"
                    style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-stone-700 dark:text-stone-300">{t.journal?.promptCategory || "Category"}</Label>
                    <Select
                      value={entry.category}
                      onValueChange={(v) => updateField("category", v)}
                    >
                      <SelectTrigger aria-label={t.journal?.promptCategory || "Select category"} className="rounded-xl border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-sm h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-stone-200 dark:border-stone-800">
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {getCategoryLabel(t, cat.value)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-stone-700 dark:text-stone-300">{t.journal?.howFeeling || "How are you feeling?"}</Label>
                    <Select
                      value={entry.mood}
                      onValueChange={(v) => updateField("mood", v)}
                    >
                      <SelectTrigger aria-label={t.journal?.howFeeling || "Select mood"} className="rounded-xl border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-sm h-9">
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
                      <SelectContent className="rounded-xl border-stone-200 dark:border-stone-800">
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
              </div>
            </FormCard>

            <FormCard title={t.journal?.reflectionQuestions || "Reflection Questions"} icon={Lightbulb}>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-stone-700 dark:text-stone-300">{t.journal?.whatDidYouLearn || "What did you learn?"}</Label>
                  <Textarea
                    aria-label={t.journal?.whatDidYouLearn || "What did you learn"}
                    placeholder={t.journal?.learnPlaceholder || "Key insights or revelations from your reading..."}
                    value={entry.learnings}
                    onChange={(e) => updateField("learnings", e.target.value)}
                    className="min-h-[100px] rounded-xl border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-sm text-stone-800 dark:text-stone-200"
                    style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-stone-700 dark:text-stone-300">{t.journal?.howApply || "How will you apply this?"}</Label>
                  <Textarea
                    aria-label={t.journal?.howApply || "How will you apply this"}
                    placeholder={t.journal?.applyPlaceholder || "How will this change your life or actions?"}
                    value={entry.application}
                    onChange={(e) => updateField("application", e.target.value)}
                    className="min-h-[100px] rounded-xl border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-sm text-stone-800 dark:text-stone-200"
                    style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-stone-700 dark:text-stone-300">{t.journal?.whatGrateful || "What are you grateful for?"}</Label>
                    <Textarea
                      aria-label={t.journal?.whatGrateful || "What are you grateful for"}
                      placeholder={t.journal?.gratPlaceholder || "List your gratitude..."}
                      value={entry.gratitude}
                      onChange={(e) => updateField("gratitude", e.target.value)}
                      className="min-h-[100px] rounded-xl border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-sm text-stone-800 dark:text-stone-200"
                      style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-stone-700 dark:text-stone-300">{t.journal?.yourPrayers || "Your prayers"}</Label>
                    <Textarea
                      aria-label={t.journal?.yourPrayers || "Your prayers"}
                      placeholder={t.journal?.prayerPlaceholder || "Prayers and requests..."}
                      value={entry.prayers}
                      onChange={(e) => updateField("prayers", e.target.value)}
                      className="min-h-[100px] rounded-xl border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-sm text-stone-800 dark:text-stone-200"
                      style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
                    />
                  </div>
                </div>
              </div>
            </FormCard>
          </div>

          {/* ── Right Column (1/3) ── */}
          <div className="space-y-6">

            <FormCard title={t.journal?.linkToScripture || "Link to Scripture"} icon={BookOpen}>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-stone-700 dark:text-stone-300">{t.dailyVerse?.testament || "Testament"}</Label>
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
                    <SelectTrigger aria-label={t.dailyVerse?.testament || "Select testament"} className="rounded-xl border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-sm h-9">
                      <SelectValue placeholder={t.journal?.selectTestament || "Select testament"} />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-stone-200 dark:border-stone-800">
                      <SelectItem value="all">{t.journal?.allBooks || "All Books"}</SelectItem>
                      {TESTAMENTS.map((tst) => (
                        <SelectItem key={tst.value} value={tst.value}>
                          {(t.dailyVerse as any)?.[tst.labelKey] || tst.labelKey}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-stone-700 dark:text-stone-300">{t.dailyVerse?.book || "Book"}</Label>
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
                    <SelectTrigger aria-label={t.dailyVerse?.book || "Select book"} className="rounded-xl border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-sm h-9">
                      <SelectValue placeholder={t.dailyVerse?.selectBook || "Select book"} />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-stone-200 dark:border-stone-800">
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
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-stone-700 dark:text-stone-300">{t.dailyVerse?.chapter || "Chapter"}</Label>
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
                        <SelectTrigger aria-label={t.dailyVerse?.chapter || "Select chapter"} className="rounded-xl border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-sm h-9">
                          <SelectValue placeholder={t.dailyVerse?.selectChapter || "Select chapter"} />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-stone-200 dark:border-stone-800">
                          {chapters.map((ch) => (
                            <SelectItem key={ch} value={String(ch)}>
                              {`${t.dailyVerse?.chapter || "Chapter"} ${ch}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {entry.chapter && verses.length > 0 && (
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-stone-700 dark:text-stone-300">{t.dailyVerse?.verse || "Verse"}</Label>
                        <Select
                          value={entry.verseNumber}
                          onValueChange={(v) => updateField("verseNumber", v)}
                        >
                          <SelectTrigger aria-label={t.dailyVerse?.verse || "Select verse"} className="rounded-xl border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-sm h-9">
                            <SelectValue placeholder={t.dailyVerse?.selectVerse || "Select verse"} />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-stone-200 dark:border-stone-800">
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
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-stone-700 dark:text-stone-300">{t.journal?.versePreview || "Verse Preview"}</Label>
                        <div className="rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 border-l-[3px] border-l-amber-400 dark:border-l-amber-600 p-3">
                          <p className="text-sm font-serif italic text-stone-700 dark:text-stone-300 leading-relaxed">
                            &ldquo;{verseText}&rdquo;
                          </p>
                          <p className="text-xs text-stone-400 dark:text-stone-500 mt-1.5">
                            &mdash; {entry.bookName} {entry.chapter}:{entry.verseNumber}
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {entry.bookName && (
                  <button
                    onClick={() => {
                      if (entry.bookName && entry.chapter && entry.verseNumber) {
                        navigate(`/bible-reader?book=${entry.bookName}&chapter=${entry.chapter}`);
                      }
                    }}
                    disabled={!entry.bookName || !entry.chapter}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors disabled:opacity-40"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    {t.journal?.openBibleReader || "Open in Bible Reader"}
                  </button>
                )}
              </div>
            </FormCard>

            <FormCard title={t.journal?.additional || "Additional"} icon={Tag}>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-stone-700 dark:text-stone-300">{t.journal?.tags || "Tags"}</Label>
                  <Input
                    aria-label={t.journal?.tags || "Tags"}
                    placeholder={t.journal?.tagsPlaceholder || "comma, separated, tags"}
                    value={entry.tags}
                    onChange={(e) => updateField("tags", e.target.value)}
                    className="rounded-xl border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-sm text-stone-800 dark:text-stone-200"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <Label className="text-xs font-medium text-stone-700 dark:text-stone-300">{t.journal?.addToFavorites || "Add to favorites"}</Label>
                  <Switch
                    checked={entry.isFavorite}
                    onCheckedChange={(v) => updateField("isFavorite", v)}
                    className="data-[state=checked]:bg-stone-800 dark:data-[state=checked]:bg-stone-200"
                  />
                </div>
              </div>
            </FormCard>
          </div>
        </div>
      </div>

      {/* ═══════ Templates Dialog ═══════ */}
      <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
        <DialogContent className="rounded-2xl border-stone-200 dark:border-stone-800">
          <DialogHeader>
            <DialogTitle className="text-stone-800 dark:text-stone-200">{t.journal?.chooseTemplate || "Choose a Template"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 max-h-[60vh] overflow-y-auto">
            {templates.length > 0 ? (
              templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => {
                    handleApplyTemplate(template.id);
                    setShowTemplates(false);
                  }}
                  className="w-full text-left px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                >
                  <p className="font-semibold text-sm text-stone-800 dark:text-stone-200">{template.name}</p>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    {(t.journal?.promptsLabel || "{n} prompts").replace("{n}", String(template.prompts.length))}
                  </p>
                </button>
              ))
            ) : (
              <>
                {[
                  { id: "study", emoji: "📖", title: t.journal?.bibleStudy || "Bible Study", desc: t.journal?.bibleStudyDesc || "Learnings + Application format" },
                  { id: "prayer", emoji: "🙏", title: t.journal?.prayerJournal || "Prayer Journal", desc: t.journal?.prayerJournalDesc || "Prayers + Gratitude format" },
                  { id: "gratitude", emoji: "✨", title: t.journal?.gratitudeTitle || "Gratitude", desc: t.journal?.gratitudeDesc || "Focus on gratitude" },
                  { id: "reflection", emoji: "💭", title: t.journal?.reflectionTitle || "Reflection", desc: t.journal?.reflectionDesc || "What, So What, Now What" },
                ].map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => applyTemplate(tpl.id)}
                    className="w-full text-left px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                  >
                    <p className="font-semibold text-sm text-stone-800 dark:text-stone-200">
                      {tpl.emoji} {tpl.title}
                    </p>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">{tpl.desc}</p>
                  </button>
                ))}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JournalEntryPage;
