import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { animCardUp, animStagger } from "./animations";
import { LandingSectionHeader } from "./LandingSectionHeader";
import { tt } from "@/components/languages/hardcodedTranslate";
import type { FeaturesSectionProps } from "../../types";

export function FeaturesSection({
  eyebrow,
  title,
  lead,
  features,
  ctaLabel,
  ctaTarget,
  onCtaClick,
  note,
}: FeaturesSectionProps) {
  return (
    <section id="features" className="py-14 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-12 bg-card">
      <div className="w-full max-w-screen-xl mx-auto">
        <LandingSectionHeader eyebrow={eyebrow} title={title} lead={lead} />

        <motion.div
          variants={animStagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="mt-10 sm:mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
        >
          {features.map((feature) => (
            <motion.div key={feature.title} variants={animCardUp} className="group h-full">
              <div className="h-full flex flex-col p-6 sm:p-7 rounded-[1.75rem] bg-background border border-border hover:border-primary/30 hover:shadow-[0_24px_48px_-12px_rgba(57,98,132,0.12)] transition-all duration-500">
                <div className="w-12 h-12 rounded-2xl bg-brand-bg flex items-center justify-center mb-5 group-hover:bg-brand-primary group-hover:text-white transition-colors duration-500">
                  <feature.icon className="w-6 h-6 text-brand-primary group-hover:text-white" />
                </div>
                <h3 className="text-base sm:text-lg font-black text-brand-primary mb-3 font-[family-name:var(--font-heading)] tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground font-medium">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-10 sm:mt-12 flex flex-col items-center gap-4">
          <Button
            variant="outline"
            onClick={onCtaClick}
            data-section-target={ctaTarget}
            className="border-2 border-border bg-transparent text-foreground hover:border-primary hover:text-primary px-8 py-5 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-widest"
          >
            {ctaLabel}
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
          <p className="text-xs text-muted-foreground font-medium">{note}</p>
        </div>
      </div>
    </section>
  );
}