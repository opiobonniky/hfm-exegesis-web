/**
 * DailyContentDetailEmpty — shared empty state for detail pages when no data is found.
 */
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  icon: LucideIcon;
  title: string;
  message: string;
  onBack: () => void;
  backLabel?: string;
}

export function DailyContentDetailEmpty({
  icon: Icon,
  title,
  message,
  onBack,
  backLabel = "Go back",
}: Props) {
  return (
    <div className="min-h-full flex flex-col items-center justify-center bg-background gap-4 text-center px-6">
      <Icon className="w-12 h-12 text-muted-foreground/40" />
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="text-sm text-muted-foreground">{message}</p>
      <Button variant="outline" onClick={onBack}>
        {backLabel}
      </Button>
    </div>
  );
}
