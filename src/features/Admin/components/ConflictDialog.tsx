// ConflictDialog — content conflict resolution dialog
import { AlertTriangle, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import type { ContentType } from "../constants";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentType: ContentType | null;
  data: any;
  saving: boolean;
  onResolve: () => void;
}
export function ConflictDialog({ open, onOpenChange, contentType, data, saving, onResolve }: Props) {
  const typeLabel = contentType === "verse" ? "Verse" : contentType === "devotion" ? "Devotion" : "Exegesis";
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-5 h-5" />
            {typeLabel} Already Exists
          </DialogTitle>
          <DialogDescription>
            {(() => {
              const conflict = data?.conflicts?.[0] || data;
              const existing = conflict?.existing;
              if (!existing) return "There is a conflict with existing content for this date.";
              const ref = existing.bookName
                ? `${existing.bookName} ${existing.chapter}:${existing.verseNumber}`
                : existing.passageReference || existing.title || "";
              const date = existing.displayDate
                ? new Date(existing.displayDate).toLocaleDateString()
                : "";
              if (conflict?.type === "date") {
                return `Another entry already exists for ${date}. Would you like to update it with your new content?`;
              }
              return ref
                ? `The passage ${ref} already has content for ${date}. Would you like to update it?`
                : "Content already exists. Would you like to update the existing entry?";
            })()}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button onClick={onResolve} disabled={saving} className="gap-2 w-full sm:w-auto">
            {saving ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</>
            ) : (
              <><Save className="w-4 h-4" /> Update Existing</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
