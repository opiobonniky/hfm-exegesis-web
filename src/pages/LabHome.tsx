import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Play,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Eye,
  Ear,
  Brain,
  Heart,
  FileText,
  Loader2,
} from "lucide-react";
import { useLanguage } from "@/components/languages/languageProvider";
import { routes } from "@/components/Routes/routes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCurrentSession, getSessionHistory } from "@/services/exegesisApi";
import type { ExegesisSession } from "@/services/exegesisApi";
import TierBadge from "@/components/TierBadge";
import Gate from "@/components/Gate";

const STAGE_ICONS: Record<string, any> = {
  look: Eye,
  listen: Ear,
  learn: Brain,
  abide: Heart,
};

const STAGE_LABELS: Record<string, string> = {
  look: "Look",
  listen: "Listen",
  learn: "Learn",
  abide: "Abide",
};

const STAGE_DESCRIPTIONS: Record<string, string> = {
  look: "Observe what the text says",
  listen: "Dwell in the Word",
  learn: "Understand the context",
  abide: "Apply and journal",
};

const STATUS_LABELS: Record<string, string> = {
  look: "Observing",
  listen: "Listening",
  learn: "Learning",
  abide: "Reflecting",
  completed: "Completed",
  abandoned: "Abandoned",
};

export default function LabHomePage() {
  const navigate = useNavigate();
  const { t, isRtl } = useLanguage();

  const [activeSession, setActiveSession] = useState<ExegesisSession | null>(null);
  const [history, setHistory] = useState<ExegesisSession[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [currentRes, historyRes] = await Promise.all([
        getCurrentSession(),
        getSessionHistory(0, 20),
      ]);
      if (currentRes) setActiveSession(currentRes);
      if (historyRes) setHistory(historyRes.data || []);
    } catch (e) {
      console.error("Failed to load lab data:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleResumeStudy = useCallback(
    (session: ExegesisSession) => {
      navigate(
        `${routes.labFlow.path}?sessionId=${session.id}&stage=${session.currentStage}&bookName=${encodeURIComponent(session.bookName)}&chapter=${session.chapter}&verseStart=${session.verseStart || ""}&verseEnd=${session.verseEnd || ""}`,
      );
    },
    [navigate],
  );

  return (
    <div
      className="min-h-screen flex flex-col bg-background"
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Header */}
      <header className="flex-shrink-0 border-b bg-background/95 backdrop-blur-sm sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1
                className="text-base sm:text-lg font-semibold tracking-wide text-foreground leading-none"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                Bible Study 
              </h1>
              <p className="text-[10px] text-muted-foreground tracking-widest uppercase leading-none mt-0.5">
                Study the Word Deeply
              </p>
            </div>
          </div>

          {/* ── Subscription Tier Badge ── */}
          <TierBadge />
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-4 pb-16">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
              <p className="text-sm font-semibold text-muted-foreground">Loading...</p>
            </div>
          ) : (
            <Gate
              featureName="Exegesis Lab"
              featureDescription="The full 4-stage Scripture study journey (Look, Listen, Learn, Abide) is available for Legacy Sower and Covenant Sower subscribers."
            >
              {/* Active Session Banner */}
              {activeSession && !activeSession.completed && (
                <button
                  onClick={() => handleResumeStudy(activeSession)}
                  className="w-full rounded-xl bg-primary p-5 text-left mb-4 hover:opacity-95 transition-all active:scale-[0.99] [touch-action:manipulation]"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary-foreground" />
                      <p className="text-base font-extrabold text-primary-foreground">
                        Continue Study
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-primary-foreground/70" />
                  </div>
                  <p className="text-xl font-black text-primary-foreground/90 mb-2">
                    {activeSession.passageRef}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-primary-foreground/70">
                      Current:{" "}
                      {STATUS_LABELS[activeSession.currentStage] ||
                        activeSession.currentStage}
                    </p>
                  </div>
                </button>
              )}

              {/* Start New Study */}
              <div className="rounded-xl bg-card border border-border p-6 flex flex-col items-center mb-5">
                <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center mb-3">
                  <BookOpen className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-base font-extrabold text-foreground mb-1">
                  Start New Study
                </h3>
                <p className="text-xs text-muted-foreground text-center max-w-xs mb-4">
                  Choose a passage and begin the 4-step journey
                </p>
                <Button
                  onClick={() => navigate(routes.labFlow.path)}
                  className="gap-2"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Begin
                </Button>
              </div>

              {/* The Four Steps */}
              <h3 className="text-sm font-bold text-foreground mb-3">
                The Four Steps
              </h3>
              <div className="grid grid-cols-2 gap-2 mb-5">
                {(["look", "listen", "learn", "abide"] as const).map(
                  (step, idx) => {
                    const StageIcon = STAGE_ICONS[step];
                    return (
                      <div
                        key={step}
                        className="relative rounded-xl bg-card border border-border p-3 flex flex-col items-center active:scale-[0.98] transition-all [touch-action:manipulation]"
                      >
                        <div className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <span className="text-[10px] font-black text-primary-foreground">
                            {idx + 1}
                          </span>
                        </div>
                        <StageIcon className="w-5 h-5 text-primary mb-1.5 mt-0.5" />
                        <p className="text-xs font-bold text-foreground mb-0.5">
                          {STAGE_LABELS[step]}
                        </p>
                        <p className="text-[10px] text-muted-foreground text-center leading-4">
                          {STAGE_DESCRIPTIONS[step]}
                        </p>
                      </div>
                    );
                  },
                )}
              </div>

              {/* Previous Studies */}
              {history.length > 0 && (
                <>
                  <h3 className="text-sm font-bold text-foreground mb-3">
                    Previous Studies
                  </h3>
                  <div className="space-y-2">
                    {history.map((session) => {
                      const isActive = !session.completed;
                      const statusLabel = isActive
                        ? STATUS_LABELS[session.currentStage] || session.currentStage
                        : session.currentStage === "completed"
                          ? "Completed"
                          : "Abandoned";

                      return (
                        <button
                          key={session.id}
                          onClick={() => handleResumeStudy(session)}                            className={cn(
                            "w-full flex items-center justify-between p-3 rounded-xl bg-card border transition-all hover:bg-muted/50 active:scale-[0.98] [touch-action:manipulation]",
                            isActive && "border-l-[3px] border-l-primary",
                            !isActive && "border-border",
                          )}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {isActive ? (
                              <Play className="w-4 h-4 text-primary shrink-0" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                            )}
                            <div className="text-left min-w-0">
                              <p className="text-sm font-semibold text-foreground truncate">
                                {session.passageRef}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <p className="text-[11px] text-muted-foreground">
                                  {new Date(
                                    session.updatedOn || session.createdOn,
                                  ).toLocaleDateString()}
                                </p>
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "text-[10px] font-bold px-1.5 py-0",
                                    isActive && "text-primary border-primary/30 bg-primary/10",
                                    !isActive &&
                                      session.currentStage === "completed" &&
                                      "text-green-600 border-green-500/30 bg-green-500/10",
                                    !isActive &&
                                      session.currentStage === "abandoned" &&
                                      "text-muted-foreground border-border bg-muted/30",
                                  )}
                                >
                                  {statusLabel}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Empty state */}
              {!activeSession && history.length === 0 && (
                <div className="flex flex-col items-center py-16">
                  <FileText className="w-12 h-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-base font-bold text-foreground mb-1">
                    No studies yet
                  </h3>
                  <p className="text-sm text-muted-foreground text-center max-w-sm">
                    Start your first Exegesis Lab study to begin the 4-step
                    journey through Scripture.
                  </p>
                </div>
              )}
            </Gate>
          )}
        </div>
      </div>
    </div>
  );
}
