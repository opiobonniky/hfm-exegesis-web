"use client";

import { Shield, Loader2 } from "lucide-react";
import { useLanguage } from "@/components/languages/languageProvider";

export default function SettingsLoading() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
      <div className="relative w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
        <Shield className="w-7 h-7 text-primary" />
        <Loader2 className="w-5 h-5 animate-spin text-primary absolute -bottom-1.5 -right-1.5 bg-background rounded-full p-0.5" />
      </div>
      <p className="text-sm text-muted-foreground">{t.settings?.loading || "Loading..."}</p>
    </div>
  );
}
