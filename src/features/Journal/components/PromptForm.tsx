import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Save, Plus, Trash2 } from "lucide-react";

const CATEGORIES = ["general", "study", "prayer", "gratitude", "reflection", "application", "explanation"];
interface PromptFormProps {
  formData: any;
  onChange: (data: any) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  isEdit?: boolean;
}
export function PromptForm({ formData, onChange, onSave, onCancel, saving, isEdit }: PromptFormProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg">{isEdit ? "Edit Prompt" : "Create Prompt"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Prompt Text *</Label>
          <Textarea value={formData.prompt} onChange={e => onChange({ ...formData, prompt: e.target.value })} rows={3} placeholder="Enter the journal prompt..." />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={formData.category} onValueChange={v => onChange({ ...formData, category: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(c => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
            <Label>Order</Label>
            <Input type="number" value={formData.order} onChange={e => onChange({ ...formData, order: parseInt(e.target.value) || 0 })} />
          <Label>Description</Label>
          <Input value={formData.description} onChange={e => onChange({ ...formData, description: e.target.value })} placeholder="Optional description" />
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={onSave} disabled={saving} className="bg-primary hover:bg-primary/90">
            <Save className="w-4 h-4 mr-2" /> {saving ? "Saving..." : isEdit ? "Update" : "Create"}
          </Button>
      </CardContent>
    </Card>
  );
