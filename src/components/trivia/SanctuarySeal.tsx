import { useState, useCallback, useMemo } from "react";
import { X, Sparkles, Zap, Award, PartyPopper } from "lucide-react";
import { cn } from "@/lib/utils";
import { tt } from '@/components/languages/hardcodedTranslate';

// ── Shared milestone constants (exported for use by TriviaPage) ──

export const MILESTONE_THRESHOLDS = [3, 5, 10, 25];

export const MILESTONE_CONFIGS: Record<number, { icon: any; color: string }> = {
  3: { icon: Sparkles, color: "#60A5FA" },
  5: { icon: Zap, color: "#D4AF37" },
  10: { icon: Award, color: "#8B5CF6" },
  25: { icon: PartyPopper, color: "#EC4899" },
};

export const MILESTONE_MESSAGES: Record<
  number,
  Record<string, { title: string; subtitle: string }>
> = {
  3: {
    elite: { title: tt("Bright Star!"), subtitle: tt("You shine with wisdom!") },
    strong: { title: tt("First Light!"), subtitle: tt("A promising beginning!") },
    solid: { title: tt("Dawn Breaks!"), subtitle: tt("Keep seeking understanding!") },
    growing: { title: tt("First Steps!"), subtitle: tt("Every scholar starts here!") },
  },
  5: {
    elite: { title: tt("Crown of Wisdom!"), subtitle: tt("Knowledge is your treasure!") },
    strong: { title: tt("Solid Ground!"), subtitle: tt("You're building deep roots!") },
    solid: { title: tt("Steady Flame!"), subtitle: tt("Keep the fire burning!") },
    growing: { title: tt("Persistent Heart!"), subtitle: tt("Patience bears fruit!") },
  },
  10: {
    elite: { title: tt("Scripture Scholar!"), subtitle: tt("The Word dwells in you richly!") },
    strong: { title: tt("Worthy Student!"), subtitle: tt("Your diligence shines brightly!") },
    solid: { title: tt("Faithful Seeker!"), subtitle: tt("Keep knocking — the door opens!") },
    growing: { title: tt("Steadfast Spirit!"), subtitle: tt("Little by little, you grow!") },
  },
  25: {
    elite: {
      title: tt("Master of the Word!"),
      subtitle: tt("A true disciple of the Scriptures!"),
    },
    strong: {
      title: tt("Well Versed!"),
      subtitle: tt("A quarter century of questions — magnificent!"),
    },
    solid: {
      title: tt("Devoted Mind!"),
      subtitle: tt("25 questions deep — unwavering dedication!"),
    },
    growing: {
      title: tt("Determined Soul!"),
      subtitle: tt("Steady persistence wins the race of faith!"),
    },
  },
};

export function getMessageTier(percentage: number): string {
  if (percentage >= 80) return "elite";
  if (percentage >= 60) return "strong";
  if (percentage >= 40) return "solid";
  return "growing";
}

// ── Component ──

