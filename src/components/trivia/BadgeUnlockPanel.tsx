import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import type { BadgeDefinition } from "@/hooks/useBadges";

const CATEGORY_COLORS: Record<string, string> = {
  milestone: "#6366F1",
  streak: "#F59E0B",
  exploration: "#10B981",
  difficulty: "#EC4899",
};

export default function BadgeUnlockPanel({
  badges,
  onClose,
}: {
  badges: BadgeDefinition[];
  onClose: () => void;
}) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Stagger entrance animation
    const timer = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    setTimeout(onClose, 300);
  };

  // Auto-dismiss after 4 seconds
  useEffect(() => {
    if (badges.length === 0) return;
    const timer = setTimeout(handleDismiss, 4000);
    return () => clearTimeout(timer);
  }, [badges]);

  if (badges.length === 0) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300",
        dismissed ? "opacity-0 scale-95" : "opacity-100 scale-100",
      )}
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div
        className={cn(
          "relative rounded-2xl border p-6 sm:p-8 max-w-sm w-full transition-all duration-300 overflow-hidden",
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        )}
        style={{
          background: "linear-gradient(180deg, hsl(var(--card)), hsl(var(--background)))",
          borderColor: "hsl(var(--primary)/0.2)",
          boxShadow: "0 0 40px hsl(var(--primary)/0.15), 0 20px 60px rgba(0,0,0,0.3)",
        }}
      >
        {/* Decorative glow */}
        <div
          className="absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full opacity-[0.08] blur-3xl"
          style={{ backgroundColor: "hsl(var(--primary))" }}
        />

        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
        >
          <X className="w-3.5 h-3.5 text-muted-foreground" />
        </button>

        <div className="relative text-center space-y-4">
          {/* Header */}
          <div>
            <p
              className="text-[10px] font-extrabold uppercase tracking-[0.2em] mb-1"
              style={{ color: "hsl(var(--primary)/0.6)" }}
            >
              Achievement Unlocked
            </p>
            <p className="text-lg font-black text-foreground" style={{ fontFamily: "'Cinzel', serif" }}>
              Badges Earned!
            </p>
          </div>

          {/* Badge cards */}
          <div className="space-y-3">
            {badges.map((badge, idx) => {
              const color = CATEGORY_COLORS[badge.category] || "#6366F1";
              return (
                <div
                  key={badge.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border transition-all duration-300",
                    visible && "opacity-100 translate-x-0",
                    !visible && "opacity-0 translate-x-4",
                  )}
                  style={{
                    borderColor: `${color}30`,
                    backgroundColor: `${color}08`,
                    transitionDelay: `${idx * 100}ms`,
                    boxShadow: `0 0 15px ${color}15`,
                  }}
                >
                  {/* Icon circle */}
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 text-2xl"
                    style={{
                      backgroundColor: `${color}18`,
                      border: `2px solid ${color}40`,
                      boxShadow: `0 0 20px ${color}25`,
                    }}
                  >
                    {badge.icon}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-extrabold text-foreground">{badge.name}</p>
                    <p className="text-[11px] text-muted-foreground/70 leading-tight mt-0.5">
                      {badge.description}
                    </p>
                  </div>

                  {/* Sparkle */}
                  <span className="text-lg animate-pulse">✨</span>
                </div>
              );
            })}
          </div>

          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="w-full py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all hover:brightness-110 active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary)/0.8))",
              color: "hsl(var(--primary-foreground))",
              boxShadow: "0 4px 12px hsl(var(--primary)/0.3)",
            }}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
