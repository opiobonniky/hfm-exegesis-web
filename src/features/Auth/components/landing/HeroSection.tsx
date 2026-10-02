import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Heart, NotebookPen, Search, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBgWebp from "@/assets/logos/hero-bg.webp";
import heroBgJpeg from "@/assets/logos/hero-bg.jpeg";
import logoImage from "@/assets/logos/exegesis_bg_rm.webp";
import { tt } from "@/components/languages/hardcodedTranslate";
import type { HeroSectionProps } from "../../types";

export function HeroSection({
  eyebrow,
  title,
  body,
  support,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  onSecondaryClick,
  previewVerse,
  previewReference,
  previewTranslation,
}: HeroSectionProps) {
  return (
    <section id="home" className="relative overflow-hidden bg-brand-dark">
      <div className="absolute inset-0">
        <picture>
          <source srcSet={heroBgWebp} type="image/webp" />
          <img src={heroBgJpeg} alt="" className="w-full h-full object-cover" loading="eager" />
        </picture>
        <div className="absolute inset-0 bg-black/65" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-28 pb-16 sm:pt-32 sm:pb-20 lg:pt-40 lg:pb-24">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-center lg:text-left"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-[10px] sm:text-xs font-black text-white uppercase tracking-widest">
              {eyebrow}
            </span>

            <h1 className="mt-5 text-3xl sm:text-4xl md:text-5xl lg:text-[3.4rem] font-black text-white leading-[1.08] tracking-tighter font-[family-name:var(--font-heading)]">
              {title}
            </h1>

            <p className="mt-5 text-sm sm:text-base md:text-lg text-white/80 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
              {body}
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 sm:gap-5 justify-center lg:justify-start">
              <Link to={primaryHref} className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-brand-accent text-white hover:bg-brand-accent-dark px-8 py-6 rounded-2xl font-black text-sm sm:text-base uppercase tracking-widest shadow-2xl shadow-brand-accent/30">
                  {primaryLabel}
                  <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={onSecondaryClick}
                className="w-full sm:w-auto border-2 border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white px-8 py-6 rounded-2xl font-black text-sm sm:text-base uppercase tracking-widest backdrop-blur-sm"
              >
                {secondaryLabel}
              </Button>
            </div>

            <p className="mt-6 text-xs sm:text-sm text-white/65 font-medium max-w-xl mx-auto lg:mx-0">
              {support}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative"
          >
            <div className="mx-auto w-full max-w-md rounded-[2.5rem] border border-white/15 bg-black/40 backdrop-blur-md p-3 shadow-2xl">
              <div className="rounded-[1.75rem] bg-background text-foreground overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-brand-bg">
                  <div className="flex items-center gap-2">
                    <img src={logoImage} alt="Exegesis" className="w-6 h-6 object-contain" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary">
                      {previewTranslation}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Search className="w-3.5 h-3.5" />
                    <Star className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="px-5 py-6 space-y-3">
                  <p className="text-sm sm:text-base font-bold leading-relaxed text-foreground">
                    {previewVerse}
                  </p>
                  <p className="text-xs font-black uppercase tracking-widest text-brand-primary">
                    {previewReference}
                  </p>
                  <div className="pt-4 grid grid-cols-3 gap-2">
                    <div className="rounded-xl bg-brand-bg p-3 flex flex-col items-center gap-1.5 text-brand-primary">
                      <BookOpen className="w-4 h-4" />
                      <span className="text-[9px] font-black uppercase tracking-widest">{tt("Study")}</span>
                    </div>
                    <div className="rounded-xl bg-brand-bg p-3 flex flex-col items-center gap-1.5 text-brand-primary">
                      <Heart className="w-4 h-4" />
                      <span className="text-[9px] font-black uppercase tracking-widest">{tt("Plan")}</span>
                    </div>
                    <div className="rounded-xl bg-brand-bg p-3 flex flex-col items-center gap-1.5 text-brand-primary">
                      <NotebookPen className="w-4 h-4" />
                      <span className="text-[9px] font-black uppercase tracking-widest">{tt("Journal")}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}