import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { useLanguage } from "@/components/languages/languageProvider";
import { tt } from "@/components/languages/hardcodedTranslate";
import { animFadeUp, animSlideLeft, animSlideRight } from "./animations";
import { SocialIcon } from "./icons";
import { SOCIAL_LABEL_KEYS, SOCIAL_LABELS, SOCIAL_LINKS } from "../../constants/landing";
import { landingCopy } from "../../utils";
import logoImage from "@/assets/logos/exegesis_bg_rm.webp";
import type { FooterSectionProps } from "../../types";

export function FooterSection({ id }: FooterSectionProps) {
  const { t } = useLanguage();

  return (
    <footer id={id} className="bg-brand-dark pt-14 sm:pt-20 pb-0">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-10 lg:gap-12">
          <motion.div
            variants={animSlideLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="w-full lg:w-1/3"
          >
            <p className="text-brand-accent/80 font-serif italic text-base sm:text-lg leading-relaxed max-w-sm">
              &ldquo;{t.landing?.footerVerse || tt("Write the vision, and make it plain upon tables, that he may run that readeth it.")}&rdquo;
            </p>
            <p className="text-muted-foreground text-[10px] sm:text-xs font-black uppercase tracking-widest mt-4">
              — {t.landing?.footerVerseRef || tt("Habakkuk 2:2")}
            </p>
          </motion.div>

          <motion.div
            variants={animFadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="w-full lg:w-1/3 text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/5 p-2 flex items-center justify-center border border-white/10">
                <img src={logoImage} alt={tt("Exegesis")} className="w-full h-full object-contain brightness-0 invert" />
              </div>
              <span className="text-xl sm:text-2xl font-black text-white font-[family-name:var(--font-heading)] tracking-tighter">
                {t.landing?.siteTitle || tt("EXEGESIS PROJECT")}
              </span>
            </div>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-xs mx-auto">
              {t.landing?.footerDesc || tt("Helping you shine with excellence and integrity through the power of the Word.")}
            </p>
          </motion.div>

          <motion.div
            variants={animSlideRight}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="w-full lg:w-1/3 lg:text-right"
          >
            <h4 className="text-brand-accent font-serif text-lg sm:text-xl mb-6">
              {t.landing?.footerConnect || tt("Connect With Us")}
            </h4>
            <div className="flex items-center lg:justify-end gap-4">
              <TooltipProvider>
                {SOCIAL_LINKS.map((social) => (
                  <Tooltip key={social.id}>
                    <TooltipTrigger asChild>
                      <a
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/5 flex items-center justify-center text-brand-accent hover:bg-brand-accent hover:text-white transition-all duration-300 border border-brand-accent/30"
                        aria-label={landingCopy(t, SOCIAL_LABEL_KEYS[social.id], SOCIAL_LABELS[social.id])}
                      >
                        <SocialIcon id={social.id} className="w-4 h-4 sm:w-5 sm:h-5 object-contain" />
                      </a>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      {landingCopy(t, SOCIAL_LABEL_KEYS[social.id], SOCIAL_LABELS[social.id])}
                    </TooltipContent>
                  </Tooltip>
                ))}
              </TooltipProvider>
            </div>
          </motion.div>
        </div>
        <div className="w-full h-px bg-white/10 my-12 sm:my-14" />
      </div>
      <div className="bg-black/40 border-t border-white/5 py-5 sm:py-6 px-4">
        <div className="w-full max-w-5xl mx-auto flex flex-row justify-between items-center gap-3 text-center sm:text-left px-4 sm:px-6">
          <p className="text-muted-foreground text-[10px] sm:text-xs font-black uppercase tracking-widest">
            {(t.landing?.footerCopyright || "© {year} Exegesis. Built for Kingdom Impact.").replace("{year}", String(new Date().getFullYear()))}
          </p>
          <p className="text-muted-foreground text-[10px] sm:text-xs font-medium">
            {t.landing?.footerPoweredBy || tt("Powered by Him First Media Group.")}
          </p>
        </div>
      </div>
    </footer>
  );
}