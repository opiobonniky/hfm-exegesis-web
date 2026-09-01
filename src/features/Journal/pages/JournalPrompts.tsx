// JournalPrompts — thin compositor, no logic in page
import { Lightbulb, Plus, Search, Loader2, Trash2, Edit2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useJournalPrompts } from "../hooks/useJournalPrompts";
import { CATEGORIES, getCategoryLabel } from "../constants";
import { JournalPromptForm } from "../components/JournalPromptForm";

const JournalPrompts = () => {
  const h = useJournalPrompts();

  return (
    <div className="min-h-screen bg-background" dir={h.isRtl ? "rtl" : "ltr"}>
      <div className="bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-orange-500/10 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center"><Lightbulb className="w-6 h-6 text-amber-600" /></div>
              <div>
                <h1 className="text-2xl font-bold">{h.t.journal?.promptPageTitle || "Journal Prompts"}</h1>
                <p className="text-muted-foreground text-sm">{h.t.journal?.promptPageSubtitle || "Create and manage journaling prompts for users"}</p>
              </div>
            </div>
            <Button onClick={() => h.setDialogOpen(true)} className="gap-2"><Plus className="w-4 h-4" />{h.t.journal?.addPrompt || "Add Prompt"}</Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder={h.t.journal?.searchPrompts || "Search prompts..."} value={h.search} onChange={(e) => h.setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={h.filterBook} onValueChange={(v) => { h.setFilterBook(v); h.setFilterChapter(""); }}>
            <SelectTrigger className="w-full sm:w-36"><SelectValue placeholder="All Books" /></SelectTrigger>
            <SelectContent className="max-h-60">
              <div className="p-2"><Input placeholder="Search books..." value={h.filterBookSearch} onChange={(e) => h.setFilterBookSearch(e.target.value)} className="h-8" /></div>
              <SelectItem value="">All Books</SelectItem>
              {h.filteredBooks.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={h.filterChapter} onValueChange={h.setFilterChapter} disabled={!h.filterBook}>
            <SelectTrigger className="w-full sm:w-28"><SelectValue placeholder="Ch" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">All</SelectItem>
              {h.filterBook && h.chapters.map((ch) => <SelectItem key={ch} value={String(ch)}>{ch}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={h.category} onValueChange={h.setCategory}>
            <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.filter((c) => c.value !== "all").map((c) => <SelectItem key={c.value} value={c.value}>{getCategoryLabel(h.t, c.value)}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {h.loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : h.filteredPrompts.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4"><Lightbulb className="w-8 h-8 text-muted-foreground" /></div>
            <h3 className="text-lg font-semibold mb-2">{h.t.journal?.noPromptsAvailable || "No prompts available"}</h3>
            <p className="text-muted-foreground mb-4">{h.t.journal?.promptEmptyDesc || "Create prompts to help users journal"}</p>
            <Button onClick={() => h.setDialogOpen(true)}><Plus className={cn("w-4 h-4", h.isRtl ? "ml-2" : "mr-2")} />Create Prompt</Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {h.filteredPrompts.map((prompt) => (
              <Card key={prompt.id} className="border-border/50">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{getCategoryLabel(h.t, prompt.category)}</Badge>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => h.openEdit(prompt)}>
                        <Edit2 className="w-4 h-4 text-muted-foreground hover:text-primary" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => h.setDeleteDialog(prompt)}>
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

      <JournalPromptForm open={h.dialogOpen} onOpenChange={h.setDialogOpen} editing={!!h.editingPrompt} formData={h.formData} setFormData={h.setFormData}
        saving={h.saving} handleSave={h.handleSave} t={h.t} bookSearch={h.bookSearch} setBookSearch={h.setBookSearch}
        dialogFilteredBooks={h.filteredBooks} handleBookChange={h.handleBookChange} chapters={h.chapters} handleChapterChange={h.handleChapterChange} verses={h.verses} />

      <Dialog open={!!h.deleteDialog} onOpenChange={() => h.setDeleteDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{h.t.journal?.deletePrompt || "Delete Prompt"}</DialogTitle></DialogHeader>
          <p>{h.t.journal?.deletePromptDesc || "Are you sure you want to delete this prompt?"}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => h.setDeleteDialog(null)}>{h.t.common?.cancel || "Cancel"}</Button>
            <Button variant="destructive" onClick={h.handleDelete} disabled={h.deleting}>
              {h.deleting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JournalPrompts;
