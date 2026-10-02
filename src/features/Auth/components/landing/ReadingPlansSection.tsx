import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { animCardUp, animStagger } from "./animations";
import { LandingSectionHeader } from "./LandingSectionHeader";
import { tt } from "@/components/languages/hardcodedTranslate";
import type { ReadingPlansSectionProps } from "../../types";

export function ReadingPlansSection({ eyebrow, title, body, plans, ctaLabel, ctaHref }: ReadingPlansSectionProps) {
  return (
    <section id="plans" className="py-14 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-12 bg-brand-card border-y border-border">
      <div className="w-full max-w-screen-xl mx-auto">
        <LandingSectionHeader eyebrow={eyebrow} title={title} lead={body} />

        <motion.div
          variants={animStagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="mt-10 sm:mt-14 grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6"
        >
          {plans.map((plan) => (
            <motion.div key={plan.title} variants={animCardUp} className="group h-full">
              <div className="h-full flex flex-col p-6 sm:p-7 rounded-[1.75rem] bg-card border border-border hover:border-primary/30 hover:shadow-xl transition-all duration-500">
                <div className="w-11 h-11 rounded-2xl bg-brand-bg flex items-center justify-center mb-5 group-hover:bg-brand-primary transition-colors duration-500">
                  <CalendarDays className="w-5 h-5 text-brand-primary group-hover:text-white" />
                </div>
                <h3 className="text-base sm:text-lg font-black text-foreground mb-2 font-[family-name:var(--font-heading)] tracking-tight">
                  {plan.title}
                </h3>
                <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-brand-accent mb-3">
                  {plan.meta}
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground font-medium">{plan.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-10 sm:mt-12 flex justify-center">
          <Link to={ctaHref}>
            <Button
              variant="outline"
              className="border-2 border-border bg-transparent text-foreground hover:border-primary hover:text-primary px-8 py-5 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-widest"
            >
              {ctaLabel}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}