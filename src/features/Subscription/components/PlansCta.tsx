import { Link } from "react-router-dom";
import { ArrowRight, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import type { PlansCtaProps } from "../types";

export function PlansCta({ title, body, primaryLabel, primaryHref, secondaryLabel, secondaryHref }: PlansCtaProps) {
  return (
    <section className="relative overflow-hidden px-4 sm:px-6 lg:px-12 pt-10 sm:pt-12 pb-14 sm:pb-20 bg-brand-bg text-center">
      <div className="relative w-full max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black font-[family-name:var(--font-heading)] tracking-tighter leading-tight text-foreground">
            {title}
          </h2>
          <p className="mt-5 text-sm sm:text-base md:text-lg text-muted-foreground font-medium leading-relaxed">{body}</p>
          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to={primaryHref} className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-brand-primary text-white hover:bg-brand-primary-dark px-8 sm:px-10 py-6 rounded-2xl font-black text-sm sm:text-base uppercase tracking-widest shadow-xl shadow-brand-primary/20">
                {primaryLabel}
                <ArrowRight className="ml-2 w-5 h-5" aria-hidden="true" />
              </Button>
            </Link>
            <Link to={secondaryHref} className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full sm:w-auto border-2 border-brand-primary/30 bg-card text-brand-primary hover:bg-brand-primary hover:text-white px-8 sm:px-10 py-6 rounded-2xl font-black text-sm sm:text-base uppercase tracking-widest"
              >
                <BookOpen className="mr-2 w-5 h-5" aria-hidden="true" />
                {secondaryLabel}
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}