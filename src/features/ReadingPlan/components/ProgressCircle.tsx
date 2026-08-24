/** ProgressCircle — SVG ring showing percent completion */
export function ProgressCircle({
  percent, color = "#14b8a6", backgroundColor = "#e5e7eb", size = 68, isRtl,
}: {
  percent: number; color?: string; backgroundColor?: string; size?: number; isRtl?: boolean;
}) {
  const sw = 4;
  const r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className={isRtl ? "rotate-90" : "-rotate-90"}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={backgroundColor} strokeWidth={sw} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={sw}
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.5s ease" }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold" style={{ color }}>{percent}%</span>
      </div>
    </div>
  );
}
