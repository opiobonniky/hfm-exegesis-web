import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { animCardUp, animStagger } from "./animations";
import { LandingSectionHeader } from "./LandingSectionHeader";
import { tt } from "@/components/languages/hardcodedTranslate";
import type { StudyApproachSectionProps } from "../../types";

export function StudyApproachSection({ eyebrow, title, lead, steps, ctaLabel, ctaHref }: StudyApproachSectionProps) {
  return (
    <section id="approach" className="py-14 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-12 bg-background">
      <div className="w-full max-w-screen-xl mx-auto">
        <LandingSectionHeader eyebrow={eyebrow} title={title} lead={lead} />

        <motion.ol
          variants={animStagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="mt-10 sm:mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5"
        >
          {steps.map((step, index) => (
            <motion.li key={step.title} variants={animCardUp} className="group h-full">
              <div className="h-full relative flex flex-col p-6 rounded-[1.75rem] bg-card border border-border hover:shadow-xl transition-all duration-500">
                <span className="absolute top-5 right-5 text-4xl font-black text-brand-primary/10 leading-none">
                  {index + 1}
                </span>
                <div className="w-11 h-11 rounded-2xl bg-brand-bg flex items-center justify-center mb-4 group-hover:bg-brand-primary transition-colors duration-500">
                  <step.icon className="w-5 h-5 text-brand-primary group-hover:text-white" />
                </div>
                <h3 className="text-base font-black text-brand-primary mb-2 font-[family-name:var(--font-heading)] tracking-tight">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground font-medium">{step.description}</p>
              </div>
            </motion.li>
          ))}
        </motion.ol>

        <div className="mt-10 sm:mt-12 flex justify-center">
          <Link to={ctaHref}>
            <Button className="bg-brand-primary text-white hover:bg-brand-primary-dark px-8 py-6 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-widest shadow-xl shadow-brand-primary/20">
              {ctaLabel}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}