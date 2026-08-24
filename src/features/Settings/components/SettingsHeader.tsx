"use client";

import { Shield } from "lucide-react";
import { useLanguage } from "@/components/languages/languageProvider";

export default function SettingsHeader() {
  const { t } = useLanguage();

  return (
    <div className="relative bg-card overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-[0.06]" style={{ backgroundImage: "radial-gradient(circle, hsl(var(--foreground)/0.08) 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
      <div className="relative mx-auto px-3 sm:px-4 lg:px-6 pt-5 pb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase text-primary/40">{t.settings?.pageTitle || "Settings"}</p>
            <h1 className="text-xl sm:text-2xl font-bold text-primary">{t.settings?.yourProfile || "Your Profile"}</h1>
          </div>
        </div>
      </div>
    </div>
  );
}
