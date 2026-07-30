import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Play,
  CheckCircle2,
  Sparkles,
  Eye,
  Ear,
  Brain,
  Heart,
  FileText,
  Loader2,
  Clock,
  BookMarked,
  TrendingUp,
  ChevronRight,
  LibraryBig,
  ArrowRight,
  Timer,
  Layers,
  NotebookPen,
  ScrollText,
  Cross,
  X,
  ChevronLeft,
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

const STAGE_META = [
  { key: "look", icon: Eye, label: "Look", desc: "Observe what the text says", color: "amber", tagline: "See clearly before you interpret", time: "8–12 min" },
  { key: "listen", icon: Ear, label: "Listen", desc: "Let the Word sink deep", color: "blue", tagline: "Hear with the heart, not just the head", time: "5–15 min" },
  { key: "learn", icon: Brain, label: "Learn", desc: "Understand the context", color: "purple", tagline: "Dig deeper with study tools", time: "15–25 min" },
  { key: "abide", icon: Heart, label: "Abide", desc: "Apply what you've learned", color: "rose", tagline: "Knowledge becomes transformation", time: "8–12 min" },
] as const;

const TOTAL_TIME = "40–60 min";

const SUGGESTED_PASSAGES = [
  { ref: "John 3:16", label: "God's Love", desc: "The Gospel in one verse" },
  { ref: "Psalm 23:1", label: "The Shepherd", desc: "Trust and provision" },
  { ref: "Philippians 4:13", label: "Strength", desc: "Contentment in Christ" },
  { ref: "Romans 8:28", label: "God's Purpose", desc: "Hope in all things" },
  { ref: "Matthew 5:3", label: "Beatitudes", desc: "Kingdom living" },
] as const;

const STATUS_LABELS: Record<string, string> = {
  look: "Observing",
  listen: "Listening",
  learn: "Learning",
  abide: "Reflecting",
  completed: "Completed",
  abandoned: "Abandoned",
};

function TimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const ONBOARDING_STEPS = [
  {
    icon: Eye,
    title: "Look — See What the Text Says",
    desc: "Each study walks you through 4 stages: Look (careful observation), Listen (meditative repetition), Learn (research and context), and Abide (prayer and application). The stages build on each other.",
    color: "bg-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    icon: Layers,
    title: "Your Progress is Saved",
    desc: "Every word you write, every note you take is automatically saved. You can leave at any time and pick up exactly where you left off — your study session will appear at the top of this page.",
    color: "bg-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Sparkles,
    title: "Start with a Suggested Passage",
    desc: "Not sure where to begin? Pick from our suggested passages below, or choose any book, chapter, and verse to start your own study journey from scratch.",
    color: "bg-rose-500",
    bg: "bg-rose-500/10",
  },
] as const;

