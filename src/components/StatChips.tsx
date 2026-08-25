import { cn } from "@/lib/utils";

interface StatItem {
  label: string;
  value: number;
  color: string;
  bg: string;
}

interface Props {
  items: StatItem[];
  columns?: 2 | 3 | 4;
}

export function StatChips({ items, columns = 3 }: Props) {
  const gridClass = columns === 2 ? "grid-cols-2" : columns === 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3";
  return (
    <div className={cn("grid gap-3", gridClass)}>
      {items.map((s) => (
        <div key={s.label} className={cn("rounded-2xl border p-4 text-center", s.bg)}>
          <p className={cn("text-2xl font-bold", s.color)} style={{ fontFamily: "'Fraunces', Georgia, serif" }}>{s.value}</p>
          <p className="text-xs text-muted-foreground mt-1 font-semibold">{s.label}</p>
        </div>
      ))}
    </div>
  );
}
