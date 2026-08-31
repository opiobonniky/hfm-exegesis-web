// PrologueFormDialog — full edit/create dialog for book prologues (all fields)
import { Save, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";

export interface PrologueForm {
  bookName: string;
  title: string;
  content: string;
  author: string;
  authorDetail: string;
  audience: string;
  dateWritten: string;
  locationWritten: string;
  purpose: string;
  keyTheme: string;
  summary: string;
  background: string;
  lessons: string;
  chapters: string;
  christConnection: string;
  applications: string[];
  keyScriptureRef: string[];
  keyScriptureText: string[];
  mainThemes: string[];
  keyPeople: string[];
  keyVerses: string[];
  isPublished: boolean;
}

interface Props {
  open: boolean;
  editMode: boolean;
  form: PrologueForm;
  filteredBooks: string[];
  saving: boolean;
  onFormChange: (field: string, value: any) => void;
  onSave: () => void;
  onClose: () => void;
}

export function PrologueFormDialog({
  open, editMode, form, filteredBooks, saving, onFormChange, onSave, onClose,
}: Props) {
  const updateArray = (field: string, index: number, value: string) => {
    const arr = [...(form as any)[field]];
    arr[index] = value;
    onFormChange(field, arr);
  };
  const addArrayItem = (field: string) => onFormChange(field, [...(form as any)[field], ""]);
  const removeArrayItem = (field: string, index: number) => {
    const arr = [...(form as any)[field]];
    arr.splice(index, 1);
    onFormChange(field, arr);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editMode ? "Edit Prologue" : "Add New Prologue"}</DialogTitle>
          <DialogDescription>
            {editMode ? "Update the book prologue" : "Create a new book prologue"}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="py-2">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="basic" className="text-xs">Basic</TabsTrigger>
            <TabsTrigger value="context" className="text-xs">Context</TabsTrigger>
            <TabsTrigger value="themes" className="text-xs">Themes</TabsTrigger>
            <TabsTrigger value="extra" className="text-xs">Extra</TabsTrigger>
          </TabsList>

          {/* Basic Tab */}
          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Book Name *</Label>
              <Input placeholder="e.g. Genesis" value={form.bookName} onChange={(e) => onFormChange("bookName", e.target.value)} />
              {form.bookName && filteredBooks.length > 0 && (
                <div className="border rounded-md max-h-32 overflow-y-auto">
                  {filteredBooks.slice(0, 8).map((book) => (
                    <button key={book} className="w-full px-3 py-1.5 text-sm text-left hover:bg-muted transition-colors"
                      onClick={() => onFormChange("bookName", book)}>{book}</button>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Title *</Label>
              <Input placeholder="e.g. The Gospel of John" value={form.title} onChange={(e) => onFormChange("title", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Summary *</Label>
              <Textarea placeholder="Brief summary of the book..." value={form.summary} onChange={(e) => onFormChange("summary", e.target.value)} rows={3} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Purpose</Label>
              <Textarea placeholder="Why was this book written?" value={form.purpose} onChange={(e) => onFormChange("purpose", e.target.value)} rows={2} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Key Theme</Label>
              <Input placeholder="e.g. Creation, Fall, Redemption" value={form.keyTheme} onChange={(e) => onFormChange("keyTheme", e.target.value)} />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-xs font-semibold">Published</Label>
                <p className="text-xs text-muted-foreground">Make visible to users</p>
              </div>
              <Switch checked={form.isPublished} onCheckedChange={(c) => onFormChange("isPublished", c)} />
            </div>
          </TabsContent>

          {/* Context Tab */}
          <TabsContent value="context" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Author</Label>
                <Input placeholder="e.g. Moses" value={form.author} onChange={(e) => onFormChange("author", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Chapters</Label>
                <Input type="number" min="1" value={form.chapters} onChange={(e) => onFormChange("chapters", e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Author Detail</Label>
              <Textarea placeholder="Background about the author..." value={form.authorDetail} onChange={(e) => onFormChange("authorDetail", e.target.value)} rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Audience</Label>
                <Input placeholder="e.g. Israel, All believers" value={form.audience} onChange={(e) => onFormChange("audience", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Date Written</Label>
                <Input placeholder="e.g. ~1446 BC" value={form.dateWritten} onChange={(e) => onFormChange("dateWritten", e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Location Written</Label>
              <Input placeholder="e.g. Sinai Wilderness" value={form.locationWritten} onChange={(e) => onFormChange("locationWritten", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Background</Label>
              <Textarea placeholder="Historical and cultural context..." value={form.background} onChange={(e) => onFormChange("background", e.target.value)} rows={3} />
            </div>
          </TabsContent>

          {/* Themes Tab */}
          <TabsContent value="themes" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Lessons</Label>
              <Textarea placeholder="Key lessons from this book..." value={form.lessons} onChange={(e) => onFormChange("lessons", e.target.value)} rows={3} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Christ Connection</Label>
              <Textarea placeholder="How this book points to Jesus..." value={form.christConnection} onChange={(e) => onFormChange("christConnection", e.target.value)} rows={3} />
            </div>
            <ArrayField label="Main Themes" field="mainThemes" values={form.mainThemes} update={updateArray} add={addArrayItem} remove={removeArrayItem} />
            <ArrayField label="Key People" field="keyPeople" values={form.keyPeople} update={updateArray} add={addArrayItem} remove={removeArrayItem} />
            <ArrayField label="Key Verses" field="keyVerses" values={form.keyVerses} update={updateArray} add={addArrayItem} remove={removeArrayItem} />
          </TabsContent>

          {/* Extra Tab */}
          <TabsContent value="extra" className="space-y-4 mt-4">
            <ArrayField label="Applications" field="applications" values={form.applications} update={updateArray} add={addArrayItem} remove={removeArrayItem} placeholder="e.g. Trust God's sovereignty" />
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Key Scripture References (one per line)</Label>
              <Textarea placeholder="Genesis 1:1 (BSB)&#10;John 1:1-3" value={form.keyScriptureRef.join("\n")} onChange={(e) => onFormChange("keyScriptureRef", e.target.value.split("\n"))} rows={3} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Key Scripture Texts (one per line, matching refs above)</Label>
              <Textarea placeholder="In the beginning God created...&#10;In the beginning was the Word..." value={form.keyScriptureText.join("\n")} onChange={(e) => onFormChange("keyScriptureText", e.target.value.split("\n"))} rows={3} />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onSave} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {editMode ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Reusable array field ───────────────────────────────────────────────────

function ArrayField({
  label, field, values, update, add, remove, placeholder,
}: {
  label: string; field: string; values: string[];
  update: (field: string, index: number, value: string) => void;
  add: (field: string) => void;
  remove: (field: string, index: number) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-semibold">{label}</Label>
        <Button type="button" variant="ghost" size="sm" onClick={() => add(field)} className="h-6 text-xs gap-1">
          <Plus className="w-3 h-3" /> Add
        </Button>
      </div>
      {values.length === 0 && (
        <p className="text-xs text-muted-foreground italic">No items yet</p>
      )}
      {values.map((val, i) => (
        <div key={i} className="flex items-center gap-2">
          <Input
            placeholder={placeholder || `${label} ${i + 1}`}
            value={val}
            onChange={(e) => update(field, i, e.target.value)}
            className="h-8 text-sm"
          />
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => remove(field, i)}>
            <Trash2 className="w-3.5 h-3.5 text-destructive" />
          </Button>
        </div>
      ))}
    </div>
  );
}
