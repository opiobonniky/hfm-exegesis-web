import { useState, useEffect } from "react";
import { Loader2, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { format, parseISO } from "date-fns";
import { useLanguage } from "@/components/languages/languageProvider";
import type { EditState } from "../hooks/useDailyDevotionsPage";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editState: EditState | null;
  onChange: (s: EditState) => void;
  onSave: () => void;
  isSaving: boolean;
}

export function DevotionEditDialog({ open, onOpenChange, editState, onChange, onSave, isSaving }: Props) {
  const { t } = useLanguage();
  const [local, setLocal] = useState<EditState | null>(null);
  const [dateVal, setDateVal] = useState<Date>(new Date());

  useEffect(() => {
    if (editState) { setLocal(editState); setDateVal(editState.selectedDate ? new Date(editState.selectedDate) : new Date()); }
  }, [editState]);

  const set = (key: keyof EditState, value: unknown) => {
    if (!local) return;
    setLocal({ ...local, [key]: value });
    onChange({ ...local, [key]: value });
  };

  const handleDateChange = (d: Date | undefined) => {
    if (!d || !local) return;
    const nd = new Date(local.selectedDate || new Date());
    nd.setFullYear(d.getFullYear(), d.getMonth(), d.getDate());
    setDateVal(nd);
    set("selectedDate", nd);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [h, m] = e.target.value.split(":").map(Number);
    if (!local) return;
    const nd = new Date(local.selectedDate || new Date());
    nd.setHours(h, m, 0, 0);
    set("selectedDate", nd);
    set("selectedTime", e.target.value);
  };

  if (!local) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            {t.devotions?.editDevotion || "Edit Daily Devotion"}
          </DialogTitle>
          <DialogDescription>{t.devotions?.editDevotionDesc || "Update the title, content, and optional Bible reference below."}</DialogDescription>
        </DialogHeader>
        <div className="space-y-5 py-2">
          <div className="space-y-2">
            <Label>{t.common?.title || "Title"} *</Label>
            <Input value={local.title} onChange={(e) => set("title", e.target.value)} placeholder={t.devotions?.devotionTitlePlaceholder || "Devotion title..."} />
          </div>
          <div className="space-y-2">
            <Label>{t.common?.content || "Content"} *</Label>
            <Textarea value={local.content} onChange={(e) => set("content", e.target.value)} placeholder={t.devotions?.devotionContentPlaceholder || "Devotion content..."} className="min-h-[200px]" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>{t.dailyVerse?.book || "Book"}</Label>
              <Input value={local.book} onChange={(e) => set("book", e.target.value)} placeholder={t.dailyVerse?.selectBook || "e.g. Psalms"} />
            </div>
            <div className="space-y-1.5">
              <Label>{t.dailyVerse?.chapter || "Chapter"}</Label>
              <Input type="number" value={local.chapter} onChange={(e) => set("chapter", e.target.value)} placeholder={t.dailyVerse?.chapter || "Chapter"} />
            </div>
            <div className="space-y-1.5">
              <Label>{t.dailyVerse?.verse || "Verse"}</Label>
              <Input type="number" value={local.verseNumber} onChange={(e) => set("verseNumber", e.target.value)} placeholder={t.dailyVerse?.verse || "Verse"} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>{t.common?.date || "Date"}</Label>
              <Input type="date" value={format(dateVal, "yyyy-MM-dd")} onChange={(e) => handleDateChange(parseISO(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <Label>{t.common?.time || "Time"}</Label>
              <Input type="time" value={local.selectedTime} onChange={handleTimeChange} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t.common?.cancel || "Cancel"}</Button>
          <Button onClick={onSave} disabled={isSaving} className="gap-2">
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}{t.devotions?.saveChanges || "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
