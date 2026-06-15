import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Flag, ArrowRight, BookOpen, Users, Globe, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/languages/languageProvider";

const OurGoals = () => {
  const { t } = useLanguage();
  const animFadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } },
  };

  return (
    <div className="w-full bg-brand-bg text-slate-900 overflow-x-hidden">
      <section className="pt-16 sm:pt-20 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-12 bg-brand-dark">
        <div className="w-full max-w-4xl mx-auto text-center">
          <motion.div variants={animFadeUp} initial="hidden" animate="visible">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 mb-6">
              <Flag className="w-3.5 h-3.5 text-brand-accent" />
              <span className="text-[10px] sm:text-xs font-black text-white/70 uppercase tracking-widest">{t.himFirstMedia?.ourGoalsBadge || "Our Goals"}</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white font-[family-name:var(--font-heading)] tracking-tighter leading-none mb-6">
              {t.himFirstMedia?.ourGoalsTitle || "Our"} <span className="text-brand-accent">{t.himFirstMedia?.ourGoalsTitleHighlight || "Goals"}</span>
            </h1>
            <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed font-medium">
              {t.himFirstMedia?.ourGoalsTagline || "Clear targets we're pursuing to fulfill our calling and maximize Kingdom impact."}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-12 bg-white">
        <div className="w-full max-w-4xl mx-auto">
          <motion.div variants={animFadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="space-y-8">
            {[
              { icon: BookOpen, title: t.himFirstMedia?.ourGoalsCard1Title || "Deepen Scriptural Engagement", desc: t.himFirstMedia?.ourGoalsCard1Desc || "Help users read, understand, and apply the Bible daily through multi-translation access, verse-by-verse teaching, and interactive reading plans." },
              { icon: Users, title: t.himFirstMedia?.ourGoalsCard2Title || "Build a Global Prayer Community", desc: t.himFirstMedia?.ourGoalsCard2Desc || "Connect believers from every nation to pray for one another, share testimonies, and encourage each other in faith." },
              { icon: Globe, title: t.himFirstMedia?.ourGoalsCard3Title || "Expand Language Reach", desc: t.himFirstMedia?.ourGoalsCard3Desc || "Make the platform accessible in 23+ languages so that the Word of God can reach every tongue and tribe." },
              { icon: Trophy, title: t.himFirstMedia?.ourGoalsCard4Title || "Equip the Next Generation", desc: t.himFirstMedia?.ourGoalsCard4Desc || "Provide tools like journaling, reading challenges, and trivia that help young believers grow in their knowledge of Scripture." },
            ].map((g) => (
              <div key={g.title} className="flex gap-6 p-6 sm:p-8 bg-brand-bg rounded-[1.75rem] border border-slate-100">
                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-sm">
                  <g.icon className="w-7 h-7 text-brand-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-brand-primary mb-2 font-[family-name:var(--font-heading)]">{g.title}</h3>
                  <p className="text-base text-slate-500 leading-relaxed font-medium">{g.desc}</p>
                </div>
              </div>
            ))}
          </motion.div>

          <motion.div variants={animFadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mt-12 text-center">
            <Link to="/register">
              <Button className="bg-brand-primary text-white hover:bg-brand-primary-dark px-8 py-6 rounded-[2rem] font-black text-base shadow-2xl shadow-brand-primary/20 uppercase tracking-widest">
                {t.himFirstMedia?.ourGoalsCta || "Join Us in Reaching These Goals"} <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default OurGoals;
