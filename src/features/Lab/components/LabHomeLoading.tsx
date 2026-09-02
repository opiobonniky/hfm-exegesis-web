import { BookOpen } from "lucide-react";

export function LabHomeLoading() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center animate-pulse"><BookOpen className="w-8 h-8 text-primary/60" /></div>
        <p className="text-sm font-semibold text-muted-foreground">Loading your studies...</p>
      </div>
    </div>
  );
}
