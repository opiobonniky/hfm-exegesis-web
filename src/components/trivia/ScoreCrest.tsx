export default function ScoreCrest({
  correct,
  total,
}: {
  correct: number;
  total: number;
}) {
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="100" height="100" viewBox="0 0 100 100" className="absolute">
        <circle
          cx="50"
          cy="50"
          r="44"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="4 4"
          className="text-primary/30"
        />
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
          className="text-primary/20"
        />
        {[0, 90, 180, 270].map((angle) => (
          <g key={angle} transform={`rotate(${angle} 50 50)`}>
            <rect x="47" y="5" width="6" height="6" rx="1" fill="hsl(var(--primary))" opacity="0.3" transform="rotate(45 50 8)" />
          </g>
        ))}
      </svg>

      <div className="flex flex-col items-center">
        <p className="text-xl font-black text-foreground">{percentage}%</p>
        <p className="text-[7px] font-bold text-primary/50 uppercase tracking-[0.2em]">
          accuracy
        </p>
      </div>
    </div>
  );
}
