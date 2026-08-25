import { motion } from "framer-motion";
import { Facebook } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { useLanguage } from "@/components/languages/languageProvider";
import { animSlideLeft, animFadeUp, animSlideRight } from "./animations";
import logoImage from "@/assets/logos/exegesis_bg_rm.png";

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function LordsBookIcon({ className }: { className?: string }) {
  return <img src="/src/assets/logos/lordsbook.png" alt="LordsBook" className={className} />;
}

export function FooterSection() {
  const { t } = useLanguage();
  const socialLinks = [
    { name: t.landing?.socialLordsBook || "LordsBook", url: "https://lordsbook.com", icon: LordsBookIcon },
    { name: t.landing?.socialFacebook || "Facebook", url: "https://facebook.com", icon: Facebook },
    { name: t.landing?.socialTikTok || "TikTok", url: "https://tiktok.com/@exegesis", icon: TikTokIcon },
    { name: t.landing?.socialWhatsApp || "WhatsApp", url: "https://wa.me/1234567890", icon: WhatsAppIcon },
  ];

  return (
    <footer id="contact" className="bg-brand-dark pt-16 sm:pt-24 pb-0">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-10 lg:gap-12">
          <motion.div variants={animSlideLeft} initial="hidden" whileInView="visible" viewport={{ once: true }} className="w-full lg:w-1/3">
            <p className="text-brand-accent/80 font-serif italic text-base sm:text-lg md:text-xl leading-relaxed max-w-sm">
              &ldquo;{t.landing?.footerVerse || "Write the vision, and make it plain upon tables, that he may run that readeth it."}&rdquo;
            </p>
            <p className="text-muted-foreground text-[10px] sm:text-xs font-black uppercase tracking-widest mt-4">— {t.landing?.footerVerseRef || "Habakkuk 2:2"}</p>
          </motion.div>
          <motion.div variants={animFadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="w-full lg:w-1/3 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/5 p-2 flex items-center justify-center border border-white/10">
                <img src={logoImage} alt="Exegesis" className="w-full h-full object-contain brightness-0 invert" />
              </div>
              <span className="text-xl sm:text-2xl font-black text-white font-[family-name:var(--font-heading)] tracking-tighter">
                {t.landing?.siteTitle || "EXEGESIS PROJECT"}
              </span>
            </div>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-xs mx-auto">
              {t.landing?.footerDesc || "Helping you shine with excellence and integrity through the power of the Word."}
            </p>
          </motion.div>
          <motion.div variants={animSlideRight} initial="hidden" whileInView="visible" viewport={{ once: true }} className="w-full lg:w-1/3 lg:text-right">
            <h4 className="text-brand-accent font-serif text-lg sm:text-xl mb-6">{t.landing?.footerConnect || "Connect With Us"}</h4>
            <div className="flex items-center lg:justify-end gap-4">
              <TooltipProvider>
                {socialLinks.map((s) => (
                  <Tooltip key={s.name}>
                    <TooltipTrigger asChild>
                      <a href={s.url} target="_blank" rel="noopener noreferrer"
                        className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/5 flex items-center justify-center text-brand-accent hover:bg-brand-accent hover:text-white transition-all duration-300 border border-brand-accent/30"
                        aria-label={s.name}>
                        <s.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                      </a>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">{s.name}</TooltipContent>
                  </Tooltip>
                ))}
              </TooltipProvider>
            </div>
          </motion.div>
        </div>
        <div className="w-full h-px bg-white/10 my-12 sm:my-16" />
      </div>
      <div className="bg-black/40 border-t border-white/5 py-5 sm:py-6 px-4">
        <div className="w-full max-w-5xl mx-auto flex flex-row justify-between items-center gap-3 text-center sm:text-left px-4 sm:px-6">
          <p className="text-muted-foreground text-[10px] sm:text-xs font-black uppercase tracking-widest">
            {(t.landing?.footerCopyright || "© {year} Exegesis. Built for Kingdom Impact.").replace("{year}", String(new Date().getFullYear()))}
          </p>
          <p className="text-muted-foreground text-[10px] sm:text-xs font-medium">
            {t.landing?.footerPoweredBy || "Powered by Him First Media Group."}
          </p>
        </div>
      </div>
    </footer>
  );
}
