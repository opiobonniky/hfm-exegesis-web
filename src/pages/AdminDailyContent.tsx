"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Sun,
  SproutIcon,
  BookOpen,
  Plus,
  Search,
  Loader2,
  Trash2,
  Edit2,
  Save,
  X,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  ArrowLeft,
  Lightbulb,
  Check,
  AlertTriangle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Combobox } from "@/components/ui/combobox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format, isSameDay } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { sendPostRequest } from "@/services/api";
import { useLanguage } from "@/components/languages/languageProvider";
import { BIBLE_BOOKS } from "@/data/staticData";
import { BIBLE_VERSIONS } from "@/assets/bibleVersion/json/bibleVersions";
import { getVerseText, setActiveVersion } from "@/utilities/bibleUtils";

interface DailyItem {
  id: number;
  bookName?: string;
  chapter?: number;
  verseNumber?: number;
  title?: string;
  content?: string;
  reflection?: string;
  explanation?: string;
  learnMore?: string;
  passageReference?: string;
  introduction?: string;
  contextSummary?: string;
  teachingBody?: string;
  application?: string;
  prayer?: string;
  tags?: string;
  displayDate: string;
  isPublished: boolean;
  creatorName?: string;
}

type ContentType = "verse" | "devotion" | "exegesis";

// ── Helpers ──

const getChaptersForBook = (book: string): number[] => {
  const chapterCounts: Record<string, number> = {
    Genesis: 50, Exodus: 40, Leviticus: 27, Numbers: 36, Deuteronomy: 34,
    Joshua: 24, Judges: 21, Ruth: 4, "1 Samuel": 31, "2 Samuel": 24,
    "1 Kings": 22, "2 Kings": 25, "1 Chronicles": 29, "2 Chronicles": 36,
    Ezra: 10, Nehemiah: 13, Esther: 10, Job: 42, Psalms: 150, Proverbs: 31,
    Ecclesiastes: 12, "Song of Solomon": 8, Isaiah: 66, Jeremiah: 52,
    Lamentations: 5, Ezekiel: 48, Daniel: 12, Hosea: 14, Joel: 3, Amos: 9,
    Obadiah: 1, Jonah: 4, Micah: 7, Nahum: 3, Habakkuk: 3, Zephaniah: 3,
    Haggai: 2, Zechariah: 14, Malachi: 4,
    Matthew: 28, Mark: 16, Luke: 24, John: 21, Acts: 28, Romans: 16,
    "1 Corinthians": 16, "2 Corinthians": 13, Galatians: 6, Ephesians: 6,
    Philippians: 4, Colossians: 4, "1 Thessalonians": 5, "2 Thessalonians": 3,
    "1 Timothy": 6, "2 Timothy": 4, Titus: 3, Philemon: 1, Hebrews: 13,
    James: 5, "1 Peter": 5, "2 Peter": 3, "1 John": 5, "2 John": 1,
    "3 John": 1, Jude: 1, Revelation: 22,
  };
  return Array.from({ length: chapterCounts[book] || 1 }, (_, i) => i + 1);
};

const getVersesCountForChapter = (book: string, chapter: number): number => {
  const verseCounts: Record<string, number[]> = {
    Psalms: [6,12,8,8,12,10,17,9,20,18,7,8,6,7,5,11,15,50,14,9,13,31,6,10,22,12,14,9,11,12,24,11,22,22,28,12,40,22,13,17,13,11,5,26,17,11,9,14,20,23,19,9,6,7,23,13,11,11,17,12,8,11,22,11,13,20,24,8,5,7,20,23,20,15,10,12,20,14,13,18,16,7,16,12,13,17,5,7,6,16,15,14,5,23,11,13,12,9,9,5,8,28,22,35,45,48,43,13,31,7,10,10,9,8,18,19,2,29,176,7,8,9,4,8,5,6,5,6,8,8,3,18,3,3,21,26,9,8,24,13,10,7,12,15,21,10,20,14,9,6],
  };
  const chapterVerses = verseCounts[book];
  if (chapterVerses && chapter >= 1 && chapter <= chapterVerses.length) {
    return chapterVerses[chapter - 1];
  }
  return 31;
};



// ── Main Component ──

