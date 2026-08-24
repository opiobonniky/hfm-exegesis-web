"use client";

import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/languages/languageProvider";
import { ADDITIONAL_FIELDS } from "../constants";
interface AdditionalDetailsTabProps {
  profile: any;
  onFieldChange: (field: string, value: string) => void;
  onSave: () => void;
  saving: boolean;
}
export default function AdditionalDetailsTab({ profile, onFieldChange, onSave, saving }: AdditionalDetailsTabProps) {
  const { t } = useLanguage();
  return (
    <div className="rounded-2xl bg-card border border-border/50 p-4 sm:p-6 space-y-4">
      <p className="text-sm text-muted-foreground">Additional profile details and emergency contact information.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {ADDITIONAL_FIELDS.map((f) => (
          <div key={f} className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground capitalize">{f.replace(/([A-Z])/g, " $1")}</label>
            <input
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
              value={profile[f] || ""}
              onChange={(e) => onFieldChange(f, e.target.value)}
            />
          </div>
        ))}
      </div>
      <Button onClick={onSave} disabled={saving} className="bg-primary hover:bg-primary/90">
        <Save className="w-4 h-4 mr-2" /> {t.settings?.saveChanges || "Save Changes"}
      </Button>
    </div>
  );
