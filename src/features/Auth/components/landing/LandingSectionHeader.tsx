import { motion } from "framer-motion";
import { animFadeUp } from "./animations";
import type { LandingSectionHeaderProps } from "../../types";

export function LandingSectionHeader({ eyebrow, title, lead, tone = "default" }: LandingSectionHeaderProps) {
  const onDark = tone === "onDark";
  return (
    <motion.div
      variants={animFadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className="text-center max-w-3xl mx-auto"
    >
      <span
        className={`inline-flex items-center px-3 py-1.5 rounded-full border text-[10px] sm:text-xs font-black uppercase tracking-widest ${
          onDark ? "bg-white/10 border-white/20 text-white/90" : "bg-card border-border text-brand-primary"
        }`}
      >
        {eyebrow}
      </span>
      <h2
        className={`mt-5 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-[1.12] tracking-tighter font-[family-name:var(--font-heading)] ${
          onDark ? "text-white" : "text-foreground"
        }`}
      >
        {title}
      </h2>
      {lead ? (
        <p className={`mt-4 text-sm sm:text-base md:text-lg leading-relaxed font-medium ${onDark ? "text-white/75" : "text-muted-foreground"}`}>
          {lead}
        </p>
      ) : null}
    </motion.div>
  );
}