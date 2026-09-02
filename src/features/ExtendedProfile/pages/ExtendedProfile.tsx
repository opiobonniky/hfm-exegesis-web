"use client";

import { useExtendedProfilePage } from "../hooks/useExtendedProfilePage";
import { Loader2 } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { PersonalDetailsSection } from "../components/PersonalDetailsSection";
import { MinistrySection } from "../components/MinistrySection";
import { EmergencyContactSection } from "../components/EmergencyContactSection";

export default function ExtendedProfilePage() {
  const { loading, saving, form, updateField, handleSave, goBack } = useExtendedProfilePage();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-2xl mx-auto">
      <PageHeader goBack={goBack} handleSave={handleSave} saving={saving} />
      <PersonalDetailsSection form={form} updateField={updateField as any} />
      <MinistrySection form={form} updateField={updateField as any} />
      <EmergencyContactSection form={form} updateField={updateField as any} />
    </div>
  );
}
