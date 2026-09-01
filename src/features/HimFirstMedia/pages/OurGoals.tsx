import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Users, Globe, Trophy, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHimFirstMediaPage } from "../hooks/useHimFirstMediaPage";
import {
  HimFirstMediaPageLayout,
  HimFirstHero,
  HimFirstContentSection,
  HimFirstAnimated,
  HimFirstCard,
  HimFirstIconBox,
} from "../components";

const OurGoals = () => {
  const { t } = useHimFirstMediaPage();
  const animFadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const } },
  } as const;

  return (
    <HimFirstMediaPageLayout>
      <HimFirstHero
        title={
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white font-[family-name:var(--font-heading)] tracking-tighter leading-none mb-6">
            {t.himFirstMedia?.ourGoalsTitle || "Our"} <span className="text-brand-accent">{t.himFirstMedia?.ourGoalsTitleHighlight || "Goals"}</span>
          </h1>
        }
        subtitle={t.himFirstMedia?.ourGoalsTagline || "Clear targets we're pursuing to fulfill our calling and maximize Kingdom impact."}
      />

      <HimFirstContentSection>
        <motion.div variants={animFadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="space-y-8">
          {[
            { icon: BookOpen, title: t.himFirstMedia?.ourGoalsCard1Title || "Deepen Scriptural Engagement", desc: t.himFirstMedia?.ourGoalsCard1Desc || "Help users read, understand, and apply the Bible daily." },
            { icon: Users, title: t.himFirstMedia?.ourGoalsCard2Title || "Build a Global Prayer Community", desc: t.himFirstMedia?.ourGoalsCard2Desc || "Connect believers from every nation to pray for one another." },
            { icon: Globe, title: t.himFirstMedia?.ourGoalsCard3Title || "Expand Language Reach", desc: t.himFirstMedia?.ourGoalsCard3Desc || "Make the platform accessible in 23+ languages." },
            { icon: Trophy, title: t.himFirstMedia?.ourGoalsCard4Title || "Equip the Next Generation", desc: t.himFirstMedia?.ourGoalsCard4Desc || "Provide tools like journaling, reading challenges, and trivia." },
          ].map((g) => (
            <HimFirstCard key={g.title} className="flex gap-6">
              <HimFirstIconBox className="w-14 h-14 mb-0">
                <g.icon className="w-7 h-7 text-brand-primary" />
              </HimFirstIconBox>
              <div>
                <h3 className="text-xl font-black text-brand-primary mb-2 font-[family-name:var(--font-heading)]">{g.title}</h3>
                <p className="text-base text-muted-foreground leading-relaxed font-medium">{g.desc}</p>
              </div>
            </HimFirstCard>
          ))}
        </motion.div>

        <HimFirstAnimated className="mt-12 text-center">
          <Link to="/register">
            <Button className="bg-brand-primary text-white hover:bg-brand-primary-dark px-8 py-6 rounded-[2rem] font-black text-base shadow-2xl shadow-brand-primary/20 uppercase tracking-widest">
              {t.himFirstMedia?.ourGoalsCta || "Join Us in Reaching These Goals"} <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </HimFirstAnimated>
      </HimFirstContentSection>
    </HimFirstMediaPageLayout>
  );
};

export default OurGoals;
