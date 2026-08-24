// TriviaQuestionDialog — create/edit trivia question dialog
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
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: any;
  onFormChange: (updater: (f: any) => any) => void;
  optionsArray: string[];
  onOptionsChange: (opts: string[]) => void;
  saving: boolean;
  onSave: () => void;
}
export function TriviaQuestionDialog({
  open, onOpenChange, form, onFormChange, optionsArray, onOptionsChange, saving, onSave,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={o => !o && onOpenChange(false)}>
      <DialogContent className="sm:max-w-lg max-h-[90dvh] overflow-y-auto rounded-xl">
        <DialogHeader>
          <DialogTitle>{form.id ? "Edit Question" : "New Question"}</DialogTitle>
          <DialogDescription>{form.id ? "Update the trivia question details" : "Create a new Bible trivia question"}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Question *</Label>
            <Textarea value={form.question || ""} onChange={e => onFormChange(f => ({ ...f, question: e.target.value }))}
              placeholder="Enter the trivia question..." rows={2} />
          </div>
            <Label>Answer Options *</Label>
            {optionsArray.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs font-bold text-muted-foreground w-5">{String.fromCharCode(65 + i)}.</span>
                <Input value={opt} onChange={e => { const n = [...optionsArray]; n[i] = e.target.value; onOptionsChange(n); }}
                  placeholder={`Option ${String.fromCharCode(65 + i)}`} className="flex-1" />
                {form.correctAnswer === i && <BadgeCheck className="w-5 h-5 text-emerald-500 shrink-0" />}
              </div>
            ))}
            <Select value={String(form.correctAnswer ?? 0)} onValueChange={v => onFormChange(f => ({ ...f, correctAnswer: Number(v) }))}>
              <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Correct answer" /></SelectTrigger>
              <SelectContent>
                {optionsArray.map((_, i) => (
                  <SelectItem key={i} value={String(i)}>Option {String.fromCharCode(65 + i)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Label>Explanation</Label>
            <Textarea value={form.explanation || ""} onChange={e => onFormChange(f => ({ ...f, explanation: e.target.value }))}
              placeholder="Explain the correct answer..." rows={2} />
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Book</Label>
              <Input value={form.bookName || ""} onChange={e => onFormChange(f => ({ ...f, bookName: e.target.value }))}
                placeholder="e.g. John" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label>Chapter</Label>
                <Input type="number" value={form.chapter ?? ""} onChange={e => onFormChange(f => ({ ...f, chapter: e.target.value ? Number(e.target.value) : null }))} />
                <Label>Verse</Label>
                <Input type="number" value={form.verseNumber ?? ""} onChange={e => onFormChange(f => ({ ...f, verseNumber: e.target.value ? Number(e.target.value) : null }))} />
              <Label>Category</Label>
              <Select value={form.category || "general"} onValueChange={v => onFormChange(f => ({ ...f, category: v }))}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.filter(c => c !== "all").map(c => (
                    <SelectItem key={c} value={c}>{c.replace("-", " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Label>Difficulty</Label>
              <Select value={form.difficulty || "medium"} onValueChange={v => onFormChange(f => ({ ...f, difficulty: v }))}>
                  {DIFFICULTY_OPTIONS.filter(d => d !== "all").map(d => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
          <div className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-muted/20">
            <div>
              <p className="text-sm font-medium">Active</p>
              <p className="text-xs text-muted-foreground">Question will appear in trivia games</p>
            <Switch checked={form.isActive ?? true} onCheckedChange={v => onFormChange(f => ({ ...f, isActive: v }))} />
        </div>
        <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">Cancel</Button>
          <Button onClick={onSave} disabled={saving} className="gap-2 w-full sm:w-auto">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
