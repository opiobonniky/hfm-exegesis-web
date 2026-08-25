import { motion } from "framer-motion";
import { Users, ShieldCheck, Globe, Sparkles, Zap } from "lucide-react";
import { useLanguage } from "@/components/languages/languageProvider";
import { animSlideLeft, animStagger, animCardUp } from "./animations";

const VALUES = [
  { titleKey: "aboutValueRootedTitle", descKey: "aboutValueRootedDesc", icon: ShieldCheck, dt: "Rooted in Truth", dd: "Every insight is grounded in sound biblical scholarship." },
  { titleKey: "aboutValueGlobalTitle", descKey: "aboutValueGlobalDesc", icon: Globe, dt: "Global Community", dd: "Pray, testify, and grow alongside believers worldwide." },
  { titleKey: "aboutValueSpiritTitle", descKey: "aboutValueSpiritDesc", icon: Sparkles, dt: "Spirit-Led Tech", dd: "Modern technology to illuminate ancient wisdom." },
  { titleKey: "aboutValueGrowingTitle", descKey: "aboutValueGrowingDesc", icon: Zap, dt: "Always Growing", dd: "Constant updates and fresh content." },
];

const STATS = [
  { key: "aboutStatVerses", defaultStat: "31K+", labelKey: "aboutStatVersesLabel", defaultLabel: "Verses Explored" },
  { key: "aboutStatDaily", defaultStat: "150+", labelKey: "aboutStatDailyLabel", defaultLabel: "Daily Insights" },
  { key: "aboutStatGlobal", defaultStat: "Global", labelKey: "aboutStatGlobalLabel", defaultLabel: "Kingdom Reach" },
];

export function AboutSection() {
  const { t } = useLanguage();
  const L = t.landing as any;
  return (
    <section id="about" className="px-4 sm:px-6 lg:px-12 py-14 sm:py-20 md:py-28 bg-brand-card">
      <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-0">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div variants={animSlideLeft} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border mb-5">
              <Users className="w-3.5 h-3.5 text-brand-primary" />
              <span className="text-[10px] sm:text-xs text-muted-foreground font-black uppercase tracking-widest">
                {L?.aboutBadge || "Our Calling"}
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground font-[family-name:var(--font-heading)] mb-6 leading-tight tracking-tighter">
              {L?.aboutTitle || "Built for Kingdom"}{" "}
              <span className="text-brand-primary">{L?.aboutTitleHighlight || "Impact"}</span>
            </h2>
            <div className="space-y-4 text-muted-foreground text-base sm:text-lg leading-relaxed font-medium">
              <p>{L?.aboutPara1 || "At Exegesis, we believe your spiritual journey deserves more than just a casual reading."}</p>
              <p>{L?.aboutPara2 || "We're not just another app—we're passionate Jesus followers."}</p>
              <p className="font-black text-brand-accent italic text-xl sm:text-2xl tracking-tight">
                {L?.aboutMotto || "Quality, Service, & Integrity — Built for His Glory."}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4 sm:gap-8 mt-10">
              {STATS.map((s) => (
                <div key={s.key}>
                  <p className="text-2xl sm:text-3xl font-black text-brand-primary tracking-tighter">{L?.[s.key] || s.defaultStat}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 font-bold uppercase tracking-widest">{L?.[s.labelKey] || s.defaultLabel}</p>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div variants={animStagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {VALUES.map((v) => {
              const title = L?.[v.titleKey] || v.dt;
              const desc = L?.[v.descKey] || v.dd;
              return (
                <motion.div key={v.titleKey} variants={animCardUp} className="bg-card border border-border rounded-[2rem] p-6 sm:p-7 hover:shadow-xl transition-all duration-500 group">
                  <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-brand-bg flex items-center justify-center mb-4 group-hover:bg-brand-primary/10 transition-colors">
                    <v.icon className="w-5 h-5 sm:w-6 sm:h-6 text-brand-primary" />
                  </div>
                  <h4 className="font-black text-base sm:text-lg text-brand-primary mb-2 font-[family-name:var(--font-heading)] tracking-tight">{title}</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed font-medium">{desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
