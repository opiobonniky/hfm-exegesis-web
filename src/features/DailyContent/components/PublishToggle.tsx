/**
 * PublishToggle — replaces the repeated `<div className="flex items-center justify-between">` + Switch pattern.
 */
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface PublishToggleProps {
  published: boolean;
  onCheckedChange: (checked: boolean) => void;
  publishedLabel?: string;
  publishedDesc?: string;
}

export function PublishToggle({
  published,
  onCheckedChange,
  publishedLabel = "Published",
  publishedDesc = "Show to all users",
}: PublishToggleProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <Label>{publishedLabel}</Label>
        <p className="text-xs text-muted-foreground">{publishedDesc}</p>
      </div>
      <Switch checked={published} onCheckedChange={onCheckedChange} />
    </div>
  );
}
