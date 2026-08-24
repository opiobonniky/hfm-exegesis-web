import { BookOpen, X, ChevronLeft, ChevronRight, CheckCircle2, Layers, Timer, FileText, Sparkles, NotebookPen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLabHome } from "../hooks/useLabHome";
import { Gate } from "@/components/Gate";
import TierBadge from "@/components/TierBadge";
import { routes } from "@/components/Routes/routes";
import { LabHomeHero } from "../components/LabHomeHero";
import { LabHistoryList } from "../components/LabHistoryList";

const TOTAL_TIME = "15–25 min";
const STAGE_META = [
  { key: "look", icon: BookOpen, label: "Look", desc: "Read and observe", color: "blue", tagline: "See what is there", time: "5 min" },
  { key: "listen", icon: BookOpen, label: "Listen", desc: "Meditate and reflect", color: "amber", tagline: "Hear the Spirit speak", time: "5 min" },
  { key: "learn", icon: BookOpen, label: "Learn", desc: "Study and understand", color: "violet", tagline: "Deepen your knowledge", time: "5 min" },
  { key: "abide", icon: BookOpen, label: "Abide", desc: "Apply and pray", color: "emerald", tagline: "Live it out", time: "5 min" },
];
const ONBOARDING_STEPS = [
  { title: "Welcome to Exegesis Lab", desc: "A 4-step guided journey through Scripture.", icon: Sparkles, bg: "bg-primary/10", color: "text-primary" },
  { title: "Look, Listen, Learn, Abide", desc: "Each stage guides you deeper into the Word.", icon: BookOpen, bg: "bg-amber-100", color: "text-amber-600" },
  { title: "Start Your Journey", desc: "Choose a passage and begin studying.", icon: Play, bg: "bg-emerald-100", color: "text-emerald-600" },
export default function LabHomePage() {
  const p = useLabHome();
  const { navigate, activeSession, history, loading, showOnboarding, onboardingStep, setOnboardingStep, dismissOnboarding, handleResumeStudy, handleReviewStudy, refresh } = p;
  const completedCount = history.filter((s) => s.completed || s.currentStage === "completed").length;
  const inProgressCount = history.filter((s) => !s.completed && s.currentStage !== "completed").length;
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="flex-shrink-0 border-b bg-background/80 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 sm:px-6 h-14">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-sm ring-1 ring-primary/10">
              <BookOpen className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-semibold tracking-wide text-foreground leading-none" style={{ fontFamily: "'Cinzel', serif" }}>Bible Study</h1>
              <p className="text-[10px] text-muted-foreground tracking-widest uppercase leading-none mt-0.5">Study the Word Deeply</p>
          </div>
          <TierBadge />
        </div>
      </header>
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center animate-pulse"><BookOpen className="w-8 h-8 text-primary/60" /></div>
            <p className="text-sm font-semibold text-muted-foreground">Loading your studies...</p>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <Gate featureName="Exegesis Lab" featureDescription="The full 4-stage Scripture study journey is available for Legacy Sower and Covenant Sower subscribers.">
            <LabHomeHero activeSession={activeSession} navigate={navigate} routes={routes} handleResumeStudy={handleResumeStudy} />
            {history.length > 0 && (
              <section className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-6">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: completedCount, label: "Completed", icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" },
                    { value: history.length, label: "Total Studies", icon: Layers, color: "text-primary", bg: "bg-primary/10" },
                    { value: inProgressCount || "\u2014", label: "In Progress", icon: Timer, color: "text-amber-500", bg: "bg-amber-500/10" },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-xl bg-gradient-to-b from-card to-card/80 border border-border/40 shadow-sm p-3.5 text-center">
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2", stat.bg)}><stat.icon className={cn("w-4 h-4", stat.color)} /></div>
                      <p className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>{stat.value}</p>
                      <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mt-0.5">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
            <section className="bg-muted/20 border-y border-border/20">
              <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-6">
                <div className="text-center mb-5">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-1">The Method</p>
                  <h3 className="text-base font-bold text-foreground">Four Steps to Deep Study</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {STAGE_META.map(({ key, label, desc, color, time }, idx) => (
                    <div key={key} className="group relative rounded-xl bg-card border border-border/50 p-3.5 text-center hover:border-primary/20 hover:shadow-sm transition-all">
                      <div className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-muted-foreground/10 flex items-center justify-center"><span className="text-[9px] font-bold text-muted-foreground/40">{idx + 1}</span></div>
                      <p className="text-xs font-bold text-foreground mb-0.5">{label}</p>
                      <p className="text-[9px] text-muted-foreground/60 leading-4 mb-1.5">{desc}</p>
                      <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-muted/60 border border-border/30">
                        <Timer className="w-2.5 h-2.5 text-muted-foreground/50" /><span className="text-[8px] font-semibold text-muted-foreground/60">{time}</span>
                      </div>
              </div>
            </section>
            {history.length > 0 && <LabHistoryList history={history} handleResumeStudy={handleResumeStudy} handleReviewStudy={handleReviewStudy} />}
            {!activeSession && history.length === 0 && (
              <section className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-12">
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-muted/60 to-muted/20 flex items-center justify-center mb-5 ring-1 ring-border/50"><FileText className="w-10 h-10 text-muted-foreground/25" /></div>
                  <h3 className="text-lg font-bold text-foreground mb-1">No studies yet</h3>
                  <p className="text-sm text-muted-foreground/70 max-w-xs leading-relaxed">Start your first Bible study above to begin the 4-step journey through Scripture.</p>
            <section className="border-t border-border/20 bg-muted/10">
              <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-4 text-center">
                <p className="text-[10px] text-muted-foreground/40">Your study journey &middot; {history.length} session{history.length !== 1 ? "s" : ""}</p>
          </Gate>
      )}
      {showOnboarding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative w-full max-w-md rounded-2xl bg-card border border-border shadow-2xl overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-primary to-rose-500" />
            <button onClick={dismissOnboarding} className="absolute top-3 right-3 w-8 h-8 rounded-xl bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors z-10"><X className="w-4 h-4 text-muted-foreground" /></button>
            <div className="p-6 pt-8">
              <div className="flex items-center gap-1.5 mb-6">
                {ONBOARDING_STEPS.map((_, idx) => (
                  <div key={idx} className={cn("h-1.5 rounded-full transition-all duration-300", idx === onboardingStep ? "w-8 bg-primary" : idx < onboardingStep ? "w-2 bg-primary/40" : "w-2 bg-muted-foreground/20")} />
                ))}
                <span className="ml-auto text-[9px] font-bold text-muted-foreground/40 tabular-nums">{onboardingStep + 1} / {ONBOARDING_STEPS.length}</span>
              <div className="flex flex-col items-center text-center">
                <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg transition-all", ONBOARDING_STEPS[onboardingStep].bg)}>
                  {(() => { const Icon = ONBOARDING_STEPS[onboardingStep].icon; return <Icon className={cn("w-8 h-8", ONBOARDING_STEPS[onboardingStep].color.replace("bg-", "text-"))} />; })()}
                <h3 className="text-lg font-bold text-foreground mb-2">{ONBOARDING_STEPS[onboardingStep].title}</h3>
                <p className="text-sm text-muted-foreground/80 leading-relaxed max-w-sm">{ONBOARDING_STEPS[onboardingStep].desc}</p>
              <div className="flex items-center justify-between mt-8 gap-3">
                {onboardingStep > 0 ? <button onClick={() => setOnboardingStep((s) => s - 1)} className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-muted/50 transition-colors"><ChevronLeft className="w-3.5 h-3.5" />Back</button> : <div />}
                <button onClick={onboardingStep < ONBOARDING_STEPS.length - 1 ? () => setOnboardingStep((s) => s + 1) : dismissOnboarding}
                  className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-sm hover:opacity-90 transition-all">
                  {onboardingStep < ONBOARDING_STEPS.length - 1 ? "Next" : "Start Studying"}
                </button>
            {onboardingStep < ONBOARDING_STEPS.length - 1 && (
              <button onClick={dismissOnboarding} className="w-full py-2.5 text-[10px] font-semibold text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors border-t border-border/30">Skip tutorial</button>
    </div>
  );
}