export default function SanctuarySeal({
  visible,
  total,
  correct,
  percentage,
  onFinish,
}: {
  visible: boolean;
  total: number;
  correct: number;
  percentage: number;
  onFinish: () => void;
}) {
  const [closing, setClosing] = useState(false);

  const milestone = useMemo(() => {
    for (const m of MILESTONE_THRESHOLDS) {
      if (total === m) return m;
    }
    return null;
  }, [total]);

  const config = milestone ? MILESTONE_CONFIGS[milestone] : null;
  const tier = getMessageTier(percentage);
  const msg = milestone
    ? MILESTONE_MESSAGES[milestone]?.[tier] ?? {
        title: tt("Blessed!"),
        subtitle: tt("Well done, good and faithful servant!"),
      }
    : { title: "", subtitle: "" };
  const IconComp = config?.icon || Sparkles;
  const accentColor = config?.color || "#D4AF37";

  const handleClose = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onFinish();
    }, 200);
  }, [onFinish]);

  if (!visible || !milestone) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div className="absolute inset-0 bg-background/85 backdrop-blur-sm" />
      <div
        className={cn(
          "relative w-[85%] max-w-[380px] transition-all duration-300",
          closing ? "opacity-0 scale-[0.95] translate-y-4" : "opacity-100 scale-100 translate-y-0",
        )}
      >
        <div className="absolute -inset-1 rounded-[2rem] bg-gradient-to-b from-primary/40 via-primary/20 to-transparent blur-[2px]" />
        <div className="relative rounded-[1.75rem] bg-card border border-primary/30 overflow-hidden shadow-2xl shadow-primary/20">
          <div className="relative h-28 bg-gradient-to-b from-primary/20 via-primary/10 to-transparent">
            <svg
              className="absolute -top-1 left-1/2 -translate-x-1/2 w-36 h-20"
              viewBox="0 0 144 80"
              fill="none"
            >
              <path
                d="M72 0C72 0 144 10 144 80H0C0 10 72 0 72 0Z"
                fill="hsl(var(--primary)/0.15)"
              />
              <path
                d="M72 4C72 4 136 14 136 76H8C8 14 72 4 72 4Z"
                className="stroke-primary/40"
                strokeWidth="0.5"
              />
              <defs>
                <linearGradient id="arch-gradient" x1="72" y1="0" x2="72" y2="80">
                  <stop offset="0%" stopColor="hsl(var(--primary)/0.6)" />
                  <stop offset="100%" stopColor="hsl(var(--primary)/0)" />
                </linearGradient>
              </defs>
            </svg>

            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-b from-primary to-primary/80 p-[3px] shadow-lg shadow-primary/30">
                  <div className="w-full h-full rounded-full bg-card flex items-center justify-center border border-primary/50">
                    <div className="w-[82px] h-[82px] rounded-full border-2 border-primary/30 flex items-center justify-center">
                      <div
                        className="w-14 h-14 rounded-full flex items-center justify-center"
                        style={{
                          background: `radial-gradient(circle, ${accentColor}40, ${accentColor}20)`,
                        }}
                      >
                        <IconComp
                          className="w-7 h-7"
                          style={{ color: accentColor, filter: `drop-shadow(0 0 4px ${accentColor}60)` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 pt-14 pb-6 flex flex-col items-center">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-px bg-gradient-to-r from-transparent to-primary/40" />
              <span className="text-[10px] font-bold text-primary/60 uppercase tracking-[0.25em]">{tt("Milestone")}</span>
              <div className="w-8 h-px bg-gradient-to-l from-transparent to-primary/40" />
            </div>

            <p className="text-5xl font-black text-foreground leading-none mt-2 tracking-tight"
              style={{ fontFamily: "'Cinzel', serif" }}>
              {milestone}
            </p>
            <p className="text-[10px] font-bold text-primary/50 uppercase tracking-[0.2em] mt-1.5">{tt("Questions Answered")}</p>

            <div className="flex items-center gap-3 my-4 w-full max-w-[200px]">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              <div className="w-1.5 h-1.5 rotate-45 border border-primary/40" />
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            </div>

            <p
              className="text-lg font-black text-center leading-tight"
              style={{ color: accentColor, fontFamily: "'Cinzel', serif" }}
            >
              {msg.title}
            </p>
            <p className="text-xs text-muted-foreground font-medium text-center leading-relaxed mt-2 max-w-[260px]">
              {msg.subtitle}
            </p>

            <div className="flex items-center gap-4 mt-5 mb-3 px-5 py-3 rounded-xl bg-foreground/[0.04] border border-foreground/[0.06]">
              <div className="text-center">
                <p className="text-2xl font-black" style={{ color: accentColor }}>
                  {percentage}%
                </p>
                <p className="text-[9px] font-bold text-primary/50 uppercase tracking-wider">{tt("accuracy")}</p>
              </div>
              <div className="w-px h-8 bg-foreground/[0.08]" />
              <div className="text-center">
                <p className="text-sm font-bold text-foreground">
                  {correct}/{total}
                </p>
                <p className="text-[9px] font-bold text-primary/50 uppercase tracking-wider">{tt("score")}</p>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="px-10 py-2.5 rounded-full text-[11px] font-extrabold text-card transition-all hover:brightness-110 active:scale-[0.97] shadow-lg [touch-action:manipulation] uppercase tracking-wider bg-gradient-to-br from-primary to-primary/80"
              style={{
                boxShadow: `0 4px 14px hsl(var(--primary)/0.25)`,
              }}
            >{tt("Continue")}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
