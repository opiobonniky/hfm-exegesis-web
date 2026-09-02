import { CheckCircle2, Layers, Timer } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  completedCount: number;
  totalCount: number;
  inProgressCount: number;
}

const STATS = [
  { key: "completed", label: "Completed", icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" },
  { key: "total", label: "Total Studies", icon: Layers, color: "text-primary", bg: "bg-primary/10" },
  { key: "inProgress", label: "In Progress", icon: Timer, color: "text-amber-500", bg: "bg-amber-500/10" },
];

export function LabHomeStats({ completedCount, totalCount, inProgressCount }: Props) {
  const values: Record<string, number | string> = {
    completed: completedCount,
    total: totalCount,
    inProgress: inProgressCount || "\u2014",
  };

  return (
    <section className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-6">
      <div className="grid grid-cols-3 gap-3">
        {STATS.map((stat) => (
          <div key={stat.key} className="rounded-xl bg-gradient-to-b from-card to-card/80 border border-border/40 shadow-sm p-3.5 text-center">
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2", stat.bg)}><stat.icon className={cn("w-4 h-4", stat.color)} /></div>
            <p className="text-2xl font-bold text-foreground">{values[stat.key]}</p>
            <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
