/**
 * DotIndicators — dot indicators for carousel navigation.
 */
import { cn } from "@/lib/utils";

interface DotIndicatorsProps {
  total: number;
  current: number;
}

export function DotIndicators({ total, current }: DotIndicatorsProps) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className={cn(
          "rounded-full transition-all duration-300",
          i === current ? "w-6 h-2 bg-card" : "w-2 h-2 bg-card/30",
        )} />
      ))}
    </div>
  );
}
