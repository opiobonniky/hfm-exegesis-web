// VerseExplanationFormDialog — edit/create dialog for verse explanations
import { Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export interface VerseExplanationForm {
  bookName: string;
  chapter: string;
  verseNumber: string;
  explanation: string;
  learnMore: string;
  isPublished: boolean;
}

interface Props {
  open: boolean;
  editMode: boolean;
  form: VerseExplanationForm;
  filteredBooks: string[];
  saving: boolean;
  onFormChange: (updater: (prev: VerseExplanationForm) => VerseExplanationForm) => void;
  onSave: () => void;
  onClose: () => void;
}

export function VerseExplanationFormDialog({
  open,
  editMode,
  form,
  filteredBooks,
  saving,
  onFormChange,
  onSave,
  onClose,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editMode ? "Edit Explanation" : "Add New Explanation"}
          </DialogTitle>
          <DialogDescription>
            {editMode
              ? "Update the verse explanation"
              : "Create a new verse explanation"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Book Name *</Label>
            <Input
              placeholder="Search for a book..."
              value={form.bookName}
              onChange={(e) =>
                onFormChange((p) => ({ ...p, bookName: e.target.value }))
              }
            />
            {form.bookName && filteredBooks.length > 0 && (
              <div className="border rounded-md max-h-40 overflow-y-auto">
                {filteredBooks.slice(0, 10).map((book) => (
                  <button
                    key={book}
                    className="w-full px-3 py-2 text-sm text-left hover:bg-muted transition-colors"
                    onClick={() =>
                      onFormChange((p) => ({ ...p, bookName: book }))
                    }
                  >
                    {book}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Chapter *</Label>
              <Input
                type="number"
                min="1"
                placeholder="e.g., 3"
                value={form.chapter}
                onChange={(e) =>
                  onFormChange((p) => ({ ...p, chapter: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Verse Number *</Label>
              <Input
                type="number"
                min="1"
                placeholder="e.g., 16"
                value={form.verseNumber}
                onChange={(e) =>
                  onFormChange((p) => ({ ...p, verseNumber: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Explanation *</Label>
            <Textarea
              placeholder="Write the verse explanation..."
              value={form.explanation}
              onChange={(e) =>
                onFormChange((p) => ({ ...p, explanation: e.target.value }))
              }
              rows={6}
              className="min-h-[150px]"
            />
          </div>
          <div className="space-y-2">
            <Label>Learn More (optional)</Label>
            <Textarea
              placeholder="Additional study notes..."
              value={form.learnMore}
              onChange={(e) =>
                onFormChange((p) => ({ ...p, learnMore: e.target.value }))
              }
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={saving} className="gap-2">
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}{" "}
            {editMode ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
