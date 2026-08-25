import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

interface Props {
  meta: any;
  updateMeta: (field: string, value: any) => void;
}

export function EditPlanMetaSection({ meta, updateMeta }: Props) {
  if (!meta) return null;
  return (
    <div className="space-y-4 p-4 rounded-2xl border border-border bg-card">
      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Plan Details</p>
      <div className="space-y-2">
        <Label>Title</Label>
        <Input value={meta.title} onChange={(e) => updateMeta("title", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea value={meta.description} onChange={(e) => updateMeta("description", e.target.value)} rows={3} />
      </div>
      <div className="flex items-center justify-between">
        <Label>Published</Label>
        <Switch checked={meta.isPublished} onCheckedChange={(v) => updateMeta("isPublished", v)} />
      </div>
    </div>
  );
}
