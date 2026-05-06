import { useState, useEffect } from "react";
import {
  Lightbulb,
  Plus,
  Search,
  Loader2,
  Trash2,
  Edit2,
  BookOpen,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  { value: "general", label: "General" },
  { value: "study", label: "Bible Study" },
  { value: "prayer", label: "Prayer" },
  { value: "gratitude", label: "Gratitude" },
  { value: "reflection", label: "Reflection" },
  { value: "application", label: "Application" },
  { value: "explanation", label: "Verse Explanation" },
];

const JournalPrompts = () => {
  const { userInfo } = useAuth();
  const { toast } = useToast();
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
      toast({ title: "Error", description: "Prompt is required", variant: "destructive" });
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
        payload.id = editingPrompt.id;
      }

      const res = await sendPostRequest("journal", endpoint, payload);
      if (res.returnCode === 200) {
        toast({ 
          title: editingPrompt ? "Updated" : "Created", 
          description: editingPrompt ? "Prompt updated successfully" : "Prompt created successfully" 
        });
        setDialogOpen(false);
        fetchPrompts();
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to save prompt", variant: "destructive" });
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
        toast({ title: "Deleted", description: "Prompt deleted" });
        setDeleteDialog(null);
        fetchPrompts();
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Access Denied</h2>
          <p className="text-muted-foreground">Admin access required</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-orange-500/10 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <Lightbulb className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Journal Prompts</h1>
                <p className="text-muted-foreground text-sm">
                  Create and manage journaling prompts for users
                </p>
              </div>
            </div>
            <Button onClick={() => setDialogOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Prompt
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search prompts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterBook} onValueChange={(v) => { setFilterBook(v); setFilterChapter(""); }}>
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue placeholder="All Books" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              <div className="p-2">
                <Input
                  placeholder="Search books..."
                  value={filterBookSearch}
                  onChange={(e) => setFilterBookSearch(e.target.value)}
                  className="h-8"
                />
              </div>
              <SelectItem value="">All Books</SelectItem>
              {filteredBooks.map((b) => (
                <SelectItem key={b} value={b}>{b}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterChapter} onValueChange={setFilterChapter} disabled={!filterBook}>
            <SelectTrigger className="w-full sm:w-28">
              <SelectValue placeholder="Ch" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All</SelectItem>
              {filterBook && getChaptersForBook(filterBook).map((ch) => (
                <SelectItem key={ch} value={String(ch)}>{ch}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full sm:w-40">
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
        ) : filteredPrompts.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <Lightbulb className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No prompts yet</h3>
            <p className="text-muted-foreground mb-4">
              Create prompts to help users journal
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Prompt
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredPrompts.map((prompt) => (
              <Card key={prompt.id} className="border-border/50">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{prompt.category}</Badge>
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
                    <span>Order: {prompt.order}</span>
                    <Badge variant="outline" className={prompt.isActive ? "bg-green-50" : ""}>
                      {prompt.isActive ? "Active" : "Inactive"}
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
            <DialogTitle>{editingPrompt ? "Edit Journal Prompt" : "Add Journal Prompt"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label>Prompt Text *</Label>
              <Textarea
                placeholder="Enter your prompt question... (e.g., What does this verse mean for your life today?)"
                value={formData.prompt}
                onChange={(e) => setFormData((p) => ({ ...p, prompt: e.target.value }))}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) => setFormData((p) => ({ ...p, category: v }))}
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
                <Label>Display Order</Label>
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
              <Label>Description (optional)</Label>
              <Input
                placeholder="Brief description for this prompt..."
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              />
            </div>

            <div className="border-t pt-4">
              <Label className="mb-2 block">Scripture Reference (optional)</Label>
              <p className="text-xs text-muted-foreground mb-3">
                Link this prompt to a specific verse for display during Bible reading or verse explanations
              </p>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs">Book</Label>
                  <Select
                    value={formData.bookName}
                    onValueChange={handleBookChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any book" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      <div className="p-2">
                        <Input
                          placeholder="Search books..."
                          value={bookSearch}
                          onChange={(e) => setBookSearch(e.target.value)}
                          className="h-8"
                        />
                      </div>
                      <SelectItem value="">Any book</SelectItem>
                      {dialogFilteredBooks.map((book) => (
                        <SelectItem key={book} value={book}>
                          {book}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Chapter</Label>
                  <Select
                    value={formData.chapter}
                    onValueChange={handleChapterChange}
                    disabled={!formData.bookName}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any chapter</SelectItem>
                      {chapters.map((ch) => (
                        <SelectItem key={ch} value={String(ch)}>
                          {ch}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Verse</Label>
                  <Select
                    value={formData.verseNumber}
                    onValueChange={(v) => setFormData((p) => ({ ...p, verseNumber: v }))}
                    disabled={!formData.chapter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any verse</SelectItem>
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
                  This prompt will appear when reading {formData.bookName}
                  {formData.chapter ? ` chapter ${formData.chapter}` : ""}
                  {formData.verseNumber ? ` verse ${formData.verseNumber}` : ""}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={formData.isActive}
                onCheckedChange={(v) => setFormData((p) => ({ ...p, isActive: v }))}
              />
              <Label>Active (visible to users)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {editingPrompt ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Prompt</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this prompt?</p>
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

export default JournalPrompts;