const AdminDailyContent = () => {
  const { t, isRtl } = useLanguage();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("verses");

  const [content, setContent] = useState<DailyItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchDate, setSearchDate] = useState("");

  // Form mode state: null = list view, otherwise show full form
  const [formMode, setFormMode] = useState<ContentType | null>(null);
  const [editItem, setEditItem] = useState<DailyItem | null>(null);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formBook, setFormBook] = useState("");
  const [formChapter, setFormChapter] = useState("");
  const [formVerse, setFormVerse] = useState("");
  const [formReflection, setFormReflection] = useState("");
  const [formExplanation, setFormExplanation] = useState("");
  const [formLearnMore, setFormLearnMore] = useState("");
  const [formPassageRef, setFormPassageRef] = useState("");
  const [formIntro, setFormIntro] = useState("");
  const [formContextSummary, setFormContextSummary] = useState("");
  const [formTeachingBody, setFormTeachingBody] = useState("");
  const [formApplication, setFormApplication] = useState("");
  const [formPrayer, setFormPrayer] = useState("");
  const [formTags, setFormTags] = useState("");
  const [formDate, setFormDate] = useState<Date>(() => {
    const d = new Date();
    d.setHours(8, 0, 0, 0);
    return d;
  });
  const [formTime, setFormTime] = useState("08:00");
  const [formPublished, setFormPublished] = useState(true);

  // Verse text preview
  const [formVerseText, setFormVerseText] = useState<string>("");
  const [formVerseLoading, setFormVerseLoading] = useState(false);

  // Conflict detection
  const [conflictDialog, setConflictDialog] = useState<{
    open: boolean;
    data: any;
    payload: Record<string, any> | null;
  }>({ open: false, data: null, payload: null });

  const [deleteTarget, setDeleteTarget] = useState<DailyItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [verseVersion, setVerseVersion] = useState("BSB");

  // Calendar modifiers – highlight Sundays + special days
  const calendarModifiers = {
    sunday: (date: Date) => date.getDay() === 0,
    special: (date: Date) => date.getDate() === 1,
    today: (date: Date) => isSameDay(date, new Date()),
  };

  const calendarModifiersClassNames = {
    sunday: "text-red-600 dark:text-red-400 font-medium",
    special:
      "after:content-['★'] after:text-yellow-500 after:absolute after:bottom-0.5 after:right-0.5 after:text-[9px]",
    today: "bg-accent text-accent-foreground font-bold rounded-full",
  };

  // ── Sync formTime with formDate ──
  useEffect(() => {
    const hours = formDate.getHours().toString().padStart(2, "0");
    const minutes = formDate.getMinutes().toString().padStart(2, "0");
    setFormTime(`${hours}:${minutes}`);
  }, [formDate]);

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = e.target.value;
    setFormTime(time);
    if (!time) return;
    const [hours, minutes] = time.split(":").map(Number);
    if (isNaN(hours) || isNaN(minutes)) return;
    const newDate = new Date(formDate);
    newDate.setHours(hours, minutes, 0, 0);
    setFormDate(newDate);
  };

  const formChapters = formBook ? getChaptersForBook(formBook) : [];
  const formMaxVerses = formBook && formChapter ? getVersesCountForChapter(formBook, Number(formChapter)) : 0;

  // ── Auto-fetch verse text when book/chapter/verse selected ──
  useEffect(() => {
    if (!formBook || !formChapter || !formVerse) {
      setFormVerseText("");
      return;
    }
    setFormVerseLoading(true);
    setActiveVersion(verseVersion);
    const text = getVerseText(formBook, Number(formChapter), Number(formVerse));
    setFormVerseText(text || "Verse text not found for this reference.");
    setFormVerseLoading(false);
  }, [formBook, formChapter, formVerse, verseVersion]);

  const getAction = useCallback((type: ContentType, action: string) => {
    const isVerse = type === "verse";
    const prefix = isVerse ? "daily-verse" : type === "devotion" ? "daily-devotion" : "daily-exegesis";
    if (isVerse && action === "get-all") return "get-all-daily-verses";
    return `${action}-${prefix}`;
  }, []);

  const loadContent = useCallback(async (type: ContentType, p: number) => {
    setLoading(true);
    try {
      const action = getAction(type, "get-all");
      const res = await sendPostRequest("admin", action, {
        page: p,
        size: 12,
        ...(searchDate ? { startDate: searchDate, endDate: searchDate } : { smartDefault: false }),
      });
      if (res?.returnCode === 200 && res?.returnData) {
        setContent(res.returnData.content || []);
        setTotal(res.returnData.totalElements || 0);
      }
    } catch {
      toast({ title: "Failed to load content", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [searchDate, getAction, toast]);

  useEffect(() => {
    const typeMap: Record<string, ContentType> = { verses: "verse", devotions: "devotion", exegesis: "exegesis" };
    loadContent(typeMap[activeTab] || "verse", page);
  }, [activeTab, page, loadContent]);

  // ── Open form for new/edit ──

  const openForm = (type: ContentType, item?: DailyItem) => {
    setFormMode(type);
    setEditItem(item || null);
    setFormTitle(item?.title || "");
    setFormContent(item?.content || "");
    setFormBook(item?.bookName || "");
    setFormChapter(item?.chapter?.toString() || "");
    setFormVerse(item?.verseNumber?.toString() || "");
    setFormReflection(item?.reflection || "");
    setFormExplanation(item?.explanation || "");
    setFormLearnMore(item?.learnMore || "");
    setFormPassageRef(item?.passageReference || "");
    setFormIntro(item?.introduction || "");
    setFormContextSummary(item?.contextSummary || "");
    setFormTeachingBody(item?.teachingBody || "");
    setFormApplication(item?.application || "");
    setFormPrayer(item?.prayer || "");
    setFormTags(item?.tags || "");
    setFormDate(item?.displayDate ? new Date(item.displayDate) : (() => { const d = new Date(); d.setHours(8,0,0,0); return d; })() );
    setFormPublished(item?.isPublished ?? true);
    if (item?.displayDate) {
      const d = new Date(item.displayDate);
      setFormTime(`${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`);
    }
  };

  const closeForm = () => {
    setFormMode(null);
    setEditItem(null);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const type = formMode!;
      const action = getAction(type, "add");
      const payload: Record<string, any> = { isPublished: formPublished, displayDate: formDate.toISOString().split("T")[0] };

      if (editItem?.id) payload.id = editItem.id;

      if (type === "verse") {
        payload.bookName = formBook;
        payload.chapter = Number(formChapter);
        payload.verseNumber = Number(formVerse);
        payload.explanation = formExplanation;
        payload.reflection = formReflection || null;
        payload.learnMore = formLearnMore || null;
      } else if (type === "devotion") {
        payload.title = formTitle;
        payload.content = formContent;
        payload.bookName = formBook || null;
        payload.chapter = formChapter ? Number(formChapter) : null;
        payload.verseNumber = formVerse ? Number(formVerse) : null;
        payload.displayTime = formDate.toISOString();
      } else {
        payload.title = formTitle;
        payload.passageReference = formPassageRef;
        payload.introduction = formIntro || null;
        payload.contextSummary = formContextSummary || null;
        payload.teachingBody = formTeachingBody;
        payload.application = formApplication || null;
        payload.prayer = formPrayer || null;
        payload.tags = formTags || null;
      }

      const res = await sendPostRequest("admin", action, payload);
      if (res?.returnCode === 200) {
        toast({ title: "Saved successfully" });
        closeForm();
        loadContent(type, 0);
      } else if (res?.returnCode === 409) {
        // Conflict — show the conflict dialog
        setSaving(false);
        setConflictDialog({
          open: true,
          data: res.returnData || {},
          payload,
        });
        return; // Don't set saving to false again in finally
      } else {
        toast({ title: "Save failed", description: res?.returnMessage, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error saving", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleConflictUpdate = async () => {
    if (!conflictDialog.payload) return;
    const type = formMode!;
    const action = getAction(type, "add");
    setSaving(true);
    setConflictDialog({ open: false, data: null, payload: null });
    try {
      // Get the existing item from conflict data and merge with payload
      const existingId = conflictDialog.data?.existing?.id || conflictDialog.data?.conflicts?.[0]?.existing?.id;
      if (!existingId) {
        toast({ title: "Could not resolve conflict — no existing ID found", variant: "destructive" });
        return;
      }
      const res = await sendPostRequest("admin", action, {
        id: existingId,
        ...conflictDialog.payload,
      });
      if (res?.returnCode === 200) {
        toast({ title: "Updated existing entry successfully" });
        closeForm();
        loadContent(type, 0);
      } else {
        toast({ title: "Update failed", description: res?.returnMessage, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error updating", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const type: ContentType = activeTab === "verses" ? "verse" : activeTab === "devotions" ? "devotion" : "exegesis";
      const action = getAction(type, "delete");
      const idKey = type === "verse" ? "verseId" : type === "devotion" ? "devotionId" : "exegesisId";
      const res = await sendPostRequest("admin", action, { [idKey]: deleteTarget.id });
      if (res?.returnCode === 200) {
        toast({ title: "Deleted" });
        setDeleteTarget(null);
        loadContent(type, page);
      } else {
        toast({ title: "Delete failed", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error deleting", variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  // ── Back button ──

  const FormHeader = ({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle: string }) => (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary/[0.04] via-background to-background border-b border-border/50 -mx-4 sm:-mx-6 lg:-mx-8 -mt-4 sm:-mt-6 lg:-mt-8 px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8 pb-6">
      <div className="absolute top-0 right-0 w-72 h-72 bg-primary/[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
      <div className="relative flex items-center gap-4">
        <button
          onClick={closeForm}
          className="w-9 h-9 rounded-xl bg-background/80 backdrop-blur-sm border border-border/40 flex items-center justify-center hover:bg-accent/10 hover:border-accent/30 transition-all duration-200 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </button>
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{editItem ? "Edit" : "New"} {title}</h1>
          <p className="text-sm text-muted-foreground/80">{subtitle}</p>
        </div>
      </div>
    </div>
  );

  // ── Render: Daily Verse Form ──

  const renderVerseForm = () => (
    <div className="min-h-screen bg-background">
      <FormHeader icon={Sun} title="Daily Verse" subtitle="Create a new daily verse with explanation" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <Card className="border-border/40 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-primary/[0.03] to-background pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              Verse Details
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-5">
            {/* Book, Chapter, Verse, Version row */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Book *</Label>
                <Combobox
                  options={BIBLE_BOOKS.map(b => ({ value: b, label: b }))}
                  value={formBook}
                  onChange={v => { setFormBook(v || ""); setFormChapter(""); setFormVerse(""); }}
                  placeholder="Select book"
                  searchPlaceholder="Search books..."
                  width="w-full"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Chapter *</Label>
                <Combobox
                  options={formChapters.map(c => ({ value: String(c), label: String(c) }))}
                  value={formChapter}
                  onChange={v => { setFormChapter(v || ""); setFormVerse(""); }}
                  placeholder="Select chapter"
                  disabled={formChapters.length === 0}
                  width="w-full"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Verse *</Label>
                <Combobox
                  options={formMaxVerses > 0 ? Array.from({ length: formMaxVerses }, (_, i) => i + 1).map(v => ({ value: String(v), label: String(v) })) : []}
                  value={formVerse}
                  onChange={v => setFormVerse(v || "")}
                  placeholder="Select verse"
                  disabled={!formChapter || formMaxVerses === 0}
                  width="w-full"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Translation</Label>
                <Combobox
                  options={BIBLE_VERSIONS.map(v => ({ value: v.id, label: `${v.name} (${v.abbreviation})` }))}
                  value={verseVersion}
                  onChange={v => { if (v) setVerseVersion(v); }}
                  placeholder="Select version"
                  searchPlaceholder="Search translations..."
                  width="w-full"
                />
              </div>
            </div>

            {/* Verse reference preview */}
            {formBook && formChapter && formVerse && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/[0.03] border border-primary/10 text-sm">
                <BookOpen className="w-3.5 h-3.5 text-primary" />
                <span className="font-medium">{formBook} {formChapter}:{formVerse}</span>
              </div>
            )}

            {/* Verse text preview */}
            {formBook && formChapter && formVerse && (
              <div className="space-y-1.5">
                <Label className="flex items-center justify-between text-xs font-semibold">
                  <span>Verse Text Preview</span>
                  <span className="text-[10px] font-mono text-muted-foreground bg-muted/30 px-1.5 py-0.5 rounded">
                    {verseVersion}
                  </span>
                </Label>
                <div className="relative">
                  <Textarea
                    value={formVerseText}
                    readOnly
                    className="min-h-[80px] resize-none text-sm leading-relaxed font-serif text-foreground/85 bg-muted/10 border-border/30 cursor-default"
                    placeholder={formVerseLoading ? "Loading verse text..." : "Select a verse to see the text"}
                  />
                  {formVerseLoading && (
                    <div className="absolute right-3 bottom-3">
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    </div>
                  )}
                  {formVerseText && !formVerseLoading && (
                    <div className="absolute bottom-3 right-3 text-[10px] text-muted-foreground/50 font-mono">
                      {formBook} {formChapter}:{formVerse}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Explanation */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs font-semibold">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                Explanation *
              </Label>
              <Textarea
                value={formExplanation}
                onChange={e => setFormExplanation(e.target.value)}
                placeholder="Write a brief explanation of this verse..."
                rows={4}
                className="resize-none text-sm leading-relaxed"
              />
            </div>

            {/* Reflection */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Reflection</Label>
              <Textarea
                value={formReflection}
                onChange={e => setFormReflection(e.target.value)}
                placeholder="Optional reflection prompt..."
                rows={3}
                className="resize-none text-sm leading-relaxed"
              />
            </div>

            {/* Learn More */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Learn More</Label>
              <Input
                value={formLearnMore}
                onChange={e => setFormLearnMore(e.target.value)}
                placeholder="Reference or link for further reading"
                className="h-9 text-sm"
              />
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Display Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal h-9", !formDate && "text-muted-foreground")}>
                    <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground dark:text-foreground/80" />
                    {formDate ? format(formDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formDate}
                    onSelect={(d: Date | undefined) => {
                      if (d) {
                        const newDate = new Date(d);
                        newDate.setHours(formDate.getHours(), formDate.getMinutes(), 0, 0);
                        setFormDate(newDate);
                      }
                    }}
                    initialFocus
                    modifiers={calendarModifiers}
                    modifiersClassNames={calendarModifiersClassNames}
                    disabled={(date: Date) =>
                      date > new Date("2026-12-31") || date < new Date("2020-01-01")
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Published toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-muted/10">
              <div>
                <p className="text-sm font-medium">Published</p>
                <p className="text-xs text-muted-foreground">Visible to users immediately</p>
              </div>
              <Switch checked={formPublished} onCheckedChange={setFormPublished} />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" onClick={closeForm} className="gap-1.5">
            <X className="w-4 h-4" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !formBook || !formChapter || !formVerse || !formExplanation.trim()} className="gap-1.5">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving..." : editItem ? "Update Verse" : "Add Verse"}
          </Button>
        </div>
      </div>
    </div>
  );

  // ── Render: Daily Devotion Form ──

  const renderDevotionForm = () => (
    <div className="min-h-screen bg-background">
      <FormHeader icon={SproutIcon} title="Daily Devotion" subtitle="Create a new daily devotion with optional Bible reference" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <Card className="border-border/40 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-primary/[0.03] to-background pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <SproutIcon className="w-4 h-4 text-primary" />
              Devotion Details
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-5">
            {/* Title */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Title *</Label>
              <Input value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="Devotion title" className="h-9 text-sm" />
            </div>

            {/* Content */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Content *</Label>
              <Textarea value={formContent} onChange={e => setFormContent(e.target.value)} placeholder="Write the devotion content..." rows={10} className="resize-none text-sm leading-relaxed" />
            </div>

            {/* Optional Bible reference */}
            <div className="rounded-lg border border-border/40 bg-muted/10 p-4 space-y-3">
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold text-muted-foreground">Optional Bible Reference</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-[10px] font-semibold text-muted-foreground">Book</Label>
                  <Combobox
                    options={BIBLE_BOOKS.map(b => ({ value: b, label: b }))}
                    value={formBook}
                    onChange={v => { setFormBook(v || ""); setFormChapter(""); setFormVerse(""); }}
                    placeholder="Select"
                    searchPlaceholder="Search..."
                    width="w-full"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-semibold text-muted-foreground">Chapter</Label>
                  <Combobox
                    options={formChapters.map(c => ({ value: String(c), label: String(c) }))}
                    value={formChapter}
                    onChange={v => { setFormChapter(v || ""); setFormVerse(""); }}
                    placeholder="Ch."
                    disabled={formChapters.length === 0}
                    width="w-full"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-semibold text-muted-foreground">Verse</Label>
                  <Combobox
                    options={formMaxVerses > 0 ? Array.from({ length: formMaxVerses }, (_, i) => i + 1).map(v => ({ value: String(v), label: String(v) })) : []}
                    value={formVerse}
                    onChange={v => setFormVerse(v || "")}
                    placeholder="V."
                    disabled={!formChapter || formMaxVerses === 0}
                    width="w-full"
                  />
                </div>
              </div>
              {formBook && formChapter && formVerse && (
                <p className="text-xs text-muted-foreground">Reference: <span className="font-semibold">{formBook} {formChapter}:{formVerse}</span></p>
              )}
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Display Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal h-9", !formDate && "text-muted-foreground")}>
                      <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground dark:text-foreground/80" />
                      {formDate ? format(formDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formDate}
                      onSelect={(d: Date | undefined) => {
                        if (d) {
                          const newDate = new Date(d);
                          newDate.setHours(formDate.getHours(), formDate.getMinutes(), 0, 0);
                          setFormDate(newDate);
                        }
                      }}
                      initialFocus
                      modifiers={calendarModifiers}
                      modifiersClassNames={calendarModifiersClassNames}
                      disabled={(date: Date) =>
                        date > new Date("2026-12-31") || date < new Date("2020-01-01")
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Display Time</Label>
                <Input
                  type="time"
                  value={formTime}
                  onChange={handleTimeChange}
                  className="h-9 text-sm"
                />
              </div>
            </div>

            {/* Published toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-muted/10">
              <div>
                <p className="text-sm font-medium">Published</p>
                <p className="text-xs text-muted-foreground">Visible to users immediately</p>
              </div>
              <Switch checked={formPublished} onCheckedChange={setFormPublished} />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" onClick={closeForm} className="gap-1.5">
            <X className="w-4 h-4" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !formTitle.trim() || !formContent.trim()} className="gap-1.5">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving..." : editItem ? "Update Devotion" : "Add Devotion"}
          </Button>
        </div>
      </div>
    </div>
  );

  // ── Render: Daily Exegesis Form ──

  const renderExegesisForm = () => (
    <div className="min-h-screen bg-background">
      <FormHeader icon={BookOpen} title="Daily Exegesis" subtitle="Create a new daily exegesis with full teaching content" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <Card className="border-border/40 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-primary/[0.03] to-background pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              Exegesis Content
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-5">
            {/* Title */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Title *</Label>
              <Input value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="Exegesis title" className="h-9 text-sm" />
            </div>

            {/* Passage Reference */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Passage Reference *</Label>
              <Input value={formPassageRef} onChange={e => setFormPassageRef(e.target.value)} placeholder="e.g. John 3:16" className="h-9 text-sm font-mono" />
            </div>

            {/* Introduction */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Introduction</Label>
              <Textarea value={formIntro} onChange={e => setFormIntro(e.target.value)} placeholder="Brief introduction..." rows={3} className="resize-none text-sm leading-relaxed" />
            </div>

            {/* Context Summary */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Context Summary</Label>
              <Textarea value={formContextSummary} onChange={e => setFormContextSummary(e.target.value)} placeholder="Historical and literary context..." rows={3} className="resize-none text-sm leading-relaxed" />
            </div>

            {/* Teaching Body */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Teaching Body *</Label>
              <Textarea value={formTeachingBody} onChange={e => setFormTeachingBody(e.target.value)} placeholder="The main teaching content..." rows={8} className="resize-none text-sm leading-relaxed" />
            </div>

            {/* Application */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Application</Label>
              <Textarea value={formApplication} onChange={e => setFormApplication(e.target.value)} placeholder="How to apply this..." rows={3} className="resize-none text-sm leading-relaxed" />
            </div>

            {/* Prayer */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Prayer</Label>
              <Textarea value={formPrayer} onChange={e => setFormPrayer(e.target.value)} placeholder="Suggested prayer..." rows={3} className="resize-none text-sm leading-relaxed" />
            </div>

            {/* Tags */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Tags</Label>
              <Input value={formTags} onChange={e => setFormTags(e.target.value)} placeholder="faith, grace, salvation (comma-separated)" className="h-9 text-sm" />
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Display Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal h-9", !formDate && "text-muted-foreground")}>
                    <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground dark:text-foreground/80" />
                    {formDate ? format(formDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formDate}
                    onSelect={(d: Date | undefined) => {
                      if (d) {
                        const newDate = new Date(d);
                        newDate.setHours(formDate.getHours(), formDate.getMinutes(), 0, 0);
                        setFormDate(newDate);
                      }
                    }}
                    initialFocus
                    modifiers={calendarModifiers}
                    modifiersClassNames={calendarModifiersClassNames}
                    disabled={(date: Date) =>
                      date > new Date("2026-12-31") || date < new Date("2020-01-01")
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Published toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-muted/10">
              <div>
                <p className="text-sm font-medium">Published</p>
                <p className="text-xs text-muted-foreground">Visible to users immediately</p>
              </div>
              <Switch checked={formPublished} onCheckedChange={setFormPublished} />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" onClick={closeForm} className="gap-1.5">
            <X className="w-4 h-4" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !formTitle.trim() || !formTeachingBody.trim()} className="gap-1.5">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving..." : editItem ? "Update Exegesis" : "Add Exegesis"}
          </Button>
        </div>
      </div>
    </div>
  );

  // ── List View ──

  const renderListItem = (item: DailyItem) => (
    <div key={item.id} className="p-4 border border-border/40 rounded-xl bg-card hover:bg-muted/10 hover:border-primary/20 transition-all duration-200 space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <Badge variant="outline" className="text-[10px] bg-muted/50">
              {item.displayDate ? new Date(item.displayDate).toLocaleDateString() : "—"}
            </Badge>
            {item.isPublished ? (
              <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/40">
                <Check className="w-2.5 h-2.5 mr-0.5" />
                Published
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] bg-muted text-muted-foreground">Draft</Badge>
            )}
          </div>
          {item.title && <p className="font-medium text-sm truncate">{item.title}</p>}
          {item.bookName && <p className="text-xs text-muted-foreground">{item.bookName} {item.chapter}:{item.verseNumber}</p>}
          {item.passageReference && <p className="text-xs text-muted-foreground font-mono">{item.passageReference}</p>}
          {item.creatorName && <p className="text-[10px] text-muted-foreground/60 mt-1">by {item.creatorName}</p>}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => openForm(activeTab === "verses" ? "verse" : activeTab === "devotions" ? "devotion" : "exegesis", item)}><Edit2 className="w-4 h-4 text-foreground/60" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => setDeleteTarget(item)}><Trash2 className="w-4 h-4 text-foreground/60" /></Button>
        </div>
      </div>
    </div>
  );

  const typeLabel = activeTab === "verses" ? "Verse" : activeTab === "devotions" ? "Devotion" : "Exegesis";

  // ── Conflict dialog shared across all views ──
  const ConflictDialog = () => (
    <Dialog open={conflictDialog.open} onOpenChange={o => !o && setConflictDialog({ open: false, data: null, payload: null })}>
      <DialogContent className="sm:max-w-md rounded-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-5 h-5" />
            {formMode === "verse" ? "Verse" : formMode === "devotion" ? "Devotion" : formMode === "exegesis" ? "Exegesis" : "Content"} Already Exists
          </DialogTitle>
          <DialogDescription>
            {(() => {
              const conflict = conflictDialog.data?.conflicts?.[0] || conflictDialog.data;
              const existing = conflict?.existing;
              if (!existing) return "There is a conflict with existing content for this date.";
              const ref = existing.bookName
                ? `${existing.bookName} ${existing.chapter}:${existing.verseNumber}`
                : existing.passageReference || existing.title || "";
              const date = existing.displayDate ? new Date(existing.displayDate).toLocaleDateString() : "";
              if (conflict?.type === "date") {
                return `Another entry already exists for ${date}. Would you like to update it with your new content?`;
              }
              return ref
                ? `The passage ${ref} already has content for ${date}. Would you like to update it?`
                : `Content already exists. Would you like to update the existing entry?`;
            })()}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
          <Button variant="ghost" onClick={() => setConflictDialog({ open: false, data: null, payload: null })} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button onClick={handleConflictUpdate} disabled={saving} className="gap-2 w-full sm:w-auto">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</> : <><Save className="w-4 h-4" /> Update Existing</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // ── If in form mode, render the full form ──

  if (formMode === "verse") return <>{renderVerseForm()}<ConflictDialog /></>;
  if (formMode === "devotion") return <>{renderDevotionForm()}<ConflictDialog /></>;
  if (formMode === "exegesis") return <>{renderExegesisForm()}<ConflictDialog /></>;

  // ── Default List View ──

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/[0.04] via-background to-background border-b border-border/50 -mx-4 sm:-mx-6 lg:-mx-8 -mt-4 sm:-mt-6 lg:-mt-8 px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8 pb-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <CalendarDays className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Daily Content Manager</h1>
            <p className="text-sm text-muted-foreground/80">Manage daily verses, devotions, and exegesis content</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={v => { setActiveTab(v); setPage(0); }}>
        <div className="overflow-x-auto pb-0.5 -mx-1 px-1">
          <TabsList className="inline-flex w-auto gap-1 rounded-xl bg-muted/30 border border-border/40 p-1 backdrop-blur-sm">
            <TabsTrigger value="verses" className="gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-border/50 rounded-lg px-3 py-1.5 text-xs transition-all whitespace-nowrap">
              <Sun className="w-3.5 h-3.5 text-foreground/60" />
              Daily Verses
            </TabsTrigger>
            <TabsTrigger value="devotions" className="gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-border/50 rounded-lg px-3 py-1.5 text-xs transition-all whitespace-nowrap">
              <SproutIcon className="w-3.5 h-3.5 text-foreground/60" />
              Devotions
            </TabsTrigger>
            <TabsTrigger value="exegesis" className="gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-border/50 rounded-lg px-3 py-1.5 text-xs transition-all whitespace-nowrap">
              <BookOpen className="w-3.5 h-3.5 text-foreground/60" />
              Exegesis
            </TabsTrigger>
          </TabsList>
        </div>

        {["verses", "devotions", "exegesis"].map(tab => (
          <TabsContent key={tab} value={tab} className="space-y-4">
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <CardTitle className="text-base">
                    {tab === "verses" ? "Daily Verses" : tab === "devotions" ? "Daily Devotions" : "Daily Exegesis"}
                    <span className="text-muted-foreground font-normal ml-1">({total})</span>
                  </CardTitle>
                  <Button size="sm" onClick={() => openForm(tab === "verses" ? "verse" : tab === "devotions" ? "devotion" : "exegesis")}>
                    <Plus className="w-4 h-4 mr-1.5" />New {typeLabel}
                  </Button>
                </div>
                <div className="flex gap-2 mt-2">
                  <div className="relative flex-1 max-w-[200px]">
                    <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground dark:text-foreground/80" />
                    <Input type="date" value={searchDate} onChange={e => { setSearchDate(e.target.value); setPage(0); }} className="pl-9 h-9 text-sm" />
                  </div>
                  {searchDate && (
                    <Button variant="ghost" size="sm" className="h-9 text-xs" onClick={() => { setSearchDate(""); setPage(0); }}>
                      <X className="w-3 h-3 mr-1" />Clear
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
                  </div>
                ) : content.length === 0 ? (
                  <div className="relative flex flex-col items-center py-16 text-center px-4 overflow-hidden rounded-xl border border-dashed border-border/40 bg-gradient-to-b from-muted/10 to-muted/5">
                    <div className="absolute top-8 w-32 h-32 bg-primary/[0.04] rounded-full blur-3xl" />
                    <div className="relative">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/5 ring-1 ring-primary/10">
                        <CalendarDays className="w-6 h-6 text-primary/60" />
                      </div>
                      <p className="font-semibold">No {tab} found</p>
                      <p className="text-sm text-muted-foreground/70 mt-1 max-w-sm">Create your first entry to get started.</p>
                      <Button variant="default" size="sm" className="mt-4" onClick={() => openForm(tab === "verses" ? "verse" : tab === "devotions" ? "devotion" : "exegesis")}>
                        <Plus className="w-4 h-4 mr-1.5" />Create {typeLabel}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">{content.map(renderListItem)}</div>
                )}
                {total > 12 && (
                  <div className="flex items-center justify-between pt-4 border-t border-border/40 mt-4">
                    <p className="text-xs text-muted-foreground">Page {page + 1} of {Math.ceil(total / 12)}</p>
                    <div className="flex gap-1">
                      <Button variant="outline" size="icon" className="h-7 w-7" disabled={page === 0} onClick={() => setPage(p => p - 1)}><ChevronLeft className="w-3 h-3" /></Button>
                      <Button variant="outline" size="icon" className="h-7 w-7" disabled={(page + 1) * 12 >= total} onClick={() => setPage(p => p + 1)}><ChevronRight className="w-3 h-3" /></Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Delete Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={o => !o && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive"><Trash2 className="w-5 h-5" /> Delete {typeLabel}</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting} className="w-full sm:w-auto">Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleting} className="gap-2 w-full sm:w-auto">
              {deleting ? <><Loader2 className="w-4 h-4 animate-spin" /> Deleting...</> : <><Trash2 className="w-4 h-4" /> Delete</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDailyContent;
