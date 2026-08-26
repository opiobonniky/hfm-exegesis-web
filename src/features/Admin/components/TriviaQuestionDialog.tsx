import { Loader2, Save, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DIFFICULTY_OPTIONS, CATEGORY_OPTIONS } from "../constants";

interface Props {
  open: boolean; onOpenChange: (open: boolean) => void; form: any;
  onFormChange: (updater: (f: any) => any) => void; optionsArray: string[];
  onOptionsChange: (opts: string[]) => void; saving: boolean; onSave: () => void;
}
export function TriviaQuestionDialog({ open, onOpenChange, form, onFormChange, optionsArray, onOptionsChange, saving, onSave }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90dvh] overflow-y-auto rounded-xl">
        <DialogHeader>
          <DialogTitle>{form.id ? "Edit Question" : "New Question"}</DialogTitle>
          <DialogDescription>{form.id ? "Update the trivia question details" : "Create a new Bible trivia question"}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5"><Label>Question *</Label><Textarea value={form.question || ""} onChange={(e) => onFormChange((f) => ({ ...f, question: e.target.value }))} rows={2} /></div>
          <div className="space-y-2">
            <Label>Answer Options *</Label>
            {optionsArray.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs font-bold w-5">{String.fromCharCode(65 + i)}.</span>
                <Input value={opt} onChange={(e) => { const next = [...optionsArray]; next[i] = e.target.value; onOptionsChange(next); }} className="flex-1" />
                {form.correctAnswer === i && <BadgeCheck className="w-5 h-5 text-emerald-500" />}
              </div>
            ))}
            <Select value={String(form.correctAnswer ?? 0)} onValueChange={(v) => onFormChange((f) => ({ ...f, correctAnswer: Number(v) }))}>
              <SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{optionsArray.map((_, i) => <SelectItem key={i} value={String(i)}>Option {String.fromCharCode(65 + i)}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Explanation</Label><Textarea value={form.explanation || ""} onChange={(e) => onFormChange((f) => ({ ...f, explanation: e.target.value }))} rows={2} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Book</Label><Input value={form.bookName || ""} onChange={(e) => onFormChange((f) => ({ ...f, bookName: e.target.value }))} /></div>
            <div><Label>Chapter</Label><Input type="number" value={form.chapter ?? ""} onChange={(e) => onFormChange((f) => ({ ...f, chapter: e.target.value ? Number(e.target.value) : null }))} /></div>
            <div><Label>Verse</Label><Input type="number" value={form.verseNumber ?? ""} onChange={(e) => onFormChange((f) => ({ ...f, verseNumber: e.target.value ? Number(e.target.value) : null }))} /></div>
            <div><Label>Category</Label><Select value={form.category || "general"} onValueChange={(v) => onFormChange((f) => ({ ...f, category: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CATEGORY_OPTIONS.filter((c) => c !== "all").map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
            <div><Label>Difficulty</Label><Select value={form.difficulty || "medium"} onValueChange={(v) => onFormChange((f) => ({ ...f, difficulty: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{DIFFICULTY_OPTIONS.filter((d) => d !== "all").map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select></div>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div><p className="text-sm font-medium">Active</p><p className="text-xs text-muted-foreground">Question will appear in trivia games</p></div>
            <Switch checked={form.isActive ?? true} onCheckedChange={(v) => onFormChange((f) => ({ ...f, isActive: v }))} />
          </div>
        </div>
        <DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button onClick={onSave} disabled={saving}>{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
