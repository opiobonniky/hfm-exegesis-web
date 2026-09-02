import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DIFFICULTY_OPTIONS } from "../constants";
import type { TriviaFormData } from "../hooks/useAdminAddTriviaQuestionPage";

interface TriviaMetadataSectionProps {
  form: TriviaFormData;
  onFormChange: React.Dispatch<React.SetStateAction<TriviaFormData>>;
}

export function TriviaMetadataSection({ form, onFormChange }: TriviaMetadataSectionProps) {
  return (
    <Card>
      <CardHeader><CardTitle>Details</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Category *</Label>
            <Input
              value={form.category}
              onChange={(e) => onFormChange((p) => ({ ...p, category: e.target.value }))}
              placeholder="e.g. creation, gospel, prophets"
            />
          </div>
          <div>
            <Label>Difficulty</Label>
            <Select value={form.difficulty} onValueChange={(v) => onFormChange((p) => ({ ...p, difficulty: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {DIFFICULTY_OPTIONS.map((d) => (
                  <SelectItem key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center justify-between border-t pt-4">
          <div className="flex items-center gap-2">
            <Switch checked={form.isActive} onCheckedChange={(checked) => onFormChange((p) => ({ ...p, isActive: checked }))} />
            <Label>Active (visible to users)</Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
