import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { animCardUp, animStagger } from "./animations";
import { LandingSectionHeader } from "./LandingSectionHeader";
import type { PlanComparisonSectionProps } from "../../types";

export function PlanComparisonSection({
  eyebrow,
  title,
  body,
  bodySecondary,
  columns,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
}: PlanComparisonSectionProps) {
  return (
    <section id="choose-plan" className="py-14 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-12 bg-card">
      <div className="w-full max-w-screen-xl mx-auto">
        <LandingSectionHeader eyebrow={eyebrow} title={title} lead={body} />

        <motion.div
          variants={animStagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="mt-10 sm:mt-14 grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 max-w-4xl mx-auto"
        >
          {columns.map((column) => (
            <motion.div
              key={column.title}
              variants={animCardUp}
              className={`h-full flex flex-col p-6 sm:p-8 rounded-[1.75rem] border bg-background transition-shadow duration-500 ${
                column.featured ? "border-primary/40 shadow-xl" : "border-border"
              }`}
            >
              <h3 className="text-lg sm:text-xl font-black text-brand-primary font-[family-name:var(--font-heading)] tracking-tight">
                {column.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground font-medium leading-relaxed">{column.description}</p>
              <ul className="mt-5 space-y-2.5 flex-1">
                {column.items.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-foreground font-medium">
                    <Check className="w-4 h-4 mt-0.5 shrink-0 text-brand-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        <p className="mt-8 text-center text-xs sm:text-sm text-muted-foreground font-medium max-w-2xl mx-auto">
          {bodySecondary}
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to={primaryHref}>
            <Button className="w-full sm:w-auto bg-brand-primary text-white hover:bg-brand-primary-dark px-8 py-6 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-widest shadow-xl shadow-brand-primary/20">
              {primaryLabel}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
          <Link to={secondaryHref}>
            <Button
              variant="outline"
              className="w-full sm:w-auto border-2 border-border bg-transparent text-foreground hover:border-primary hover:text-primary px-8 py-6 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-widest"
            >
              {secondaryLabel}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}