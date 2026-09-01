/**
 * AuthStepIndicator — step indicator dots for multi-step Auth flows.
 */
import { motion } from "framer-motion";

interface AuthStepIndicatorProps {
  steps: number;
  current: number;
}

export function AuthStepIndicator({ steps, current }: AuthStepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-1.5 mt-6">
      <span className="text-[10px] font-medium text-white/30 tracking-wider uppercase">Exegesis Project</span>
      <span className="text-[10px] text-white/20">&middot;</span>
      <span className="text-[10px] text-white/30 italic">The Living Text</span>
    </div>
  );
}

/**
 * AuthStepDots — animated step dots for ForgotPassword.
 */
export function AuthStepDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: total }, (_, i) => (
        <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ delay: 1.8 + i * 0.1 }}
          className={`h-1.5 rounded-full transition-all duration-500 ${i === current ? "w-8 bg-primary" : "w-2 bg-white/20"}`} />
      ))}
    </div>
  );
}
