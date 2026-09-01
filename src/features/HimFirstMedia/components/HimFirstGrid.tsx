/**
 * HimFirstGrid — grid layout for HimFirstMedia card lists.
 * Replaces inline .map() with animated motion.div.
 */
import { ReactNode } from "react";
import { motion } from "framer-motion";

const animFadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const } },
};

interface HimFirstGridProps {
  children: ReactNode;
  columns?: 2 | 3;
  className?: string;
}

export function HimFirstGrid({ children, columns = 3, className }: HimFirstGridProps) {
  const cols = columns === 2 ? "grid sm:grid-cols-2 gap-6" : "grid sm:grid-cols-3 gap-6";
  return (
    <motion.div variants={animFadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className={`${cols} ${className || ""}`}>
      {children}
    </motion.div>
  );
}
