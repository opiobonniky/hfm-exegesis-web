import { BookOpen, Play, ChevronRight, Clock, Timer, Sparkles, Cross } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  activeSession: any; navigate: (p: string) => void; routes: any;
  handleResumeStudy: (s: any) => void;
}

const STATUS_LABELS: Record<string, string> = { look: "Look Stage", listen: "Listen Stage", learn: "Learn Stage", abide: "Abide Stage" };

const TimeAgo = (d: string) => {
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

export function LabHomeHero({ activeSession, navigate, routes, handleResumeStudy }: Props) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/[0.04] via-primary/[0.01] to-transparent border-b border-border/30">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-primary/5" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-primary/5" />
      </div>
      <div className="relative max-w-2xl mx-auto px-4 sm:px-6 pt-8 pb-10 text-center">
        <div className="inline-flex mb-5">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/25 to-primary/5 flex items-center justify-center shadow-xl shadow-primary/10 ring-1 ring-primary/15">
              <Cross className="w-8 h-8 text-primary" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-lg">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
          </div>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight mb-2">Study the Word</h2>
        <p className="text-sm text-muted-foreground/70 max-w-md mx-auto mb-3">A 4-step guided journey through Scripture — from observation to application.</p>
        {activeSession && !activeSession.completed && (
          <button onClick={() => handleResumeStudy(activeSession)}
            className="w-full rounded-xl bg-gradient-to-r from-primary to-primary/90 p-4 text-left mb-4 shadow-lg shadow-primary/25 group transition-all hover:shadow-xl active:scale-[0.99]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center"><Play className="w-3.5 h-3.5 text-white fill-white" /></div>
                <p className="text-sm font-bold text-white">Continue Study</p>
              </div>
              <ChevronRight className="w-4 h-4 text-white/60 group-hover:text-white/90 transition-colors" />
            </div>
            <p className="text-lg font-black text-white/90">{activeSession.passageRef}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/10 text-[10px] font-semibold text-white/80">
                <Clock className="w-3 h-3" />{STATUS_LABELS[activeSession.currentStage] || activeSession.currentStage}
              </span>
              <span className="text-[10px] text-white/60">{TimeAgo(activeSession.updatedOn || activeSession.createdOn)}</span>
            </div>
          </button>
        )}
        <div className="flex flex-col items-center gap-3">
          <Button onClick={() => navigate(routes.labFlow.path)} className="gap-2 h-12 px-7 rounded-xl shadow-lg shadow-primary/25 text-sm font-bold" size="lg">
            <Play className="w-4 h-4 fill-current" />Start New Study
          </Button>
          {!activeSession && <p className="text-[10px] text-muted-foreground/50">Choose a passage and begin your journey</p>}
        </div>
      </div>
    </section>
  );
}
