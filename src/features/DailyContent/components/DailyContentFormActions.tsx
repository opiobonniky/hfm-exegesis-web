/**
 * DailyContentFormActions — shared form action buttons (cancel + save).
 * Replaces the repeated flex justify-end + cancel/save button pattern.
 */
import { ReactNode } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface Props {
  /** Route to go to on cancel */
  cancelTo: string;
  cancelLabel: string;
  saveLabel: string;
  /** Whether save button should be disabled */
  disabled?: boolean;
  /** Show loading state */
  saving?: boolean;
  onSave: () => void;
}

export function DailyContentFormActions({
  cancelTo,
  cancelLabel,
  saveLabel,
  disabled,
  saving,
  onSave,
}: Props) {
  return (
    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t">
      <Button type="button" variant="ghost" asChild>
        <Link to={cancelTo}>{cancelLabel}</Link>
      </Button>
      <Button
        type="submit"
        disabled={disabled || saving}
        className="bg-gradient-to-r from-primary to-primary/90 shadow-md"
        onClick={(e) => {
          e.preventDefault();
          onSave();
        }}
      >
        <Save className="h-4 w-4 mr-2" />
        {saveLabel}
      </Button>
    </div>
  );
}
