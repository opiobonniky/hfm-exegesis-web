import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { animFadeUp } from "./animations";
import type { CtaSectionProps } from "../../types";

export function CTASection({ title, body, primaryLabel, primaryHref, secondaryLabel, secondaryHref }: CtaSectionProps) {
  return (
    <section className="py-16 sm:py-20 md:py-28 px-4 sm:px-6 lg:px-12 bg-brand-dark text-center">
      <div className="w-full max-w-3xl mx-auto">
        <motion.div variants={animFadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black font-[family-name:var(--font-heading)] leading-[1.12] tracking-tighter text-white">
            {title}
          </h2>
          <p className="mt-5 text-sm sm:text-base md:text-lg text-white/75 font-medium leading-relaxed">
            {body}
          </p>
          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to={primaryHref} className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-brand-accent text-white hover:bg-brand-accent-dark px-8 sm:px-10 py-6 rounded-2xl font-black text-sm sm:text-base uppercase tracking-widest shadow-2xl shadow-brand-accent/30">
                {primaryLabel}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to={secondaryHref} className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full sm:w-auto border-2 border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white px-8 sm:px-10 py-6 rounded-2xl font-black text-sm sm:text-base uppercase tracking-widest"
              >
                {secondaryLabel}
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}