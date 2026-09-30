import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "lucide-react";
import type { ExtendedProfileData } from "../hooks/useExtendedProfilePage";
import { tt } from '@/components/languages/hardcodedTranslate';

interface Props {
  form: ExtendedProfileData;
  updateField: (key: keyof ExtendedProfileData, val: string) => void;
}

export function PersonalDetailsSection({ form, updateField }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><User className="h-5 w-5 text-primary" />{tt("Personal Details")}</CardTitle>
        <CardDescription>{tt("Additional personal information")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>{tt("Middle Name")}</Label>
          <Input value={form.middleName} onChange={(e) => updateField("middleName", e.target.value)} placeholder={tt("Middle name (optional)")} />
        </div>
        <div className="space-y-2">
          <Label>{tt("Alternative Phone")}</Label>
          <Input value={form.alternativePhone} onChange={(e) => updateField("alternativePhone", e.target.value)} placeholder={tt("Alternative phone (optional)")} />
        </div>
      </CardContent>
    </Card>
  );
}
