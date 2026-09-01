/**
 * HimFirstLeaderGrid — leadership cards grid.
 * Takes data array as prop — no .map() needed in page.
 */
import { motion } from "framer-motion";
import { HimFirstCard, HimFirstAvatar } from "./HimFirstCard";

const animFadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const } },
};

interface HimFirstLeaderItem {
  name: string;
  role: string;
}

interface HimFirstLeaderGridProps {
  leaders: HimFirstLeaderItem[];
}

export function HimFirstLeaderGrid({ leaders }: HimFirstLeaderGridProps) {
  return (
    <motion.div variants={animFadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid sm:grid-cols-2 gap-8">
      {leaders.map((l) => (
        <HimFirstCard key={l.name} className="text-center">
          <HimFirstAvatar initial={l.name.charAt(0)} size="md" />
          <h3 className="text-xl font-black text-brand-primary mb-1 font-[family-name:var(--font-heading)]">{l.name}</h3>
          <p className="text-sm font-black text-brand-accent uppercase tracking-widest">{l.role}</p>
        </HimFirstCard>
      ))}
    </motion.div>
  );
}
