import { useEffect } from "react";
import { cn } from "@/lib/utils";

interface WaveformAnimationProps {
  /** Whether the waveform animates (playing) or stays still (paused) */
  active: boolean;
  /** Number of bars (default 10) */
  barCount?: number;
  /** Active bar color as a CSS color value (default: rgb(59, 130, 246) — Tailwind blue-500) */
  activeColor?: string;
  /** Inactive bar color (default: rgb(156, 163, 175) — Tailwind gray-400) */
  inactiveColor?: string;
  /** Additional CSS classes for the container */
  className?: string;
  /** Bar container height (default: h-3) */
  sizeClass?: string;
  /** Gap between bars (default: gap-[2px]) */
  gapClass?: string;
}

const WAVEFORM_CSS_ID = "waveform-animation-keyframes";

/** @internal — exported for testing only */
export function __test__ensureKeyframesInjected() {
  if (typeof document === "undefined") return;
  if (document.getElementById(WAVEFORM_CSS_ID)) return;
  const style = document.createElement("style");
  style.id = WAVEFORM_CSS_ID;
  style.textContent = `
    @keyframes waveform-bar {
      0%, 100% { height: 4px; }
      25% { height: 16px; }
      50% { height: 10px; }
      75% { height: 20px; }
    }
    .waveform-bar-reusable {
      width: 3px;
      border-radius: 1.5px;
      animation: waveform-bar 0.8s ease-in-out infinite alternate;
    }
    .waveform-bar-reusable.paused {
      animation: none !important;
      height: 6px !important;
    }
  `;
  document.head.appendChild(style);
}

export default function WaveformAnimation({
  active,
  barCount = 10,
  activeColor = "rgb(59, 130, 246)",
  inactiveColor = "rgb(156, 163, 175)",
  className,
  sizeClass = "h-3",
  gapClass = "gap-[2px]",
}: WaveformAnimationProps) {
  // Inject keyframes once per page load
  useEffect(() => {
    __test__ensureKeyframesInjected();
  }, []);

  const bars = Array.from({ length: barCount }, (_, i) => ({
    delay: `${(i * (0.8 / barCount)).toFixed(2)}s`,
  }));

  return (
    <div
      className={cn("flex items-end", sizeClass, gapClass, className)}
      aria-hidden="true"
    >
      {bars.map((bar, i) => (
        <div
          key={i}
          className={cn("waveform-bar-reusable", !active && "paused")}
          style={{
            animationDelay: bar.delay,
            backgroundColor: active ? activeColor : inactiveColor,
            opacity: active ? 0.9 : 0.4,
          }}
        />
      ))}
    </div>
  );
}
