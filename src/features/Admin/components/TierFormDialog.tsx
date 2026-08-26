// TierFormDialog — create/edit subscription tier dialog
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const INTERVALS = ["month", "year", "none"];
interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: any;
  onFormChange: (updater: (f: any) => any) => void;
  saving: boolean;
  onSave: () => void;
}
export function TierFormDialog({ open, onOpenChange, form, onFormChange, saving, onSave }: Props) {
  const update = (patch: any) => onFormChange((f: any) => ({ ...f, ...patch }));
  return (
    <Dialog open={open} onOpenChange={o => !o && onOpenChange(false)}>
      <DialogContent className="sm:max-w-md rounded-xl">
        <DialogHeader>
          <DialogTitle>{form.id ? "Edit Tier" : "New Tier"}</DialogTitle>
          <DialogDescription>{form.id ? "Update subscription tier details" : "Create a new subscription tier"}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Name *</Label>
            <Input value={form.name || ""} onChange={e => update({ name: e.target.value })} placeholder="e.g. Covenant Sower" />
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea value={form.description || ""} onChange={e => update({ description: e.target.value })} rows={2} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Price ($)</Label>
              <Input type="number" step="0.01" value={form.price ?? 0} onChange={e => update({ price: parseFloat(e.target.value) || 0 })} />
            </div>
            <div className="space-y-1.5">
              <Label>Interval</Label>
              <Select value={form.interval || "month"} onValueChange={v => update({ interval: v })}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>{INTERVALS.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Sort Order</Label>
              <Input type="number" value={form.sortOrder ?? 0} onChange={e => update({ sortOrder: parseInt(e.target.value) || 0 })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Features (one per line)</Label>
            <Textarea value={form.features || ""} onChange={e => update({ features: e.target.value })} rows={4} placeholder={"Bible reading\nDaily verse\nFull study tools"} />
          </div>
          <div className="space-y-1.5">
            <Label>Max Slots (leave empty for unlimited)</Label>
            <Input type="number" value={form.maxSlots ?? ""} onChange={e => update({ maxSlots: e.target.value ? parseInt(e.target.value) : null })} />
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-muted/20">
            <div><p className="text-sm font-medium">Active</p><p className="text-xs text-muted-foreground">Tier available for subscription</p></div>
            <Switch checked={form.isActive ?? true} onCheckedChange={v => update({ isActive: v })} />
          </div>
        </div>
        <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">Cancel</Button>
          <Button onClick={onSave} disabled={saving} className="gap-2 w-full sm:w-auto">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
