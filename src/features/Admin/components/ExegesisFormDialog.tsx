// ExegesisFormDialog — create/edit daily exegesis dialog
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { BIBLE_BOOKS } from "@/data/staticData";

interface FormState {
  title: string; bookName: string; chapter: string; verseStart: string; verseEnd: string;
  passageReference: string; introduction: string; contextSummary: string;
  teachingBody: string; application: string; prayer: string; tags: string;
  displayDate: string; isPublished: boolean;
}
interface Props {
  open: boolean;
  editItem: any | null;
  form: FormState;
  onFormChange: (updater: (f: FormState) => FormState) => void;
  saving: boolean;
  onSave: () => void;
  onClose: () => void;
}
export function ExegesisFormDialog({ open, editItem, form, onFormChange, saving, onSave, onClose }: Props) {
  const update = (patch: Partial<FormState>) => onFormChange(f => ({ ...f, ...patch }));
  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editItem ? "Edit Exegesis" : "Add New Exegesis"}</DialogTitle>
          <DialogDescription>{editItem ? "Update the daily exegesis content" : "Create a new daily exegesis teaching"}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Title *</Label>
            <Input placeholder="e.g., The Parable of the Sower" value={form.title} onChange={e => update({ title: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Passage Reference *</Label>
            <Input placeholder="e.g., Matthew 13:1-23" value={form.passageReference} onChange={e => update({ passageReference: e.target.value })} />
            <p className="text-xs text-muted-foreground">Or build from components below:</p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Book</Label>
              <Select value={form.bookName} onValueChange={v => update({ bookName: v })}>
                <SelectTrigger><SelectValue placeholder="Select book" /></SelectTrigger>
                <SelectContent>{BIBLE_BOOKS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Chapter</Label>
              <Input type="number" min="1" placeholder="e.g., 13" value={form.chapter} onChange={e => update({ chapter: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Verses</Label>
              <div className="flex items-center gap-2">
                <Input type="number" min="1" placeholder="Start" value={form.verseStart} onChange={e => update({ verseStart: e.target.value })} />
                <span className="text-muted-foreground">–</span>
                <Input type="number" min="1" placeholder="End" value={form.verseEnd} onChange={e => update({ verseEnd: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
            <Label>Display Date</Label>
            <Input type="date" value={form.displayDate} onChange={e => update({ displayDate: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2"><Label>Introduction</Label><Textarea placeholder="Opening context..." value={form.introduction} onChange={e => update({ introduction: e.target.value })} rows={3} /></div>
          <div className="space-y-2"><Label>Context Summary</Label><Textarea placeholder="Historical context..." value={form.contextSummary} onChange={e => update({ contextSummary: e.target.value })} rows={3} /></div>
          <div className="space-y-2"><Label>Teaching Body *</Label><Textarea placeholder="Main teaching..." value={form.teachingBody} onChange={e => update({ teachingBody: e.target.value })} rows={6} className="min-h-[150px]" /></div>
          <div className="space-y-2"><Label>Application</Label><Textarea placeholder="Practical application..." value={form.application} onChange={e => update({ application: e.target.value })} rows={3} /></div>
          <div className="space-y-2"><Label>Prayer</Label><Textarea placeholder="Closing prayer..." value={form.prayer} onChange={e => update({ prayer: e.target.value })} rows={3} /></div>
          <div className="space-y-2"><Label>Tags (comma-separated)</Label><Input placeholder="parable, teaching, kingdom" value={form.tags} onChange={e => update({ tags: e.target.value })} /></div>
          <div className="flex items-center justify-between">
            <div><Label>Published</Label><p className="text-sm text-muted-foreground">Make this exegesis visible to users</p></div>
            <Switch checked={form.isPublished} onCheckedChange={v => update({ isPublished: v })} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onSave} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {editItem ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
