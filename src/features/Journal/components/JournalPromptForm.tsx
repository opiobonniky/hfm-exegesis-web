import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { CATEGORIES, getCategoryLabel } from "../constants";

interface FormData {
  prompt: string; category: string; description: string; order: number;
  bookName: string; chapter: string; verseNumber: string; isActive: boolean;
}
interface Props {
  open: boolean; onOpenChange: (v: boolean) => void;
  editing: boolean; formData: FormData; setFormData: (fn: (p: FormData) => FormData) => void;
  saving: boolean; handleSave: () => void; t: any;
  bookSearch: string; setBookSearch: (v: string) => void;
  dialogFilteredBooks: string[]; handleBookChange: (v: string) => void;
  chapters: number[]; handleChapterChange: (v: string) => void;
  verses: number[];
export function JournalPromptForm({
  open, onOpenChange, editing, formData, setFormData, saving, handleSave, t,
  bookSearch, setBookSearch, dialogFilteredBooks, handleBookChange,
  chapters, handleChapterChange, verses,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editing ? t.journal?.editPromptDialog || "Edit Journal Prompt" : t.journal?.addPromptDialog || "Add Journal Prompt"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="space-y-2">
            <Label>{t.journal?.promptText || "Prompt Text *"}</Label>
            <Textarea placeholder={t.journal?.promptText || "Enter your prompt question..."} value={formData.prompt} onChange={(e) => setFormData((p) => ({ ...p, prompt: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t.journal?.promptCategory || "Category"}</Label>
              <Select value={formData.category} onValueChange={(v) => setFormData((p) => ({ ...p, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.filter((c) => c.value !== "all").map((c) => <SelectItem key={c.value} value={c.value}>{getCategoryLabel(t, c.value)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
              <Label>{t.journal?.displayOrder || "Display Order"}</Label>
              <Input type="number" value={formData.order} onChange={(e) => setFormData((p) => ({ ...p, order: parseInt(e.target.value) || 0 }))} />
            <Label>{t.journal?.descriptionOptional || "Description (optional)"}</Label>
            <Input placeholder="Brief description for this prompt..." value={formData.description} onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))} />
          <div className="border-t pt-4">
            <Label className="mb-2 block">{t.journal?.scriptureReference || "Scripture Reference (optional)"}</Label>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Book</Label>
                <Select value={formData.bookName} onValueChange={handleBookChange}>
                  <SelectTrigger><SelectValue placeholder="Any book" /></SelectTrigger>
                  <SelectContent className="max-h-60">
                    <div className="p-2"><Input placeholder="Search books..." value={bookSearch} onChange={(e) => setBookSearch(e.target.value)} className="h-8" /></div>
                    <SelectItem value="">Any book</SelectItem>
                    {dialogFilteredBooks.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
                <Label className="text-xs">Chapter</Label>
                <Select value={formData.chapter} onValueChange={handleChapterChange} disabled={!formData.bookName}>
                  <SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger>
                  <SelectContent><SelectItem value="">Any chapter</SelectItem>{chapters.map((ch) => <SelectItem key={ch} value={String(ch)}>{ch}</SelectItem>)}</SelectContent>
                <Label className="text-xs">Verse</Label>
                <Select value={formData.verseNumber} onValueChange={(v) => setFormData((p) => ({ ...p, verseNumber: v }))} disabled={!formData.chapter}>
                  <SelectContent><SelectItem value="">Any verse</SelectItem>{verses.map((v) => <SelectItem key={v} value={String(v)}>{v}</SelectItem>)}</SelectContent>
          <div className="flex items-center gap-2">
            <Switch checked={formData.isActive} onCheckedChange={(v) => setFormData((p) => ({ ...p, isActive: v }))} />
            <Label>{t.journal?.activeVisible || "Active (visible to users)"}</Label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t.common?.cancel || "Cancel"}</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            {editing ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
