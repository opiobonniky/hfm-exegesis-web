// StatCard — reusable stat card with a gradient accent, icon, value, and label
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
}

// color value is a Tailwind utility token like "bg-primary/10 text-primary".
// We combine it with a soft gradient wash so each stat reads as its own color.
export function StatCard({ label, value, icon: Icon, color }: Props) {
  return (
    <Card className="relative overflow-hidden border-border shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="absolute inset-0 bg-gradient-to-br from-card via-card to-card" />
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-primary/20" />
      <div
        className={cn(
          "absolute -right-8 -top-8 h-28 w-28 rounded-full blur-2xl opacity-20",
          color.replace("text-", "bg-").split(" ")[0],
        )}
      />
      <CardContent className="relative p-5">
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
              color,
            )}
          >
            <Icon className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-3xl font-extrabold tabular-nums tracking-tight">
              {value}
            </p>
            <p className="mt-0.5 truncate text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {label}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
