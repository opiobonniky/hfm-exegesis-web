// PublishedToggle — shared published toggle switch
import { Switch } from "@/components/ui/switch";

interface Props {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export function PublishedToggle({ checked, onCheckedChange }: Props) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-muted/10">
      <div>
        <p className="text-sm font-medium">Published</p>
        <p className="text-xs text-muted-foreground">Visible to users immediately</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
