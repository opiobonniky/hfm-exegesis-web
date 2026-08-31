// PrologueFormDialog — edit/create dialog for book prologues
import { Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export interface PrologueForm {
  bookName: string;
  title: string;
  content: string;
  isPublished: boolean;
}

interface Props {
  open: boolean;
  editMode: boolean;
  form: PrologueForm;
  filteredBooks: string[];
  saving: boolean;
  onFormChange: (updater: (prev: PrologueForm) => PrologueForm) => void;
  onSave: () => void;
  onClose: () => void;
}

export function PrologueFormDialog({
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
            {editMode ? "Edit Prologue" : "Add New Prologue"}
          </DialogTitle>
          <DialogDescription>
            {editMode
              ? "Update the book prologue content"
              : "Create a new book introduction or overview"}
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
          <div className="space-y-2">
            <Label>Title *</Label>
            <Input
              placeholder="e.g., The Gospel of John"
              value={form.title}
              onChange={(e) =>
                onFormChange((p) => ({ ...p, title: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Content *</Label>
            <Textarea
              placeholder="Write the book prologue content..."
              value={form.content}
              onChange={(e) =>
                onFormChange((p) => ({ ...p, content: e.target.value }))
              }
              rows={8}
              className="min-h-[200px]"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Published</Label>
              <p className="text-sm text-muted-foreground">
                Make this prologue visible to users
              </p>
            </div>
            <Switch
              checked={form.isPublished}
              onCheckedChange={(c) =>
                onFormChange((p) => ({ ...p, isPublished: c }))
              }
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={onSave}
            disabled={saving}
            className="gap-2"
          >
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
