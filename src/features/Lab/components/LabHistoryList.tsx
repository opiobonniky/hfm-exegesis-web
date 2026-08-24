import { Play, CheckCircle2, FileText, ChevronRight, ScrollText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<string, string> = { look: "Look Stage", listen: "Listen Stage", learn: "Learn Stage", abide: "Abide Stage" };
const TimeAgo = (d: string) => {
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};
interface Props {
  history: any[];
  handleResumeStudy: (s: any) => void;
  handleReviewStudy: (id: string) => void;
}
export function LabHistoryList({ history, handleResumeStudy, handleReviewStudy }: Props) {
  return (
    <section className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-6">
      <div className="flex items-center gap-2 mb-4">
        <ScrollText className="w-4 h-4 text-muted-foreground/50" />
        <p className="text-xs font-bold text-foreground">Previous Studies</p>
        <span className="text-[10px] text-muted-foreground/50 ml-auto">{history.length} total</span>
      </div>
      <div className="space-y-2">
        {history.map((session) => {
          const isActive = !session.completed;
          const isCompleted = session.currentStage === "completed";
          const statusLabel = isActive ? STATUS_LABELS[session.currentStage] || session.currentStage : isCompleted ? "Completed" : "Abandoned";
          return (
            <button key={session.id} onClick={() => isActive ? handleResumeStudy(session) : handleReviewStudy(session.id)}
              className={cn("w-full rounded-xl bg-card border transition-all hover:bg-muted/50 active:scale-[0.98] overflow-hidden group text-left",
                isActive ? "border-l-[3px] border-l-primary border-border/60" : "border-border/50")}>
              <div className="p-3.5 flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105",
                  isActive ? "bg-primary/10" : isCompleted ? "bg-green-500/10" : "bg-muted/50")}>
                  {isActive ? <Play className="w-4 h-4 text-primary fill-primary/20" /> : isCompleted ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <FileText className="w-4 h-4 text-muted-foreground/50" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{session.passageRef}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-muted-foreground/50">{TimeAgo(session.updatedOn || session.createdOn)}</span>
                    <span className="text-muted-foreground/20">&middot;</span>
                    <Badge variant="outline" className={cn("text-[10px] font-bold px-1.5 py-0",
                      isActive && "text-primary border-primary/30 bg-primary/8",
                      isCompleted && "text-green-600 border-green-500/30 bg-green-500/8",
                      !isActive && !isCompleted && "text-muted-foreground border-border/50 bg-muted/30")}>
                      {statusLabel}
                    </Badge>
                  </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground/25 group-hover:text-muted-foreground/50 transition-colors shrink-0" />
              </div>
            </button>
          );
        })}
    </section>
  );
