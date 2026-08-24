"use client";

import { useState } from "react";
import { Search, BookOpen, Plus, Edit2, Trash2, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { sendPostRequest } from "@/services/api";
import { BIBLE_BOOKS } from "@/data/staticData";
import { Combobox } from "@/components/ui/combobox";
import type { useStudyTools } from "../hooks/useStudyTools";
type StudyToolsState = ReturnType<typeof useStudyTools>;
interface ProloguesTabProps {
  state: StudyToolsState;
}
export default function ProloguesTab({ state }: ProloguesTabProps) {
  const {
    prologues, prologuesLoading, prologueSearch, setPrologueSearch,
    prologueViewMode, setPrologueViewMode, selectedPrologueBook, setSelectedPrologueBook,
    editPrologue, setEditPrologue, prologueSheetOpen, setPrologueSheetOpen, loadPrologues,
  } = state;
  const { toast } = useToast();
  const filteredPrologues = prologueViewMode === "browse" && selectedPrologueBook
    ? prologues.filter((p) => p.bookName === selectedPrologueBook)
    : prologues;
  const handleDelete = async (id: number) => {
    try {
      const res = await sendPostRequest("book-prologues", "admin/delete", { id });
      if (res.returnCode === 200) {
        toast({ title: "Deleted", description: "Prologue deleted" });
        loadPrologues();
      }
    } catch (e) {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    }
  };
  return (
    <div className="space-y-4">
      {/* View toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 rounded-lg border border-border/50 bg-muted/20 p-0.5">
          <button
            onClick={() => setPrologueViewMode("search")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              prologueViewMode === "search" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            <Search className="w-3 h-3 inline mr-1" /> Search
          </button>
            onClick={() => setPrologueViewMode("browse")}
              prologueViewMode === "browse" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
            <BookOpen className="w-3 h-3 inline mr-1" /> Browse by Book
        </div>
      </div>
      {/* Search or browse */}
      {prologueViewMode === "search" ? (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search prologues..."
            value={prologueSearch}
            onChange={(e) => setPrologueSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadPrologues()}
            className="pl-9 h-9 text-sm"
          />
      ) : (
        <Combobox
          options={BIBLE_BOOKS.map((b) => ({ value: b, label: b }))}
          value={selectedPrologueBook}
          onChange={(v) => setSelectedPrologueBook(v || "")}
          placeholder="Select a book to browse"
          width="w-full"
        />
      )}
      {/* List */}
      {prologuesLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
          ))}
      ) : filteredPrologues.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-sm">No prologues found.</p>
        <div className="space-y-2">
          {filteredPrologues.map((p: any) => (
            <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{p.title}</p>
                <p className="text-xs text-muted-foreground">{p.bookName}</p>
              <div className="flex items-center gap-1">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  p.isPublished ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"
                }`}>
                  {p.isPublished ? "Published" : "Draft"}
                </span>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditPrologue(p); setPrologueSheetOpen(true); }}>
                  <Edit2 className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(p.id)}>
                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
            </div>
      {/* Edit sheet */}
      <Sheet open={prologueSheetOpen} onOpenChange={setPrologueSheetOpen}>
        <SheetContent className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{editPrologue ? "Edit Prologue" : "New Prologue"}</SheetTitle>
          </SheetHeader>
          {editPrologue && (
            <PrologueForm
              initial={editPrologue}
              onSave={async (data) => {
                await sendPostRequest("book-prologues", "admin/upsert", { ...data, id: editPrologue.id });
                setPrologueSheetOpen(false);
                loadPrologues();
              }}
              onCancel={() => setPrologueSheetOpen(false)}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
function PrologueForm({ initial, onSave, onCancel }: { initial: any; onSave: (d: any) => Promise<void>; onCancel: () => void }) {
  const [bookName, setBookName] = useState(initial.bookName || "");
  const [title, setTitle] = useState(initial.title || "");
  const [content, setContent] = useState(initial.content || "");
  const [isPublished, setIsPublished] = useState(initial.isPublished ?? false);
  const [saving, setSaving] = useState(false);
  const handleSave = async () => {
    setSaving(true);
    await onSave({ bookName, title, content, isPublished });
    setSaving(false);
    <div className="space-y-4 mt-4">
      <div>
        <label className="text-xs font-semibold text-muted-foreground">Book</label>
          value={bookName}
          onChange={(v) => setBookName(v || "")}
          placeholder="Select book"
        <label className="text-xs font-semibold text-muted-foreground">Title</label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Prologue title" className="h-9 text-sm" />
        <label className="text-xs font-semibold text-muted-foreground">Content</label>
        <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={6} placeholder="Write the prologue..." className="text-sm" />
      <div className="flex items-center gap-2">
        <Switch checked={isPublished} onCheckedChange={setIsPublished} />
        <span className="text-sm">Published</span>
      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={saving || !bookName || !title} className="gap-1">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Save
        </Button>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
