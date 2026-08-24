import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/languages/languageProvider";
import heroBgImage from "@/assets/logos/hero-bg.jpeg";
import logoImage from "@/assets/logos/exegesis_bg_rm.png";

export function HeroSection() {
  const { t } = useLanguage();
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <img src={heroBgImage} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/50" />
      </div>
      <div className="relative z-10 text-center px-4 sm:px-6 w-full max-w-5xl mx-auto pt-20 sm:pt-24 lg:pt-28 pb-12">
        <motion.div initial={{ opacity: 0, y: 40, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}>
          <div className="w-28 h-28 mx-auto mb-6 lg:hidden">
            <img src={logoImage} alt="Exegesis" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-lg sm:text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-white leading-[1.1] tracking-tighter whitespace-nowrap uppercase text-center w-full">
            {t.landing?.welcome || "Welcome To The"}{" "}
            <span className="text-brand-accent">{t.landing?.heroTitle || "Exegesis Project"}</span>
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-3xl text-white/80 font-bold tracking-wider mt-4 uppercase whitespace-nowrap">
            {t.landing?.heroSubtitle || "Search The Scriptures Daily"}
          </p>
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 justify-center mt-8 sm:mt-10 mx-auto">
            <Link to="/login" className="w-full sm:w-80">
              <Button variant="outline" className="w-full border-2 border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white px-6 sm:px-8 py-6 rounded-[2rem] font-black text-sm sm:text-base backdrop-blur-sm uppercase tracking-widest transition-all">
                {t.landing?.watchIntro || "Watch The Intro"}
              </Button>
            </Link>
            <Link to="/register" className="w-full sm:w-80">
              <Button className="w-full bg-brand-accent text-white hover:bg-brand-accent-dark px-6 sm:px-8 py-6 rounded-[2rem] font-black text-sm sm:text-base shadow-2xl shadow-brand-accent/30 hover:scale-105 transition-all uppercase tracking-widest">
                {t.landing?.getStarted || "Get Started"}
                <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
        </motion.div>
    </section>
  );
}
