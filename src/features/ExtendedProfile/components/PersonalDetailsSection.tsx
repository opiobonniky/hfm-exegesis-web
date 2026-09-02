import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "lucide-react";
import type { ExtendedProfileData } from "../hooks/useExtendedProfilePage";

interface Props {
  form: ExtendedProfileData;
  updateField: (key: keyof ExtendedProfileData, val: string) => void;
}

export function PersonalDetailsSection({ form, updateField }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><User className="h-5 w-5 text-primary" /> Personal Details</CardTitle>
        <CardDescription>Additional personal information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Middle Name</Label>
          <Input value={form.middleName} onChange={(e) => updateField("middleName", e.target.value)} placeholder="Middle name (optional)" />
        </div>
        <div className="space-y-2">
          <Label>Alternative Phone</Label>
          <Input value={form.alternativePhone} onChange={(e) => updateField("alternativePhone", e.target.value)} placeholder="Alternative phone (optional)" />
        </div>
      </CardContent>
    </Card>
  );
}
