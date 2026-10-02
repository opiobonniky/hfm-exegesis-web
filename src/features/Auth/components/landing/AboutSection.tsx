import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { animFadeUp, animSlideLeft } from "./animations";
import { LandingSectionHeader } from "./LandingSectionHeader";
import logoImage from "@/assets/logos/exegesis_bg_rm.webp";
import heroBgWebp from "@/assets/logos/hero-bg.webp";
import heroBgJpeg from "@/assets/logos/hero-bg.jpeg";
import { tt } from "@/components/languages/hardcodedTranslate";
import type { AboutSectionProps } from "../../types";

export function AboutSection({ eyebrow, title, paragraphs, ctaLabel, ctaHref }: AboutSectionProps) {
  return (
    <section id="about" className="py-14 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-12 bg-background">
      <div className="w-full max-w-screen-xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <motion.div
          variants={animSlideLeft}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="order-2 lg:order-1"
        >
          <LandingSectionHeader eyebrow={eyebrow} title={title} />
          <div className="mt-6 space-y-4 text-sm sm:text-base text-muted-foreground leading-relaxed font-medium">
            {paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <div className="mt-8">
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
        </motion.div>

        <motion.div
          variants={animFadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="order-1 lg:order-2"
        >
          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute inset-0 rounded-[2.5rem] bg-brand-primary/10 blur-2xl" />
            <div className="relative rounded-[2.5rem] overflow-hidden border border-border shadow-xl">
              <picture>
                <source srcSet={heroBgWebp} type="image/webp" />
                <img src={heroBgJpeg} alt={tt("The Exegesis Project")} className="w-full h-72 sm:h-96 object-cover" loading="lazy" />
              </picture>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-0 inset-x-0 p-6 flex items-center gap-4">
                <img src={logoImage} alt={tt("Exegesis")} className="w-12 h-12 object-contain" />
                <div>
                  <p className="text-sm font-black uppercase tracking-widest text-white">
                    {tt("The Exegesis Project")}
                  </p>
                  <p className="text-xs text-white/70 font-medium">
                    {tt("Read with attention. Reflect with care.")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}