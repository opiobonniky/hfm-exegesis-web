import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/languages/languageProvider";
import { animScaleIn } from "./animations";

export function CTASection() {
  const { t } = useLanguage();
  return (
    <section className="py-14 sm:py-20 md:py-28 px-4 sm:px-6 lg:px-12 text-center relative overflow-hidden bg-background">
      <div className="absolute inset-0 bg-brand-card/50 -z-10" />
      <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-0">
        <motion.div variants={animScaleIn} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}>
          <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black font-[family-name:var(--font-heading)] mb-6 sm:mb-8 leading-tight text-brand-primary tracking-tighter">
            {t.landing?.ctaTitle || "Ready to Deepen Your"}{" "}
            <br className="hidden sm:block" />
            <span className="text-brand-accent">{t.landing?.ctaTitleHighlight || "Kingdom Impact?"}</span>
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-16">
            <Link to="/login" className="w-full sm:w-auto">
              <Button className="w-full bg-brand-primary text-white px-8 sm:px-12 py-6 sm:py-8 rounded-[2rem] font-black text-base sm:text-xl hover:bg-brand-primary-dark hover:scale-105 transition-all shadow-2xl shadow-brand-primary/20 uppercase tracking-widest">
                {t.landing?.ctaButton || "Start Your Journey Today"}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
              <Button variant="outline" className="w-full border-border bg-transparent text-muted-foreground px-8 sm:px-12 py-6 sm:py-8 rounded-[2rem] font-black text-base sm:text-xl hover:bg-card hover:border-primary hover:text-primary transition-all uppercase tracking-widest">
                {t.landing?.signIn || "Sign In"}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
