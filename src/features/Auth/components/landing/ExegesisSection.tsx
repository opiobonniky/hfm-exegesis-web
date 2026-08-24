import { motion } from "framer-motion";
import { Mic2, Heart, BookOpen, Sparkles } from "lucide-react";
import { useLanguage } from "@/components/languages/languageProvider";
import { animFadeUp, animStagger, animCardUp } from "./animations";

const ITEMS = [
  { titleKey: "exegesisVVTeachingTitle", descKey: "exegesisVVTeachingDesc", icon: Mic2, defaultTitle: "Verse by Verse Teaching", defaultDesc: "Explanation and application with a learn more tab." },
  { titleKey: "exegesisVDevotionalsTitle", descKey: "exegesisVDevotionalsDesc", icon: Heart, defaultTitle: "Verse Devotionals", defaultDesc: "Daily devotionals centered on specific verses." },
  { titleKey: "exegesisBibleStudyTitle", descKey: "exegesisBibleStudyDesc", icon: BookOpen, defaultTitle: "Bible Study", defaultDesc: "Structured study guides that walk you through books of the Bible." },
  { titleKey: "exegesisJournalingTitle", descKey: "exegesisJournalingDesc", icon: Sparkles, defaultTitle: "Journaling", defaultDesc: "Capture your thoughts, prayers, and reflections." },
];

export function ExegesisSection() {
  const { t } = useLanguage();

  return (
    <section id="exegesis-daily" className="py-14 sm:py-20 md:py-28 px-4 sm:px-6 lg:px-12 bg-brand-card">
      <div className="w-full max-w-screen-xl mx-auto">
        <motion.div variants={animFadeUp} initial="hidden" whileInView="visible" viewport={{ once: false, margin: "-80px" }}>
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground font-[family-name:var(--font-heading)] tracking-tighter leading-none">
              {t.landing?.exegesisProjectTitle || "EXEGESIS"}{" "}
              <span className="text-brand-primary">{t.landing?.exegesisProjectTitleHighlight || "PROJECT"}</span>
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground mt-4 max-w-2xl mx-auto leading-relaxed font-medium">
              {t.landing?.exegesisProjectDesc || "We're going to want to make each section follow the features of the app"}
            </p>
          </div>

          <motion.div variants={animStagger} initial="hidden" whileInView="visible" viewport={{ once: false, margin: "-60px" }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {ITEMS.map((item) => {
              const title = (t.landing as any)?.[item.titleKey] || item.defaultTitle;
              const desc = (t.landing as any)?.[item.descKey] || item.defaultDesc;
              return (
                <motion.div key={item.titleKey} variants={animCardUp} className="bg-card rounded-[2rem] p-6 sm:p-8 border border-border hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 group">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-brand-bg flex items-center justify-center mb-5 group-hover:bg-brand-primary group-hover:text-white transition-all duration-500 shadow-sm">
                    <item.icon className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-brand-primary mb-3 font-[family-name:var(--font-heading)] tracking-tight">{title}</h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed font-medium">{desc}</p>
                  <div className="mt-6"><div className="w-8 h-1 bg-border group-hover:w-16 group-hover:bg-accent transition-all duration-500" /></div>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
