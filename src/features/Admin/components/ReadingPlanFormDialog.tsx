// ReadingPlanFormDialog — create/edit dialog for reading plans
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import type { ReadingPlanForm } from "../hooks/useAdminReadingPlans";
import { tt } from '@/components/languages/hardcodedTranslate';

interface ReadingPlanFormDialogProps {
  open: boolean;
  editPlan: { id: number } | null;
  form: ReadingPlanForm;
  saving: boolean;
  onFieldChange: (field: keyof ReadingPlanForm, value: string | boolean) => void;
  onSave: () => void;
  onClose: () => void;
}

export function ReadingPlanFormDialog({
  open,
  editPlan,
  form,
  saving,
  onFieldChange,
  onSave,
  onClose,
}: ReadingPlanFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editPlan ? tt("Edit Reading Plan") : tt("Create Reading Plan")}
          </DialogTitle>
          <DialogDescription>
            {editPlan
              ? tt("Update the reading plan details")
              : tt("Create a new reading plan for users")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label className="text-xs font-semibold">{tt("Title *")}</Label>
            <Input
              placeholder={tt("e.g., 30-Day Psalms Journey")}
              value={form.title}
              onChange={(e) => onFieldChange("title", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold">{tt("Description")}</Label>
            <Textarea
              placeholder={tt("Describe the reading plan...")}
              value={form.description}
              onChange={(e) => onFieldChange("description", e.target.value)}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">{tt("Category")}</Label>
              <Input
                placeholder={tt("e.g., devotional")}
                value={form.category}
                onChange={(e) => onFieldChange("category", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold">{tt("Duration (days)")}</Label>
              <Input
                type="number"
                min="1"
                value={form.durationDays}
                onChange={(e) => onFieldChange("durationDays", e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-xs font-semibold">{tt("Published")}</Label>
              <p className="text-xs text-muted-foreground">{tt("Make this plan visible to users")}</p>
            </div>
            <Switch
              checked={form.isPublished}
              onCheckedChange={(c) => onFieldChange("isPublished", c)}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>{tt("Cancel")}</Button>
          <Button
            onClick={onSave}
            disabled={saving || !form.title.trim()}
            className="gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}{" "}
            {editPlan ? tt("Update") : tt("Create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
