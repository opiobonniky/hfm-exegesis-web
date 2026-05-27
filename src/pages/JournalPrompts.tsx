import { useState, useEffect } from "react";
import {
  Lightbulb,
  Plus,
  Search,
  Loader2,
  Trash2,
  Edit2,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { sendPostRequest } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { Label } from "@/components/ui/label";
import {
  getBooksByTestament,
  getChaptersForBook,
  getVersesCountForChapter,
} from "@/utilities/bibleUtils";
import { useLanguage } from "@/components/languages/languageProvider";
import { cn } from "@/lib/utils";

interface JournalPrompt {
  id: number;
  prompt: string;
  category: string;
  description: string | null;
  order: number;
  isActive: boolean;
  bookName: string | null;
  chapter: number | null;
  verseNumber: number | null;
  createdOn: string;
}

const CATEGORIES = [
  { value: "all", key: "categoryAll" },
  { value: "general", key: "categoryGeneral" },
  { value: "study", key: "categoryStudy" },
  { value: "prayer", key: "categoryPrayer" },
  { value: "gratitude", key: "categoryGratitude" },
  { value: "reflection", key: "categoryReflection" },
  { value: "application", key: "categoryApplication" },
  { value: "explanation", key: "categoryExplanation" },
];

function getCatLabel(t: any, catValue: string): string {
  const cat = CATEGORIES.find((c) => c.value === catValue);
  if (!cat) return catValue;
  return (t.journal as any)?.[cat.key] || catValue;
}

const JournalPrompts = () => {
  const { userInfo } = useAuth();
  const { toast } = useToast();
  const { t, isRtl } = useLanguage();
  const isAdmin = userInfo?.userRole === 1;

  const [prompts, setPrompts] = useState<JournalPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [filterBook, setFilterBook] = useState("");
  const [filterChapter, setFilterChapter] = useState("");
  const [filterBookSearch, setFilterBookSearch] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<JournalPrompt | null>(null);
  const [formData, setFormData] = useState({
    prompt: "",
    category: "general",
    description: "",
    order: 0,
    isActive: true,
    bookName: "",
    chapter: "",
    verseNumber: "",
  });
  const [saving, setSaving] = useState(false);

  const [deleteDialog, setDeleteDialog] = useState<JournalPrompt | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [books, setBooks] = useState<string[]>([]);
  const [chapters, setChapters] = useState<number[]>([]);
  const [verses, setVerses] = useState<number[]>([]);
  const [bookSearch, setBookSearch] = useState("");

  useEffect(() => {
    if (dialogOpen && books.length === 0) {
      setBooks(getBooksByTestament("Old").concat(getBooksByTestament("New")));
    }
  }, [dialogOpen, books.length]);

  useEffect(() => {
    if (isAdmin) {
      fetchPrompts();
    }
  }, [category]);

  const fetchPrompts = async () => {
    setLoading(true);
    try {
      const payload: Record<string, unknown> = {};
      if (category !== "all") payload.category = category;
      payload.isActive = true;

      const res = await sendPostRequest("journal", "prompts/get-all", payload);
      if (res.returnCode === 200 && res.returnData) {
        setPrompts(res.returnData);
      }
    } catch (error) {
      console.error("Error fetching prompts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (prompt?: JournalPrompt) => {
    if (prompt) {
      setEditingPrompt(prompt);
      setFormData({
        prompt: prompt.prompt,
        category: prompt.category,
        description: prompt.description || "",
        order: prompt.order,
        isActive: prompt.isActive,
        bookName: prompt.bookName || "",
        chapter: prompt.chapter ? String(prompt.chapter) : "",
        verseNumber: prompt.verseNumber ? String(prompt.verseNumber) : "",
      });
      if (prompt.bookName) {
        setChapters(getChaptersForBook(prompt.bookName));
        if (prompt.chapter) {
          setVerses(Array.from({ length: getVersesCountForChapter(prompt.bookName, Number(prompt.chapter)) }, (_, i) => i + 1));
        } else {
          setVerses([]);
        }
      } else {
        setChapters([]);
        setVerses([]);
      }
    } else {
      setEditingPrompt(null);
      setFormData({
        prompt: "",
        category: "general",
        description: "",
        order: prompts.length,
        isActive: true,
        bookName: "",
        chapter: "",
        verseNumber: "",
      });
      setChapters([]);
      setVerses([]);
    }
    setBooks(getBooksByTestament("Old").concat(getBooksByTestament("New")));
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.prompt.trim()) {
      toast({ title: t.common?.error, description: t.journal?.promptRequired, variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        chapter: formData.chapter ? parseInt(formData.chapter) : null,
        verseNumber: formData.verseNumber ? parseInt(formData.verseNumber) : null,
      };

      const endpoint = editingPrompt ? "prompts/update" : "prompts/create";
      
      if (editingPrompt) {
        (payload as any).id = editingPrompt.id;
      }

      const res = await sendPostRequest("journal", endpoint, payload);
      if (res.returnCode === 200) {
        toast({ 
          title: editingPrompt ? t.journal?.promptUpdated : t.journal?.promptCreated,
        });
        setDialogOpen(false);
        fetchPrompts();
      }
    } catch (error) {
      toast({ title: t.common?.error, description: t.journal?.failedToSavePrompt, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog) return;
    setDeleting(true);
    try {
      const res = await sendPostRequest("journal", "prompts/delete", { id: deleteDialog.id });
      if (res.returnCode === 200) {
        toast({ title: t.journal?.promptDeleted });
        setDeleteDialog(null);
        fetchPrompts();
      }
    } catch (error) {
      toast({ title: t.common?.error, description: t.journal?.failedToSavePrompt, variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  const handleBookChange = (book: string) => {
    setFormData((prev) => ({ ...prev, bookName: book, chapter: "", verseNumber: "" }));
    if (book) {
      setChapters(getChaptersForBook(book));
    } else {
      setChapters([]);
    }
    setVerses([]);
  };

  const handleChapterChange = (ch: string) => {
    setFormData((prev) => ({ ...prev, chapter: ch, verseNumber: "" }));
    if (formData.bookName && ch) {
      setVerses(Array.from({ length: getVersesCountForChapter(formData.bookName, parseInt(ch)) }, (_, i) => i + 1));
    } else {
      setVerses([]);
    }
  };

  const filteredPrompts = prompts.filter((p) => {
    if (search && !p.prompt.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterBook && p.bookName !== filterBook) return false;
    if (filterChapter && p.chapter !== parseInt(filterChapter)) return false;
    return true;
  });

  const allBooks = getBooksByTestament("Old").concat(getBooksByTestament("New"));
  const filteredBooks = allBooks.filter(b => 
    b.toLowerCase().includes(filterBookSearch.toLowerCase())
  );
  const dialogFilteredBooks = allBooks.filter(b => 
    b.toLowerCase().includes(bookSearch.toLowerCase())
  );

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="text-center">
          <h2 className="text-xl font-semibold">{t.journal?.accessDenied || "Access Denied"}</h2>
          <p className="text-muted-foreground">{t.journal?.adminAccessRequired || "Admin access required"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-orange-500/10 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <Lightbulb className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{t.journal?.promptPageTitle || "Journal Prompts"}</h1>
                <p className="text-muted-foreground text-sm">
                  {t.journal?.promptPageSubtitle || "Create and manage journaling prompts for users"}
                </p>
              </div>
            </div>
            <Button onClick={() => setDialogOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              {t.journal?.addPrompt || "Add Prompt"}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t.journal?.searchPrompts || "Search prompts..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterBook} onValueChange={(v) => { setFilterBook(v); setFilterChapter(""); }}>
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue placeholder={t.journal?.filterAllBooks || "All Books"} />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              <div className="p-2">
                <Input
                  placeholder={t.journal?.searchPrompts || "Search books..."}
                  value={filterBookSearch}
                  onChange={(e) => setFilterBookSearch(e.target.value)}
                  className="h-8"
                />
              </div>
              <SelectItem value="">{t.journal?.filterAllBooks || "All Books"}</SelectItem>
              {filteredBooks.map((b) => (
                <SelectItem key={b} value={b}>{b}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterChapter} onValueChange={setFilterChapter} disabled={!filterBook}>
            <SelectTrigger className="w-full sm:w-28">
              <SelectValue placeholder={t.journal?.anyChapter || "Ch"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{t.journal?.categoryAll || "All"}</SelectItem>
              {filterBook && getChaptersForBook(filterBook).map((ch) => (
                <SelectItem key={ch} value={String(ch)}>{ch}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder={t.journal?.promptCategory || "Category"} />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.filter(c => c.value !== "all").map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {getCatLabel(t, cat.value)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredPrompts.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <Lightbulb className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{t.journal?.noPromptsAvailable || "No prompts available"}</h3>
            <p className="text-muted-foreground mb-4">
              {t.journal?.promptEmptyDesc || "Create prompts to help users journal"}
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className={cn("w-4 h-4", isRtl ? "ml-2" : "mr-2")} />
              {t.journal?.createPrompt || "Create Prompt"}
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredPrompts.map((prompt) => (
              <Card key={prompt.id} className="border-border/50">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{getCatLabel(t, prompt.category)}</Badge>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleOpenDialog(prompt)}
                      >
                        <Edit2 className="w-4 h-4 text-muted-foreground hover:text-primary" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setDeleteDialog(prompt)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{prompt.prompt}</p>
                  {prompt.description && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {prompt.description}
                    </p>
                  )}
                  {prompt.bookName && (
                    <div className="mt-3 flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {prompt.bookName} {prompt.chapter}{prompt.verseNumber ? `:${prompt.verseNumber}` : ''}
                      </Badge>
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
                    <span>{(t.journal?.order || "Order:").replace("{n}", String(prompt.order))}</span>
                    <Badge variant="outline" className={prompt.isActive ? "bg-green-50" : ""}>
                      {prompt.isActive ? t.common?.active : t.common?.inactive}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingPrompt ? t.journal?.editPromptDialog || "Edit Journal Prompt" : t.journal?.addPromptDialog || "Add Journal Prompt"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label>{t.journal?.promptText || "Prompt Text *"}</Label>
              <Textarea
                placeholder={t.journal?.promptText || "Enter your prompt question..."}
                value={formData.prompt}
                onChange={(e) => setFormData((p) => ({ ...p, prompt: e.target.value }))}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t.journal?.promptCategory || "Category"}</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) => setFormData((p) => ({ ...p, category: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.filter(c => c.value !== "all").map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {getCatLabel(t, cat.value)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t.journal?.displayOrder || "Display Order"}</Label>
                <Input
                  type="number"
                  value={formData.order}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, order: parseInt(e.target.value) || 0 }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t.journal?.descriptionOptional || "Description (optional)"}</Label>
              <Input
                placeholder={t.journal?.descriptionOptional || "Brief description for this prompt..."}
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              />
            </div>

            <div className="border-t pt-4">
              <Label className="mb-2 block">{t.journal?.scriptureReference || "Scripture Reference (optional)"}</Label>
              <p className="text-xs text-muted-foreground mb-3">
                {t.journal?.promptPageSubtitle || "Link this prompt to a specific verse"}
              </p>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs">{t.journal?.allBooks || "Book"}</Label>
                  <Select
                    value={formData.bookName}
                    onValueChange={handleBookChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t.journal?.anyBook || "Any book"} />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      <div className="p-2">
                        <Input
                          placeholder={t.journal?.searchPrompts || "Search books..."}
                          value={bookSearch}
                          onChange={(e) => setBookSearch(e.target.value)}
                          className="h-8"
                        />
                      </div>
                      <SelectItem value="">{t.journal?.anyBook || "Any book"}</SelectItem>
                      {dialogFilteredBooks.map((book) => (
                        <SelectItem key={book} value={book}>
                          {book}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">{t.journal?.chapter || "Chapter"}</Label>
                  <Select
                    value={formData.chapter}
                    onValueChange={handleChapterChange}
                    disabled={!formData.bookName}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t.journal?.anyChapter || "Any"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">{t.journal?.anyChapter || "Any chapter"}</SelectItem>
                      {chapters.map((ch) => (
                        <SelectItem key={ch} value={String(ch)}>
                          {ch}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">{t.journal?.verse || "Verse"}</Label>
                  <Select
                    value={formData.verseNumber}
                    onValueChange={(v) => setFormData((p) => ({ ...p, verseNumber: v }))}
                    disabled={!formData.chapter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t.journal?.anyVerse || "Any"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">{t.journal?.anyVerse || "Any verse"}</SelectItem>
                      {verses.map((v) => (
                        <SelectItem key={v} value={String(v)}>
                          {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {formData.bookName && (
                <p className="text-xs text-muted-foreground mt-2">
                  {t.journal?.promptPageSubtitle || "This prompt will appear when reading"} {formData.bookName}
                  {formData.chapter ? ` ${t.bibleReader?.chapter || "chapter"} ${formData.chapter}` : ""}
                  {formData.verseNumber ? ` ${t.bibleReader?.verse || "verse"} ${formData.verseNumber}` : ""}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={formData.isActive}
                onCheckedChange={(v) => setFormData((p) => ({ ...p, isActive: v }))}
              />
              <Label>{t.journal?.activeVisible || "Active (visible to users)"}</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t.common?.cancel || "Cancel"}
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {editingPrompt ? (t.journal?.editPromptDialog || "Update") : (t.journal?.createPrompt || "Create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.journal?.deletePrompt || "Delete Prompt"}</DialogTitle>
          </DialogHeader>
          <p>{t.journal?.deletePromptDesc || "Are you sure you want to delete this prompt?"}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(null)}>
              {t.common?.cancel || "Cancel"}
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {t.journal?.deletePrompt || "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JournalPrompts;
