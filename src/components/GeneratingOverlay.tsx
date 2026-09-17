import { cn } from "@/lib/utils";

interface GeneratingOverlayProps {
  loading: boolean;
  tone?: "amber" | "rose" | "blue";
  label?: string;
}

const toneStyles = {
  amber: {
    bar: "from-amber-300/40 via-amber-500/70 to-amber-300/40 dark:from-amber-400/30 dark:via-amber-500/60 dark:to-amber-400/30",
    badge: "bg-amber-500/15 dark:bg-amber-500/20 border-amber-400/20 dark:border-amber-500/20",
    dot: "bg-amber-500 dark:bg-amber-400",
    text: "text-amber-700 dark:text-amber-300",
  },
  rose: {
    bar: "from-rose-300/40 via-rose-500/70 to-rose-300/40 dark:from-rose-400/30 dark:via-rose-500/60 dark:to-rose-400/30",
    badge: "bg-rose-500/15 dark:bg-rose-500/20 border-rose-400/20 dark:border-rose-500/20",
    dot: "bg-rose-500 dark:bg-rose-400",
    text: "text-rose-700 dark:text-rose-300",
  },
  blue: {
    bar: "from-blue-300/40 via-blue-500/70 to-blue-300/40 dark:from-blue-400/30 dark:via-blue-500/60 dark:to-blue-400/30",
    badge: "bg-blue-500/15 dark:bg-blue-500/20 border-blue-400/20 dark:border-blue-500/20",
    dot: "bg-blue-500 dark:bg-blue-400",
    text: "text-blue-700 dark:text-blue-300",
  },
} as const;

/**
 * Shimmer overlay for a container while AI generation / TTS loading is in
 * progress. Renders an animated pulse bar at the bottom and a status badge
 * with typing dots at the top-left. The parent must be `position: relative`.
 */
export function GeneratingOverlay({ loading, tone = "amber", label = "Generating" }: GeneratingOverlayProps) {
  if (!loading) return null;
  const s = toneStyles[tone];
  return (
    <>
      {/* Animated pulse bar at the bottom */}
      <div className="absolute inset-x-0 bottom-0 h-0.5 overflow-hidden rounded-b-lg">
        <div className={cn("h-full w-full bg-gradient-to-r animate-pulse", s.bar)} />
      </div>
      {/* Status badge */}
      <div
        className={cn(
          "absolute top-2 left-2 flex items-center gap-1.5 px-1.5 py-0.5 rounded-md backdrop-blur-sm border animate-in fade-in zoom-in-0 duration-200",
          s.badge,
        )}
      >
        {/* Typing-dots indicator */}
        <span className="flex items-center gap-[3px]" aria-hidden="true">
          {[0, 200, 400].map((delay) => (
            <span
              key={delay}
              className={cn("w-1 h-1 rounded-full", s.dot)}
              style={{ animation: "pulse 1.2s ease-in-out infinite", animationDelay: `${delay}ms` }}
            />
          ))}
        </span>
        <span className={cn("text-[8px] font-bold uppercase tracking-wider", s.text)}>
          {label}
        </span>
      </div>
    </>
  );
}