export default function LabHomePage() {
  const navigate = useNavigate();
  const { t, isRtl } = useLanguage();

  const [activeSession, setActiveSession] = useState<ExegesisSession | null>(null);
  const [history, setHistory] = useState<ExegesisSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);

  useEffect(() => {
    const seen = localStorage.getItem('lab_onboarding_seen');
    if (!seen) {
      setShowOnboarding(true);
    }
  }, []);

  const dismissOnboarding = useCallback(() => {
    setShowOnboarding(false);
    localStorage.setItem('lab_onboarding_seen', 'true');
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [currentRes, historyRes] = await Promise.allSettled([
        getCurrentSession(),
        getSessionHistory(0, 20),
      ]);
      if (currentRes.status === "fulfilled" && currentRes.value) setActiveSession(currentRes.value);
      if (historyRes.status === "fulfilled" && historyRes.value) setHistory(historyRes.value.data || []);
    } catch (e) {
      console.error("Failed to load lab data:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleResumeStudy = useCallback(
    (session: ExegesisSession) => {
      navigate(`${routes.labFlow.path}?sessionId=${session.id}&stage=${session.currentStage}&bookName=${encodeURIComponent(session.bookName)}&chapter=${session.chapter}&verseStart=${session.verseStart || ""}&verseEnd=${session.verseEnd || ""}`);
    },
    [navigate],
  );

  const handleReviewStudy = useCallback(
    (sessionId: string) => navigate(`/lab-review/${sessionId}`),
    [navigate],
  );

  const completedCount = history.filter((s) => s.completed).length;
  const inProgressCount = history.filter((s) => !s.completed).length;

  return (
    <div className="min-h-screen flex flex-col bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <header className="flex-shrink-0 border-b bg-background/80 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 sm:px-6 h-14">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-sm ring-1 ring-primary/10">
              <BookOpen className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-semibold tracking-wide text-foreground leading-none" style={{ fontFamily: "'Cinzel', serif" }}>
                Bible Study
              </h1>
              <p className="text-[10px] text-muted-foreground tracking-widest uppercase leading-none mt-0.5">Study the Word Deeply</p>
            </div>
          </div>
          <TierBadge />
        </div>
      </header>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center animate-pulse">
                <BookOpen className="w-8 h-8 text-primary/60" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary/30 animate-ping" />
            </div>
            <p className="text-sm font-semibold text-muted-foreground">Loading your studies...</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <Gate
            featureName="Exegesis Lab"
            featureDescription="The full 4-stage Scripture study journey (Look, Listen, Learn, Abide) is available for Legacy Sower and Covenant Sower subscribers."
          >
            {/* ══════════════════════════════════════════
               HERO
               ══════════════════════════════════════════ */}
            <section className="relative overflow-hidden bg-gradient-to-b from-primary/[0.04] via-primary/[0.01] to-transparent border-b border-border/30">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-primary/5" />
                <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-primary/5" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,rgba(var(--primary)/0.03)_0%,transparent_70%)]" />
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
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight mb-2">
                  Study the Word
                </h2>
                <p className="text-sm text-muted-foreground/70 max-w-md mx-auto mb-3">
                  A 4-step guided journey through Scripture — from observation to application.
                </p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/8 border border-primary/15 mb-4">
                  <Timer className="w-3 h-3 text-primary/60" />
                  <span className="text-[10px] font-bold text-primary/70">
                    ~{TOTAL_TIME} per study
                  </span>
                </div>

                {/* Active session CTA */}
                {activeSession && !activeSession.completed && (
                  <button
                    onClick={() => handleResumeStudy(activeSession)}
                    className="w-full rounded-xl bg-gradient-to-r from-primary to-primary/90 p-4 text-left mb-4 shadow-lg shadow-primary/25 group transition-all hover:shadow-xl hover:shadow-primary/30 active:scale-[0.99]"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center">
                          <Play className="w-3.5 h-3.5 text-white fill-white" />
                        </div>
                        <p className="text-sm font-bold text-white">Continue Study</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-white/60 group-hover:text-white/90 transition-colors" />
                    </div>
                    <p className="text-lg font-black text-white/90">{activeSession.passageRef}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/10 text-[10px] font-semibold text-white/80">
                        <Clock className="w-3 h-3" />
                        {STATUS_LABELS[activeSession.currentStage] || activeSession.currentStage}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/10 text-[10px] font-semibold text-white/80">
                        <Timer className="w-3 h-3" />
                        {TimeAgo(activeSession.updatedOn || activeSession.createdOn)}
                      </span>
                    </div>
                  </button>
                )}

                {/* Start new */}
                <div className="flex flex-col items-center gap-3">
                  <Button
                    onClick={() => navigate(routes.labFlow.path)}
                    className="gap-2 h-12 px-7 rounded-xl shadow-lg shadow-primary/25 text-sm font-bold"
                    size="lg"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    Start New Study
                  </Button>
                  {!activeSession && (
                    <p className="text-[10px] text-muted-foreground/50">Choose a passage and begin your journey</p>
                  )}
                </div>
              </div>
            </section>

            {/* ══════════════════════════════════════════
               STATS (only when history exists)
               ══════════════════════════════════════════ */}
            {history.length > 0 && (
              <section className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-6">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: completedCount, label: "Completed", icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" },
                    { value: history.length, label: "Total Studies", icon: Layers, color: "text-primary", bg: "bg-primary/10" },
                    { value: inProgressCount || "\u2014", label: "In Progress", icon: Timer, color: "text-amber-500", bg: "bg-amber-500/10" },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-xl bg-gradient-to-b from-card to-card/80 border border-border/40 shadow-sm p-3.5 text-center">
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2", stat.bg)}>
                        <stat.icon className={cn("w-4 h-4", stat.color)} />
                      </div>
                      <p className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
                        {stat.value}
                      </p>
                      <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mt-0.5">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ══════════════════════════════════════════
               THE FOUR STEPS
               ══════════════════════════════════════════ */}
            <section className="bg-muted/20 border-y border-border/20">
              <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-6">
                <div className="text-center mb-5">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-1">The Method</p>
                  <h3 className="text-base font-bold text-foreground">Four Steps to Deep Study</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {STAGE_META.map(({ key, icon: Icon, label, desc, color, tagline, time }, idx) => (
                    <div key={key} className="group relative rounded-xl bg-card border border-border/50 p-3.5 text-center hover:border-primary/20 hover:shadow-sm transition-all">
                      <div className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-muted-foreground/10 flex items-center justify-center">
                        <span className="text-[9px] font-bold text-muted-foreground/40">{idx + 1}</span>
                      </div>
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-1 transition-transform group-hover:scale-110",
                        `bg-${color}-500/10 text-${color}-600`,
                      )}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <p className="text-xs font-bold text-foreground mb-0.5">{label}</p>
                      <p className="text-[9px] text-muted-foreground/60 leading-4 mb-1.5">{desc}</p>
                      <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-muted/60 border border-border/30">
                        <Timer className="w-2.5 h-2.5 text-muted-foreground/50" />
                        <span className="text-[8px] font-semibold text-muted-foreground/60">{time}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <details className="group mt-3">
                  <summary className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-semibold text-muted-foreground/60 hover:text-foreground hover:bg-muted/50 cursor-pointer transition-colors list-none">
                    <Sparkles className="w-3.5 h-3.5" />
                    Why this method works
                    <ChevronRight className="w-3 h-3 group-open:rotate-90 transition-transform" />
                  </summary>
                  <div className="mt-2 rounded-xl bg-gradient-to-br from-primary/[0.03] to-primary/[0.01] border border-primary/10 p-4">
                    <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                      This 4-stage method is inspired by the ancient practice of <strong className="text-foreground">Lectio Divina</strong> ("divine reading").
                      Each stage builds on the previous one, guiding you from observation through meditation, study, and finally personal application.
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {STAGE_META.map(({ key, icon: Icon, label, tagline }) => (
                        <div key={key} className="flex items-start gap-2 p-2 rounded-lg bg-card/50 border border-border/30">
                          <Icon className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[10px] font-bold text-foreground">{label}</p>
                            <p className="text-[9px] text-muted-foreground/70 italic">{tagline}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </details>
              </div>
            </section>

            {/* ══════════════════════════════════════════
               SUGGESTED PASSAGES (new users)
               ══════════════════════════════════════════ */}
            {history.length === 0 && !activeSession && (
              <section className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-6">
                <div className="flex items-center gap-2 mb-3">
                  <NotebookPen className="w-4 h-4 text-primary" />
                  <p className="text-xs font-bold text-foreground">Suggested Passages</p>
                </div>
                <p className="text-[11px] text-muted-foreground/70 mb-3 leading-relaxed">
                  Not sure where to start? These well-loved passages are great for your first study:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {SUGGESTED_PASSAGES.map((p) => (
                    <button
                      key={p.ref}
                      onClick={() => navigate(`${routes.labFlow.path}?bookName=${encodeURIComponent(p.ref.split(" ")[0])}&chapter=${p.ref.match(/(\d+):/)?.[1] || ""}&verseStart=${p.ref.match(/:?(\d+)$/)?.[1] || ""}`)}
                      className="group rounded-xl bg-card border border-border p-3.5 text-left hover:bg-muted/50 hover:border-primary/30 hover:shadow-sm transition-all active:scale-[0.98]"
                    >
                      <p className="text-xs font-bold text-foreground">{p.ref}</p>
                      <p className="text-[11px] text-primary font-semibold mt-0.5">{p.label}</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-0.5">{p.desc}</p>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* ══════════════════════════════════════════
               PREVIOUS STUDIES
               ══════════════════════════════════════════ */}
            {history.length > 0 && (
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
                    const statusLabel = isActive
                      ? STATUS_LABELS[session.currentStage] || session.currentStage
                      : isCompleted ? "Completed" : "Abandoned";

                    return (
                      <button
                        key={session.id}
                        onClick={() => isActive ? handleResumeStudy(session) : handleReviewStudy(session.id)}
                        className={cn(
                          "w-full rounded-xl bg-card border transition-all hover:bg-muted/50 active:scale-[0.98] overflow-hidden group text-left",
                          isActive ? "border-l-[3px] border-l-primary border-border/60" : "border-border/50",
                        )}
                      >
                        <div className="p-3.5 flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105",
                            isActive ? "bg-primary/10" : isCompleted ? "bg-green-500/10" : "bg-muted/50",
                          )}>
                            {isActive ? (
                              <Play className="w-4 h-4 text-primary fill-primary/20" />
                            ) : isCompleted ? (
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                            ) : (
                              <FileText className="w-4 h-4 text-muted-foreground/50" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="text-sm font-semibold text-foreground truncate">{session.passageRef}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-muted-foreground/50">{TimeAgo(session.updatedOn || session.createdOn)}</span>
                              <span className="text-muted-foreground/20">&middot;</span>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-[10px] font-bold px-1.5 py-0",
                                  isActive && "text-primary border-primary/30 bg-primary/8",
                                  isCompleted && "text-green-600 border-green-500/30 bg-green-500/8",
                                  !isActive && !isCompleted && "text-muted-foreground border-border/50 bg-muted/30",
                                )}
                              >
                                {statusLabel}
                              </Badge>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground/25 group-hover:text-muted-foreground/50 transition-colors shrink-0" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ══════════════════════════════════════════
               EMPTY STATE
               ══════════════════════════════════════════ */}
            {!activeSession && history.length === 0 && (
              <section className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-12">
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-muted/60 to-muted/20 flex items-center justify-center mb-5 ring-1 ring-border/50">
                    <FileText className="w-10 h-10 text-muted-foreground/25" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-1">No studies yet</h3>
                  <p className="text-sm text-muted-foreground/70 max-w-xs leading-relaxed">
                    Start your first Bible study above to begin the 4-step journey through Scripture.
                  </p>
                </div>
              </section>
            )}

            {/* ══════════════════════════════════════════
               FOOTER
               ══════════════════════════════════════════ */}
            {history.length > 0 && (
              <section className="border-t border-border/20 bg-muted/10">
                <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-4 text-center">
                  <p className="text-[10px] text-muted-foreground/40">
                    Your study journey &middot; {history.length} session{history.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </section>
            )}
          </Gate>
        </div>
      )}

      {/* ══════════════════════════════════════════
         FIRST-TIME ONBOARDING OVERLAY
         ══════════════════════════════════════════ */}
      {showOnboarding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative w-full max-w-md rounded-2xl bg-card border border-border shadow-2xl overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-primary to-rose-500" />
            <button
              onClick={dismissOnboarding}
              className="absolute top-3 right-3 w-8 h-8 rounded-xl bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors z-10"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>

            <div className="p-6 pt-8">
              {/* Step indicator */}
              <div className="flex items-center gap-1.5 mb-6">
                {ONBOARDING_STEPS.map((_, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300",
                      idx === onboardingStep
                        ? "w-8 bg-primary"
                        : idx < onboardingStep
                          ? "w-2 bg-primary/40"
                          : "w-2 bg-muted-foreground/20",
                    )}
                  />
                ))}
                <span className="ml-auto text-[9px] font-bold text-muted-foreground/40 tabular-nums">
                  {onboardingStep + 1} / {ONBOARDING_STEPS.length}
                </span>
              </div>

              {/* Step content */}
              <div className="flex flex-col items-center text-center">
                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg transition-all",
                  ONBOARDING_STEPS[onboardingStep].bg,
                )}>
                  {(() => {
                    const Icon = ONBOARDING_STEPS[onboardingStep].icon;
                    return <Icon className={cn("w-8 h-8", ONBOARDING_STEPS[onboardingStep].color.replace('bg-', 'text-'))} />;
                  })()}
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  {ONBOARDING_STEPS[onboardingStep].title}
                </h3>
                <p className="text-sm text-muted-foreground/80 leading-relaxed max-w-sm">
                  {ONBOARDING_STEPS[onboardingStep].desc}
                </p>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8 gap-3">
                {onboardingStep > 0 ? (
                  <button
                    onClick={() => setOnboardingStep((s) => s - 1)}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-muted/50 transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Back
                  </button>
                ) : (
                  <div />
                )}

                {onboardingStep < ONBOARDING_STEPS.length - 1 ? (
                  <button
                    onClick={() => setOnboardingStep((s) => s + 1)}
                    className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-sm hover:opacity-90 transition-all"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={dismissOnboarding}
                    className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-sm hover:opacity-90 transition-all"
                  >
                    {onboardingStep === ONBOARDING_STEPS.length - 1 ? "Start Studying" : "Get Started"}
                  </button>
                )}
              </div>
            </div>

            {/* Skip link */}
            {onboardingStep < ONBOARDING_STEPS.length - 1 && (
              <button
                onClick={dismissOnboarding}
                className="w-full py-2.5 text-[10px] font-semibold text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors border-t border-border/30"
              >
                Skip tutorial
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}