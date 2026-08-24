"use client";

import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  itemName?: string;
  itemPreview?: string;
  onConfirm: () => void;
  loading?: boolean;
  className?: string;
}

/**
 * Reusable delete confirmation dialog with item preview.
 * Shows warning icon, item details, and confirm/cancel buttons.
 */
export function DeleteConfirmDialog({
  open, onOpenChange, title = "Delete Item",
  description = "This action cannot be undone.",
  itemName, itemPreview, onConfirm, loading, className,
}: DeleteConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("max-w-md", className)}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {(itemName || itemPreview) && (
          <div className="rounded-lg border border-border bg-muted/40 p-4 space-y-1.5">
            {itemName && <p className="font-semibold text-sm">{itemName}</p>}
            {itemPreview && <p className="text-xs text-muted-foreground italic line-clamp-2">{itemPreview}</p>}
          </div>
        )}
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
          <Button variant="destructive" onClick={onConfirm} disabled={loading} className="gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
