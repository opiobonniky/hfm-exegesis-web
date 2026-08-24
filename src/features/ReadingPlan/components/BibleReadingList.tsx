import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/Badge";
import { BookOpen, Check, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReadingItem {
  day: number;
  book: string;
  chapter: number;
  title?: string;
  completed: boolean;
}
interface BibleReadingListProps {
  readings: ReadingItem[];
  onToggleComplete: (day: number) => void;
export function BibleReadingList({ readings, onToggleComplete }: BibleReadingListProps) {
  const completed = readings.filter(r => r.completed).length;
  const progress = readings.length > 0 ? Math.round((completed / readings.length) * 100) : 0;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{completed}/{readings.length} chapters read</p>
        <Badge variant="outline">{progress}%</Badge>
      </div>
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
      <div className="space-y-2">
        {readings.map((r) => (
          <div
            key={r.day}
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer",
              r.completed ? "border-green-500/30 bg-green-500/5" : "border-border hover:border-primary/30"
            )}
            onClick={() => onToggleComplete(r.day)}
          >
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
              r.completed ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"
            )}>
              {r.completed ? <Check className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{r.book} {r.chapter}</p>
              {r.title && <p className="text-xs text-muted-foreground">{r.title}</p>}
            <span className="text-xs text-muted-foreground">Day {r.day}</span>
          </div>
        ))}
    </div>
  );
