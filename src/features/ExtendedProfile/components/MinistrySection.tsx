import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase } from "lucide-react";
import { MINISTRY_GROUPS } from "../constants";
import type { ExtendedProfileData } from "../hooks/useExtendedProfilePage";

interface Props {
  form: ExtendedProfileData;
  updateField: (key: keyof ExtendedProfileData, val: string) => void;
}

export function MinistrySection({ form, updateField }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5 text-blue-500" /> Ministry Information</CardTitle>
        <CardDescription>Your ministry involvement and spiritual gifts</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Ministry Group</Label>
          <Select value={form.ministryGroup} onValueChange={(v) => updateField("ministryGroup", v)}>
            <SelectTrigger><SelectValue placeholder="Select ministry group" /></SelectTrigger>
            <SelectContent>
              {MINISTRY_GROUPS.map((g) => (<SelectItem key={g} value={g}>{g}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Service Position</Label>
          <Input value={form.servicePosition} onChange={(e) => updateField("servicePosition", e.target.value)} placeholder="e.g. Worship Leader, Small Group Facilitator" />
        </div>
        <div className="space-y-2">
          <Label>Spiritual Gifts</Label>
          <Input value={form.spiritualGifts} onChange={(e) => updateField("spiritualGifts", e.target.value)} placeholder="e.g. Teaching, Prophecy, Healing (comma-separated)" />
        </div>
      </CardContent>
    </Card>
  );
}
