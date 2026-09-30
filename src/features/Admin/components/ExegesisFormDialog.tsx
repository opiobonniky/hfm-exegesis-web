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
import { tt } from '@/components/languages/hardcodedTranslate';

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
          <DialogTitle>{editItem ? tt("Edit Exegesis") : tt("Add New Exegesis")}</DialogTitle>
          <DialogDescription>{editItem ? tt("Update the daily exegesis content") : tt("Create a new daily exegesis teaching")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>{tt("Title *")}</Label>
            <Input placeholder={tt("e.g., The Parable of the Sower")} value={form.title} onChange={e => update({ title: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>{tt("Passage Reference *")}</Label>
            <Input placeholder={tt("e.g., Matthew 13:1-23")} value={form.passageReference} onChange={e => update({ passageReference: e.target.value })} />
            <p className="text-xs text-muted-foreground">{tt("Or build from components below:")}</p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>{tt("Book")}</Label>
              <Select value={form.bookName} onValueChange={v => update({ bookName: v })}>
                <SelectTrigger><SelectValue placeholder={tt("Select book")} /></SelectTrigger>
                <SelectContent>{BIBLE_BOOKS.map(b => <SelectItem key={b} value={b}>{tt(b)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{tt("Chapter")}</Label>
              <Input type="number" min="1" placeholder="e.g., 13" value={form.chapter} onChange={e => update({ chapter: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>{tt("Verses")}</Label>
              <div className="flex items-center gap-2">
                <Input type="number" min="1" placeholder={tt("Start")} value={form.verseStart} onChange={e => update({ verseStart: e.target.value })} />
                <span className="text-muted-foreground">–</span>
                <Input type="number" min="1" placeholder={tt("End")} value={form.verseEnd} onChange={e => update({ verseEnd: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
            <Label>{tt("Display Date")}</Label>
            <Input type="date" value={form.displayDate} onChange={e => update({ displayDate: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2"><Label>{tt("Introduction")}</Label><Textarea placeholder={tt("Opening context...")} value={form.introduction} onChange={e => update({ introduction: e.target.value })} rows={3} /></div>
          <div className="space-y-2"><Label>{tt("Context Summary")}</Label><Textarea placeholder={tt("Historical context...")} value={form.contextSummary} onChange={e => update({ contextSummary: e.target.value })} rows={3} /></div>
          <div className="space-y-2"><Label>{tt("Teaching Body *")}</Label><Textarea placeholder={tt("Main teaching...")} value={form.teachingBody} onChange={e => update({ teachingBody: e.target.value })} rows={6} className="min-h-[150px]" /></div>
          <div className="space-y-2"><Label>{tt("Application")}</Label><Textarea placeholder={tt("Practical application...")} value={form.application} onChange={e => update({ application: e.target.value })} rows={3} /></div>
          <div className="space-y-2"><Label>{tt("Prayer")}</Label><Textarea placeholder={tt("Closing prayer...")} value={form.prayer} onChange={e => update({ prayer: e.target.value })} rows={3} /></div>
          <div className="space-y-2"><Label>{tt("Tags (comma-separated)")}</Label><Input placeholder={tt("parable, teaching, kingdom")} value={form.tags} onChange={e => update({ tags: e.target.value })} /></div>
          <div className="flex items-center justify-between">
            <div><Label>{tt("Published")}</Label><p className="text-sm text-muted-foreground">{tt("Make this exegesis visible to users")}</p></div>
            <Switch checked={form.isPublished} onCheckedChange={v => update({ isPublished: v })} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{tt("Cancel")}</Button>
          <Button onClick={onSave} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {editItem ? tt("Update") : tt("Create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
