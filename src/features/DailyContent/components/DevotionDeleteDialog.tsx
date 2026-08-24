import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useLanguage } from "@/components/languages/languageProvider";
import type { DailyDevotionItem } from "../types";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  target: DailyDevotionItem | null;
  isDeleting: boolean;
  onConfirm: () => void;
}

export function DevotionDeleteDialog({ open, onOpenChange, target, isDeleting, onConfirm }: Props) {
  const { t } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.devotions?.deleteDevotion || "Delete Devotion"}</DialogTitle>
          <DialogDescription>{t.devotions?.deleteDevotionDesc || "This action cannot be undone."}</DialogDescription>
        </DialogHeader>
        {target && (
          <div className="py-2">
            <p className="font-medium">{target.title}</p>
            {target.content && <p className="text-sm text-muted-foreground italic line-clamp-2 pt-1">{target.content.substring(0, 100)}...</p>}
          </div>
        )}
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>{t.common?.cancel || "Cancel"}</Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isDeleting} className="gap-2">
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            {t.devotions?.deleteDevotion || "Delete Devotion"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
