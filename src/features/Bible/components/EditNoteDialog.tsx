// EditNoteDialog — modal for creating, editing, or deleting verse notes
"use client";

import { Save, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import type { EditNoteDialogProps } from "../types";
import { tt } from '@/components/languages/hardcodedTranslate';

export function EditNoteDialog({
  open,
  mode = "create",
  verseRef,
  text,
  saving,
  deleting = false,
  onTextChange,
  onSave,
  onClose,
  onDelete,
}: EditNoteDialogProps) {
  const isEdit = mode === "edit";
  const hasExistingNote = isEdit && text.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="overflow-hidden border-border/70 p-0 sm:max-w-lg">
        <div className="border-b border-border/60 bg-primary/[0.04] px-6 py-5">
          <DialogHeader>
            <DialogTitle className="font-[family-name:var(--font-heading)] text-xl">
              {isEdit ? tt("Edit note") : tt("Add a verse note")}
            </DialogTitle>
            <DialogDescription>
              {verseRef
                ? isEdit
                  ? `Editing note for ${verseRef}`
                  : `The note will be saved to ${verseRef}.`
                : isEdit
                  ? tt("Update your note.")
                  : tt("The note will be saved to every selected verse.")}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-4 px-6 py-5">
          <Textarea
            value={text}
            onChange={(event) => onTextChange(event.target.value)}
            placeholder={tt("Write your note...")}
            rows={7}
            className="resize-none border-border/70 bg-background text-base leading-relaxed"
          />

          <DialogFooter className="flex-row gap-2 sm:justify-between">
            <div className="flex gap-2">
              {isEdit && onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDelete}
                  disabled={saving || deleting}
                  className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  {deleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}{tt("Delete")}</Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} disabled={saving}>{tt("Cancel")}</Button>
              <Button
                onClick={onSave}
                disabled={!text.trim() || saving}
                className="gap-1.5"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {isEdit ? tt("Update") : tt("Save note")}
              </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
