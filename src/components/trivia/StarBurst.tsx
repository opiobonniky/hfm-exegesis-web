import { useState, useRef, useEffect } from "react";

const STAR_COUNT = 36;
const STAR_COLORS = [
  "#D4AF37", "#FFF8DC", "#FFD700", "#F0E68C",
  "#E6C27A", "#FFDF00", "#DAA520", "#B8860B",
];

interface StarParticle {
  id: number;
  x: number;
  color: string;
  size: number;
  delay: number;
  duration: number;
  rotation: number;
  drift: number;
  shape: "star" | "cross" | "diamond";
}

export default function StarBurst({
  visible,
  onFinish,
}: {
  visible: boolean;
  onFinish: () => void;
}) {
  const [particles] = useState<StarParticle[]>(() =>
    Array.from({ length: STAR_COUNT }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
      size: 4 + Math.random() * 8,
      delay: Math.random() * 500,
      duration: 2000 + Math.random() * 2000,
      rotation: Math.random() * 360,
      drift: (Math.random() - 0.5) * 50,
      shape: (["star", "cross", "diamond"] as const)[
        Math.floor(Math.random() * 3)
      ],
    })),
  );
  const finishedRef = useRef(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (!visible) {
      finishedRef.current = 0;
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
      return;
    }

    finishedRef.current = 0;

    particles.forEach((p) => {
      const timer = setTimeout(() => {
        finishedRef.current += 1;
        if (finishedRef.current >= STAR_COUNT) {
          onFinish();
        }
      }, p.delay + p.duration);
      timersRef.current.push(timer);
    });

    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, [visible, particles, onFinish]);

  if (!visible) return null;

  const renderShape = (p: StarParticle) => {
    const s = p.size;
    switch (p.shape) {
      case "star":
        return (
          <svg
            width={s}
            height={s}
            viewBox="0 0 24 24"
            fill={p.color}
            style={{ filter: `drop-shadow(0 0 3px ${p.color}80)` }}
          >
            <polygon points="12,2 15,9 22,9 16,14 18,22 12,17 6,22 8,14 2,9 9,9" />
          </svg>
        );
      case "cross":
        return (
          <svg
            width={s}
            height={s}
            viewBox="0 0 24 24"
            fill={p.color}
            style={{ filter: `drop-shadow(0 0 3px ${p.color}80)` }}
          >
            <rect x="10" y="2" width="4" height="20" rx="1" />
            <rect x="2" y="10" width="20" height="4" rx="1" />
          </svg>
        );
      case "diamond":
        return (
          <svg
            width={s}
            height={s}
            viewBox="0 0 24 24"
            fill={p.color}
            style={{ filter: `drop-shadow(0 0 3px ${p.color}80)` }}
          >
            <polygon points="12,2 22,12 12,22 2,12" />
          </svg>
        );
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      <style>{`
        @keyframes starFall {
          0% { transform: translateY(-20px) rotate(0deg) translateX(0); opacity: 1; }
          100% { transform: translateY(105vh) rotate(540deg) translateX(var(--drift)); opacity: 0; }
        }
        @keyframes starGlow {
          0%, 100% { filter: brightness(1) drop-shadow(0 0 2px currentColor); }
          50% { filter: brightness(1.5) drop-shadow(0 0 6px currentColor); }
        }
      `}</style>
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.x}%`,
            top: "-30px",
            animation: `starFall ${p.duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94) ${p.delay}ms forwards`,
            "--drift": `${p.drift}px`,
            animationName: "starFall, starGlow",
            animationDuration: `${p.duration}ms, ${p.duration * 0.6}ms`,
            animationDelay: `${p.delay}ms, ${p.delay + p.duration * 0.2}ms`,
            animationTimingFunction: "cubic-bezier(0.25, 0.46, 0.45, 0.94), ease-in-out",
          } as React.CSSProperties}
        >
          {renderShape(p)}
        </div>
      ))}
    </div>
  );
}
