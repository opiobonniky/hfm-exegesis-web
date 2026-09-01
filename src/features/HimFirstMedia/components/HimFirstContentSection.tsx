/**
 * HimFirstContentSection — content section with max-width wrapper.
 */
import { ReactNode } from "react";
import { motion } from "framer-motion";

interface HimFirstContentSectionProps {
  children: ReactNode;
  className?: string;
}

const animFadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const } },
};

export function HimFirstContentSection({ children, className }: HimFirstContentSectionProps) {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-12 bg-card">
      <div className="w-full max-w-4xl mx-auto">
        {children}
      </div>
    </section>
  );
}

/**
 * HimFirstAnimated — motion wrapper with fade-up animation.
 */
export function HimFirstAnimated({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={animFadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className={className}>
      {children}
    </motion.div>
  );
}

/**
 * HimFirstQuoteBlock — styled quote block.
 */
export function HimFirstQuoteBlock({ quote, attribution }: { quote: string; attribution: string }) {
  return (
    <div className="bg-card rounded-[2rem] p-8 sm:p-12 border border-border text-center">
      <p className="text-xl sm:text-2xl font-black text-brand-accent italic font-[family-name:var(--font-heading)] tracking-tight mb-4">
        "{quote}"
      </p>
      <p className="text-sm font-black text-muted-foreground uppercase tracking-widest">— {attribution}</p>
    </div>
  );
}
