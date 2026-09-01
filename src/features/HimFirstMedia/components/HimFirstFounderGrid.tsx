/**
 * HimFirstFounderGrid — founder bio cards.
 * Takes data array as prop — no .map() needed in page.
 */
import { motion } from "framer-motion";
import { FounderCard } from "./FounderCard";

const animFadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const } },
};

interface HimFirstFounderItem {
  name: string;
  role: string;
  bio: string;
}

interface HimFirstFounderGridProps {
  founders: HimFirstFounderItem[];
}

export function HimFirstFounderGrid({ founders }: HimFirstFounderGridProps) {
  return (
    <motion.div variants={animFadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="space-y-16">
      {founders.map((f, i) => (
        <FounderCard key={f.name} name={f.name} role={f.role} bio={f.bio} reverse={i % 2 === 1} />
      ))}
    </motion.div>
  );
}
