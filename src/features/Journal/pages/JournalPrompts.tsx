import { Lightbulb, Plus, Search, Loader2, Trash2, Edit2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { getBooksByTestament, getChaptersForBook, getVersesCountForChapter } from "@/utilities/bibleUtils";
import { useJournalPrompts } from "../hooks/useJournalPrompts";
import { CATEGORIES, getCategoryLabel } from "../constants";
import { JournalPromptForm } from "../components/JournalPromptForm";

const ALL_BOOKS = getBooksByTestament("Old").concat(getBooksByTestament("New"));

const JournalPrompts = () => {
  const { userInfo } = useAuth();
  const isAdmin = userInfo?.userRole === 1;
  const p = useJournalPrompts(isAdmin);
  const { t, isRtl, prompts, loading, search, setSearch, category, setCategory, filterBook, setFilterBook, filterChapter, setFilterChapter, filterBookSearch, setFilterBookSearch, dialogOpen, setDialogOpen, editingPrompt, formData, setFormData, saving, handleSave, deleteDialog, setDeleteDialog, deleting, handleDelete, chapters, verses, setChapters, setVerses, bookSearch, setBookSearch, openEdit } = p;

  const filteredBooks = ALL_BOOKS.filter((b) => !filterBookSearch || b.toLowerCase().includes(filterBookSearch.toLowerCase()));

  const filteredPrompts = prompts.filter((item) => {
    if (search && !item.prompt.toLowerCase().includes(search.toLowerCase())) return false;
    if (category && item.category !== category) return false;
    if (filterBook && item.bookName !== filterBook) return false;
    if (filterChapter && item.chapter !== Number(filterChapter)) return false;
    return true;
  });

  const handleBookChange = (v: string) => {
    setFormData((prev) => ({ ...prev, bookName: v, chapter: "", verseNumber: "" }));
    if (v) { setChapters(getChaptersForBook(v)); } else { setChapters([]); setVerses([]); }
  };

  const handleChapterChange = (v: string) => {
    setFormData((prev) => ({ ...prev, chapter: v, verseNumber: "" }));
    if (v && formData.bookName) { setVerses(getVersesCountForChapter(formData.bookName, Number(v))); } else { setVerses([]); }
  };

  const handleOpenDialog = (prompt: any) => { openEdit(prompt); };

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <div className="bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-orange-500/10 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center"><Lightbulb className="w-6 h-6 text-amber-600" /></div>
              <div>
                <h1 className="text-2xl font-bold">{t.journal?.promptPageTitle || "Journal Prompts"}</h1>
                <p className="text-muted-foreground text-sm">{t.journal?.promptPageSubtitle || "Create and manage journaling prompts for users"}</p>
              </div>
            </div>
            <Button onClick={() => setDialogOpen(true)} className="gap-2"><Plus className="w-4 h-4" />{t.journal?.addPrompt || "Add Prompt"}</Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder={t.journal?.searchPrompts || "Search prompts..."} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={filterBook} onValueChange={(v) => { setFilterBook(v); setFilterChapter(""); }}>
            <SelectTrigger className="w-full sm:w-36"><SelectValue placeholder="All Books" /></SelectTrigger>
            <SelectContent className="max-h-60">
              <div className="p-2"><Input placeholder="Search books..." value={filterBookSearch} onChange={(e) => setFilterBookSearch(e.target.value)} className="h-8" /></div>
              <SelectItem value="">All Books</SelectItem>
              {filteredBooks.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterChapter} onValueChange={setFilterChapter} disabled={!filterBook}>
            <SelectTrigger className="w-full sm:w-28"><SelectValue placeholder="Ch" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">All</SelectItem>
              {filterBook && getChaptersForBook(filterBook).map((ch) => <SelectItem key={ch} value={String(ch)}>{ch}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.filter((c) => c.value !== "all").map((c) => <SelectItem key={c.value} value={c.value}>{getCategoryLabel(t, c.value)}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : filteredPrompts.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4"><Lightbulb className="w-8 h-8 text-muted-foreground" /></div>
            <h3 className="text-lg font-semibold mb-2">{t.journal?.noPromptsAvailable || "No prompts available"}</h3>
            <p className="text-muted-foreground mb-4">{t.journal?.promptEmptyDesc || "Create prompts to help users journal"}</p>
            <Button onClick={() => setDialogOpen(true)}><Plus className={cn("w-4 h-4", isRtl ? "ml-2" : "mr-2")} />Create Prompt</Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredPrompts.map((prompt) => (
              <Card key={prompt.id} className="border-border/50">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{getCategoryLabel(t, prompt.category)}</Badge>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(prompt)}>
                        <Edit2 className="w-4 h-4 text-muted-foreground hover:text-primary" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteDialog(prompt)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{prompt.prompt}</p>
                  {prompt.description && <p className="text-xs text-muted-foreground mt-2">{prompt.description}</p>}
                  {prompt.bookName && (
                    <div className="mt-3 flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{prompt.bookName} {prompt.chapter}{prompt.verseNumber ? `:${prompt.verseNumber}` : ""}</Badge>
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
                    <span>Order: {prompt.order}</span>
                    <Badge variant="outline" className={prompt.isActive ? "bg-green-50" : ""}>{prompt.isActive ? "Active" : "Inactive"}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <JournalPromptForm open={dialogOpen} onOpenChange={setDialogOpen} editing={!!editingPrompt} formData={formData} setFormData={setFormData}
        saving={saving} handleSave={handleSave} t={t} bookSearch={bookSearch} setBookSearch={setBookSearch}
        dialogFilteredBooks={filteredBooks} handleBookChange={handleBookChange} chapters={chapters} handleChapterChange={handleChapterChange} verses={verses} />

      <Dialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t.journal?.deletePrompt || "Delete Prompt"}</DialogTitle></DialogHeader>
          <p>{t.journal?.deletePromptDesc || "Are you sure you want to delete this prompt?"}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(null)}>{t.common?.cancel || "Cancel"}</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JournalPrompts;
