import { motion } from "framer-motion";
import { Globe, BookOpen, Mic2, Heart, Sparkles, Trophy } from "lucide-react";
import { useLanguage } from "@/components/languages/languageProvider";
import { animSlideLeft, animStagger, animCardUp } from "./animations";

const FEATURES = [
  { key: "featureBibleAppTitle", descKey: "featureBibleAppDesc", icon: Globe },
  { key: "featureBibleStudiesTitle", descKey: "featureBibleStudiesDesc", icon: BookOpen },
  { key: "featureVVTeachingTitle", descKey: "featureVVTeachingDesc", icon: Mic2 },
  { key: "featureVDevotionalsTitle", descKey: "featureVDevotionalsDesc", icon: Heart },
  { key: "featureJournalingTitle", descKey: "featureJournalingDesc", icon: Sparkles },
  { key: "featureChallengesTitle", descKey: "featureChallengesDesc", icon: Trophy },
];
const DEFAULTS: Record<string, string> = {
  featureBibleAppTitle: "Bible App", featureBibleAppDesc: "Access the full Scriptures anytime, anywhere.",
  featureBibleStudiesTitle: "Bible Studies", featureBibleStudiesDesc: "Structured study guides that walk you through books of the Bible.",
  featureVVTeachingTitle: "Verse by Verse Teaching", featureVVTeachingDesc: "Detailed verse-by-verse explanations to uncover the depth of Scripture.",
  featureVDevotionalsTitle: "Verse Devotionals", featureVDevotionalsDesc: "Daily devotionals centered on specific verses.",
  featureJournalingTitle: "Journaling", featureJournalingDesc: "Capture your thoughts, prayers, and reflections as you journey through Scripture.",
  featureChallengesTitle: "Challenges", featureChallengesDesc: "Engage in Bible reading challenges and trivia.",
};
export function FeaturesSection() {
  const { t } = useLanguage();
  return (
    <section id="features" className="py-14 sm:py-20 md:py-28 px-4 sm:px-6 lg:px-12 bg-card">
      <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-0">
        <div className="text-center mb-10 sm:mb-16 md:mb-10">
          <motion.div variants={animSlideLeft} initial="hidden" whileInView="visible" viewport={{ once: false, margin: "-80px" }}>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-foreground mb-5 sm:mb-8 font-[family-name:var(--font-heading)] tracking-tighter leading-none">
              {t.landing?.featuresTitle || "Our"}{" "}
              <span className="text-brand-primary">{t.landing?.featuresTitleHighlight || "Spirit-Led"}</span>
              <span className="block sm:inline"> {t.landing?.features || "Features"}</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">
              {t.landing?.featuresDesc || "We are passionate Jesus followers dedicated to helping you shine with excellence and integrity."}
            </p>
          </motion.div>
        </div>
        <motion.div variants={animStagger} initial="hidden" whileInView="visible" viewport={{ once: false, margin: "-60px" }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {FEATURES.map((f) => {
            const title = (t.landing as any)?.[f.key] || DEFAULTS[f.key];
            const desc = (t.landing as any)?.[f.descKey] || DEFAULTS[f.descKey];
            return (
              <motion.div key={f.key} variants={animCardUp} className="group">
                <div className="p-6 sm:p-8 rounded-[1.75rem] sm:rounded-[2.5rem] bg-brand-bg border border-border hover:border-primary/30 hover:shadow-[0_24px_48px_-12px_rgba(57,98,132,0.1)] transition-all duration-500 h-full flex flex-col">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-muted flex items-center justify-center mb-5 sm:mb-7 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-sm">
                    <f.icon className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-brand-primary mb-3 font-[family-name:var(--font-heading)] tracking-tight">{title}</h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed font-medium">{desc}</p>
                  <div className="mt-auto pt-6"><div className="w-8 h-1 bg-border group-hover:w-16 group-hover:bg-accent transition-all duration-500" /></div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
