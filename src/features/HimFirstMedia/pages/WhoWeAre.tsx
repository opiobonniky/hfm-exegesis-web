import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, ShieldCheck, Heart, Sparkles, ArrowRight } from "lucide-react";
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

const WhoWeAre = () => {
  const { t } = useHimFirstMediaPage();
  const animFadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const } },
  } as const;

  return (
    <HimFirstMediaPageLayout>
      <HimFirstHero
        badge={
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 mb-6">
            <Users className="w-3.5 h-3.5 text-brand-accent" />
            <span className="text-[10px] sm:text-xs font-black text-white/70 uppercase tracking-widest">{t.himFirstMedia?.whoWeAreBadge || "About Us"}</span>
          </div>
        }
        title={
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white font-[family-name:var(--font-heading)] tracking-tighter leading-none mb-6">
            {t.himFirstMedia?.whoWeAreTitle || "Who"} <span className="text-brand-accent">{t.himFirstMedia?.whoWeAreTitleHighlight || "We Are"}</span>
          </h1>
        }
        subtitle={t.himFirstMedia?.whoWeAreTagline || "We're passionate Jesus followers, tech experts, and creative visionaries who live to serve the Lord in everything we do."}
      />

      <HimFirstContentSection>
        <HimFirstAnimated>
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed font-medium mb-8">
            {t.himFirstMedia?.whoWeArePara1 || "At Exegesis, we believe your spiritual journey deserves more than just a casual reading."}
          </p>
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed font-medium mb-8">
            {t.himFirstMedia?.whoWeArePara2 || "We are a project of Him First Media Group, a full-service Christian digital marketing agency."}
          </p>
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed font-medium mb-12">
            {t.himFirstMedia?.whoWeArePara3 || "Our goal is simple: to help you reach more people, impact more lives, and glorify God."}
          </p>
        </HimFirstAnimated>

        <motion.div variants={animFadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid sm:grid-cols-3 gap-6 mt-12">
          {[
            { icon: ShieldCheck, title: t.himFirstMedia?.whoWeAreValue1Title || "Rooted in Truth", desc: t.himFirstMedia?.whoWeAreValue1Desc || "Every insight is grounded in sound biblical scholarship and prayer." },
            { icon: Heart, title: t.himFirstMedia?.whoWeAreValue2Title || "Faith-Filled", desc: t.himFirstMedia?.whoWeAreValue2Desc || "Everything we do is centered around faith, excellence, and Kingdom impact." },
            { icon: Sparkles, title: t.himFirstMedia?.whoWeAreValue3Title || "Spirit-Led Tech", desc: t.himFirstMedia?.whoWeAreValue3Desc || "We use modern technology to illuminate ancient wisdom for today's generation." },
          ].map((v) => (
            <HimFirstCard key={v.title}>
              <HimFirstIconBox>
                <v.icon className="w-6 h-6 text-brand-primary" />
              </HimFirstIconBox>
              <h3 className="text-lg font-black text-brand-primary mb-2 font-[family-name:var(--font-heading)]">{v.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-medium">{v.desc}</p>
            </HimFirstCard>
          ))}
        </motion.div>

        <HimFirstAnimated className="mt-12 text-center">
          <p className="text-xl sm:text-2xl font-black text-brand-accent italic font-[family-name:var(--font-heading)] tracking-tight mb-8">
            {t.himFirstMedia?.whoWeAreMotto || "\"Quality, Service, & Integrity — Built for His Glory.\""}
          </p>
          <Link to="/register">
            <Button className="bg-brand-primary text-white hover:bg-brand-primary-dark px-8 py-6 rounded-[2rem] font-black text-base shadow-2xl shadow-brand-primary/20 uppercase tracking-widest">
              {t.himFirstMedia?.whoWeAreCta || "Join Our Community"} <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </HimFirstAnimated>
      </HimFirstContentSection>
    </HimFirstMediaPageLayout>
  );
};

export default WhoWeAre;
