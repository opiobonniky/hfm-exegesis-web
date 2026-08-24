import { Languages } from "lucide-react";

interface Props { counts: Record<string, number>; label?: string; icon?: React.ReactNode; }

export function LanguageStatsBar({ counts, label, icon }: Props) {
  const greek = counts["greek"] || 0;
  const hebrew = counts["hebrew"] || 0;
  const aramaic = counts["aramaic"] || 0;
  if (!greek && !hebrew && !aramaic) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap rounded-lg bg-muted/20 border border-border/40 p-2.5">
      <div className="flex items-center gap-1.5">
        {icon || <Languages className="w-3.5 h-3.5 text-primary" />}
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{label || "Language Breakdown"}</span>
      </div>
      <div className="flex items-center gap-2 ml-auto">
        {greek > 0 && <span className="inline-flex items-center gap-1 text-[10px]"><span className="w-2 h-2 rounded-full bg-blue-500" /><span className="tabular-nums font-semibold text-foreground">{greek}</span><span className="text-muted-foreground/60">Greek</span></span>}
        {hebrew > 0 && <span className="inline-flex items-center gap-1 text-[10px]"><span className="w-2 h-2 rounded-full bg-amber-500" /><span className="tabular-nums font-semibold text-foreground">{hebrew}</span><span className="text-muted-foreground/60">Hebrew</span></span>}
        {aramaic > 0 && <span className="inline-flex items-center gap-1 text-[10px]"><span className="w-2 h-2 rounded-full bg-rose-600" /><span className="tabular-nums font-semibold text-foreground">{aramaic}</span><span className="text-muted-foreground/60">Aramaic</span></span>}
      </div>
    </div>
  );
}
