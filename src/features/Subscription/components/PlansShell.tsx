import type { ReactNode } from "react";
import { useLanguage } from "@/components/languages/languageProvider";
import type { PlansShellProps } from "../types";

export function PlansShell({ children }: PlansShellProps) {
  const { lang } = useLanguage();
  const isRtl = lang === "ar";

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="w-full bg-background text-foreground overflow-x-hidden">
      {children}
    </div>
  );
}
