import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart } from "lucide-react";
import { RELATIONSHIP_OPTIONS } from "../constants";
import type { ExtendedProfileData } from "../hooks/useExtendedProfilePage";

interface Props {
  form: ExtendedProfileData;
  updateField: (key: keyof ExtendedProfileData, val: string) => void;
}

export function EmergencyContactSection({ form, updateField }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Heart className="h-5 w-5 text-rose-500" /> Emergency Contact</CardTitle>
        <CardDescription>Contact in case of emergency</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Contact Name</Label>
          <Input value={form.emergencyContactName} onChange={(e) => updateField("emergencyContactName", e.target.value)} placeholder="Full name" />
        </div>
        <div className="space-y-2">
          <Label>Contact Phone</Label>
          <Input value={form.emergencyContactPhone} onChange={(e) => updateField("emergencyContactPhone", e.target.value)} placeholder="Phone number" />
        </div>
        <div className="space-y-2">
          <Label>Relationship</Label>
          <Select value={form.emergencyContactRelationship} onValueChange={(v) => updateField("emergencyContactRelationship", v)}>
            <SelectTrigger><SelectValue placeholder="Select relationship" /></SelectTrigger>
            <SelectContent>
              {RELATIONSHIP_OPTIONS.map((r) => (<SelectItem key={r} value={r}>{r}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
