/**
 * HimFirstHero — dark hero section with centered title, subtitle, and optional badge.
 */
import { ReactNode } from "react";
import { motion } from "framer-motion";

interface HimFirstHeroProps {
  title: ReactNode;
  subtitle: string;
  badge?: ReactNode;
}

const animFadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const } },
};

export function HimFirstHero({ title, subtitle, badge }: HimFirstHeroProps) {
  return (
    <section className="pt-16 sm:pt-20 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-12 bg-brand-dark">
      <div className="w-full max-w-4xl mx-auto text-center">
        <motion.div variants={animFadeUp} initial="hidden" animate="visible">
          {badge}
          {title}
          <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed font-medium">
            {subtitle}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
