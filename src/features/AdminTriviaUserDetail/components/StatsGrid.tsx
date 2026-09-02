import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { getStats } from "../constants";

type Stats = ReturnType<typeof getStats>;

interface StatsGridProps {
  stats: Stats;
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <span className="text-2xl font-bold">{stat.value}</span>
              </div>
              <stat.icon className={cn("h-8 w-8", stat.color)} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
