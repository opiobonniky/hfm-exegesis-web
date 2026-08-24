// Search loading skeleton
import { cn } from "@/lib/utils";

export default function SearchSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="space-y-2 animate-pulse">
          <div className="h-3 w-1/3 rounded bg-muted/50" />
          <div className={cn("h-14 rounded-lg bg-muted/30", i % 2 === 0 && "w-[92%]")} />
        </div>
      ))}
    </div>
  );
}
