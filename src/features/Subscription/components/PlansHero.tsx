import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { tt } from "@/components/languages/hardcodedTranslate";
import type { PlansHeroProps } from "../types";

export function PlansHero({ eyebrow, title, body }: PlansHeroProps) {
  return (
    <section className="relative overflow-hidden bg-brand-dark pt-28 sm:pt-32 lg:pt-40 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-12 text-center">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.35) 0, transparent 45%), radial-gradient(circle at 80% 0%, rgba(255,255,255,0.25) 0, transparent 40%)",
        }}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}>
          <p className="text-brand-accent font-black uppercase tracking-[0.3em] text-[10px] sm:text-xs">{eyebrow}</p>
          <h1 className="mt-5 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black font-[family-name:var(--font-heading)] tracking-tighter leading-[1.05] text-white">
            {title}
          </h1>
          <p className="mt-6 text-sm sm:text-base md:text-lg text-white/75 font-medium leading-relaxed max-w-2xl mx-auto">
            {body}
          </p>
          <p className="mt-7 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-[11px] sm:text-xs font-semibold text-white/80">
            <ShieldCheck className="h-4 w-4 text-brand-accent" aria-hidden="true" />
            {tt("Bible reading is always free. No paywall on Scripture.")}
          </p>
        </motion.div>
      </div>
    </section>
  );
}