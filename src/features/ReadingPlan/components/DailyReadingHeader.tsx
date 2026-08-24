import { ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  planTitle: string;
  dayNumber: number;
  totalDays: number;
  isCompleted: boolean;
  onBack: () => void;
}

export default function DailyReadingHeader({ planTitle, dayNumber, totalDays, isCompleted, onBack }: Props) {
  return (
    <header className="flex-shrink-0 sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between px-4 py-3">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="w-5 h-5" /></Button>
        <div className="text-center flex-1 min-w-0 px-2">
          <p className="text-sm font-semibold truncate">{planTitle}</p>
          <p className="text-[10px] text-muted-foreground">Day {dayNumber}{totalDays > 0 ? ` of ${totalDays}` : ""}</p>
        </div>
        {isCompleted && <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />}
      </div>
    </header>
  );
}
