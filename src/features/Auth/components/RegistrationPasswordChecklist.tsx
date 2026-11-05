import { Check, Circle } from "lucide-react";
import { passwordRequirements } from "../registration";
import { tt } from "@/components/languages/hardcodedTranslate";

export function RegistrationPasswordChecklist({ password }: { password: string }) {
  const count = passwordRequirements.filter(r => r.test(password)).length;
  return <div className="rounded-xl border bg-muted/30 p-4">
    <div className="mb-3 flex gap-1" aria-label={tt("Password strength")}>
      {passwordRequirements.map((r, i) => <span key={r.label} className={`h-1.5 flex-1 rounded-full ${i < count ? count === 5 ? "bg-emerald-500" : "bg-amber-500" : "bg-muted"}`} />)}
    </div>
    <ul className="grid gap-2 text-xs sm:grid-cols-2">{passwordRequirements.map(r => {
      const met = r.test(password); const Icon = met ? Check : Circle;
      return <li key={r.label} className={`flex items-center gap-2 ${met ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}><Icon className="size-3.5 shrink-0" />{tt(r.label)}</li>;
    })}</ul>
  </div>;
}
