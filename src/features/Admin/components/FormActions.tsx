// FormActions — save/cancel button row for admin forms
import { Loader2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  saving: boolean;
  disabled: boolean;
  onCancel: () => void;
  onSave: () => void;
  saveLabel?: string;
  savingLabel?: string;
}

export function FormActions({
  saving, disabled, onCancel, onSave,
  saveLabel = "Save", savingLabel = "Saving...",
}: Props) {
  return (
    <div className="flex items-center justify-end gap-3">
      <Button variant="outline" onClick={onCancel} className="gap-1.5">
        <X className="w-4 h-4" />
        Cancel
      </Button>
      <Button onClick={onSave} disabled={saving || disabled} className="gap-1.5">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {saving ? savingLabel : saveLabel}
      </Button>
    </div>
  );
}
