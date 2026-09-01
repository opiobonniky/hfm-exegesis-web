/**
 * RegisterStepIndicator — step bars for Register form.
 */

interface RegisterStepIndicatorProps {
  totalSteps: number;
  currentStep: number;
}

export function RegisterStepIndicator({ totalSteps, currentStep }: RegisterStepIndicatorProps) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div key={i + 1} className={`h-1.5 rounded-full flex-1 transition-all ${currentStep >= i + 1 ? "bg-primary" : "bg-muted"}`} />
      ))}
    </div>
  );
}
