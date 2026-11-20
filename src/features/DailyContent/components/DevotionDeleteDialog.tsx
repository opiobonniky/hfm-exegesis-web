import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useLanguage } from "@/components/languages/languageProvider";
import type { DailyDevotionCardItem } from "../types";
import { tt } from '@/components/languages/hardcodedTranslate';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  target: DailyDevotionCardItem | null;
  isDeleting: boolean;
  onConfirm: () => void;
}

export function DevotionDeleteDialog({ open, onOpenChange, target, isDeleting, onConfirm }: Props) {
  const { t } = useLanguage();
  const excerpt = target?.preview?.explanation || target?.explanation;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.devotions?.deleteDevotion || tt("Delete Devotion")}</DialogTitle>
          <DialogDescription>{t.devotions?.deleteDevotionDesc || tt("This action cannot be undone.")}</DialogDescription>
        </DialogHeader>
        {target && (
          <div className="py-2">
            <p className="font-medium">{target.preview?.title || target.title}</p>
            {excerpt && <p className="text-sm text-muted-foreground italic line-clamp-2 pt-1">{excerpt}</p>}
          </div>
        )}
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>{t.common?.cancel || tt("Cancel")}</Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isDeleting} className="gap-2">
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            {t.devotions?.deleteDevotion || tt("Delete Devotion")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
