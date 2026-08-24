// TriviaStatCard — stat card for trivia overview
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface Props {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
}

export function TriviaStatCard({ label, value, icon: Icon, color }: Props) {
  return (
    <Card className="border-border/50">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", color)}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-bold font-[family-name:var(--font-heading)]">{value}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
