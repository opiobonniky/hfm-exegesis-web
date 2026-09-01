/**
 * AuthStepBars — step bars indicator for multi-step forms.
 */
interface AuthStepBarsProps {
  total: number;
  current: number;
}

export function AuthStepBars({ total, current }: AuthStepBarsProps) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {Array.from({ length: total }, (_, i) => (
        <div key={i + 1} className={`h-1.5 rounded-full flex-1 transition-all ${current >= i + 1 ? "bg-primary" : "bg-muted"}`} />
      ))}
    </div>
  );
}
