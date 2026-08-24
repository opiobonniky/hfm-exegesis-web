// ValidationChecklist — save readiness checklist
import { CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CheckItem { label: string; ok: boolean }
interface Props { items: CheckItem[]; valid: boolean; t: any }
export function ValidationChecklist({ items, valid, t }: Props) {
  return (
    <Card className={cn("border transition-colors", valid ? "border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20" : "border-border/40 bg-muted/20")}>
      <CardContent className="p-4 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t.verseExplanations.checklist}</p>
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2 text-xs">
            <div className={cn("w-4 h-4 rounded-full flex items-center justify-center shrink-0", item.ok ? "bg-emerald-500" : "bg-muted-foreground/20")}>
              {item.ok && <CheckCircle2 className="w-3 h-3 text-white" />}
            </div>
            <span className={item.ok ? "text-foreground" : "text-muted-foreground"}>{item.label}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
// FormattingTips — text formatting help card
export function FormattingTips({ t }: { t: any }) {
    <Card className="border-border/30 bg-muted/20">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t.verseExplanations.formattingTips}</p>
        <div className="space-y-1.5 text-xs text-muted-foreground" dir="ltr">
          {[
            { code: "- Text", desc: t.verseExplanations.ftBulletDesc },
            { code: "1. Text", desc: t.verseExplanations.ftNumberedDesc },
            { code: "(empty line)", desc: t.verseExplanations.ftEmptyDesc },
          ].map((item) => (
            <div key={item.code} className="flex gap-2">
              <code className="bg-muted px-1.5 py-0.5 rounded shrink-0">{item.code}</code>
              <span>{item.desc}</span>
          ))}
        </div>
