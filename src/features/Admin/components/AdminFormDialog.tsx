// AdminFormDialog — reusable dialog wrapper for create/edit forms
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import type { ReactNode } from "react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  saving?: boolean;
  onSave: () => void;
  saveLabel?: string;
  saveDisabled?: boolean;
  children: ReactNode;
}

export function AdminFormDialog({ open, onOpenChange, title, description, saving, onSave, saveLabel = "Save", saveDisabled, children }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="space-y-4 py-4">{children}</div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
          <Button onClick={onSave} disabled={saving || saveDisabled} className="gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {saveLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
