import { motion } from "framer-motion";
import { BookOpen, CalendarDays, Quote } from "lucide-react";
import { useLanguage } from "@/components/languages/languageProvider";
import { animFadeUp, animStagger, animScaleIn } from "./animations";

const STATS = [
  { key: "bibleStatsBooks", stat: "66", label: "Books", icon: BookOpen },
  { key: "bibleStatsChapters", stat: "1,189", label: "Chapters", icon: CalendarDays },
  { key: "bibleStatsVerses", stat: "31,102", label: "Verses", icon: Quote },
];

export function BibleStatsSection() {
  const { t } = useLanguage();
  return (
    <section className="py-14 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-12 bg-brand-card border-y border-border">
      <div className="w-full max-w-4xl mx-auto">
        <motion.div variants={animFadeUp} initial="hidden" whileInView="visible" viewport={{ once: false, margin: "-80px" }}>
          <div className="text-center mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border mb-5 shadow-sm">
              <BookOpen className="w-3.5 h-3.5 text-brand-primary" />
              <span className="text-[10px] sm:text-xs font-black text-muted-foreground uppercase tracking-widest">
                {t.landing?.bibleStatsBadge || "The Holy Scriptures"}
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground font-[family-name:var(--font-heading)] tracking-tighter leading-none">
              {t.landing?.bibleStatsTitle || "The"}{" "}
              <span className="text-brand-primary">{t.landing?.bibleStatsTitleHighlight || "Word"}</span>
              {t.landing?.bibleStatsOfGod || " of God"}
            </h2>
          </div>
          <motion.div variants={animStagger} initial="hidden" whileInView="visible" viewport={{ once: false, margin: "-60px" }} className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {STATS.map((item) => (
              <motion.div key={item.key} variants={animScaleIn} className="bg-card rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 md:p-10 border border-border hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 text-center group">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-brand-bg flex items-center justify-center mx-auto mb-4 sm:mb-5 group-hover:bg-brand-primary group-hover:text-white transition-all duration-500">
                  <item.icon className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>
                <div className="text-3xl sm:text-4xl md:text-5xl font-black text-brand-primary tracking-tighter mb-1">{item.stat}</div>
                <div className="text-xs sm:text-sm font-black text-muted-foreground uppercase tracking-widest">
                  {(t.landing as any)?.[item.key] || item.label}
                </div>
                <div className="w-8 h-1 bg-border group-hover:w-12 group-hover:bg-accent transition-all duration-500 mx-auto mt-4 rounded-full" />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
