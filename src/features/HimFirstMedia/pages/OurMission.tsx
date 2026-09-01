import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Target, ArrowRight, BookOpen, Heart, Globe, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHimFirstMediaPage } from "../hooks/useHimFirstMediaPage";

const OurMission = () => {
  const { t } = useHimFirstMediaPage();
  const animFadeUp: any = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } },
  };

  return (
    <div className="w-full bg-background text-foreground overflow-x-hidden">
      <section className="pt-16 sm:pt-20 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-12 bg-brand-dark">
        <div className="w-full max-w-4xl mx-auto text-center">
          <motion.div variants={animFadeUp} initial="hidden" animate="visible">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white font-[family-name:var(--font-heading)] tracking-tighter leading-none mb-6">
              {t.himFirstMedia?.ourMissionTitle || "Our"} <span className="text-brand-accent">{t.himFirstMedia?.ourMissionTitleHighlight || "Mission"}</span>
            </h1>
            <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed font-medium">
              {t.himFirstMedia?.ourMissionTagline || "To help you reach more people, impact more lives, and glorify God through the power of His Word."}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-12 bg-card">
        <div className="w-full max-w-4xl mx-auto">
          <motion.div variants={animFadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <h2 className="text-2xl sm:text-3xl font-black text-brand-primary mb-6 font-[family-name:var(--font-heading)] tracking-tight">
              {t.himFirstMedia?.ourMissionSectionTitle || "What Drives Us"}
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed font-medium mb-6">
              {t.himFirstMedia?.ourMissionPara1 || "Our mission is simple: to make the deep truths of Scripture accessible to everyone, everywhere."}
            </p>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed font-medium mb-12">
              {t.himFirstMedia?.ourMissionPara2 || "As a project of Him First Media Group, we bring decades of experience in Christian digital marketing, app development, and web design to the service of the Church."}
            </p>
          </motion.div>

          <motion.div variants={animFadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid sm:grid-cols-2 gap-6 mt-12">
            {[
              { icon: BookOpen, title: t.himFirstMedia?.ourMissionCard1Title || "Teach the Word", desc: t.himFirstMedia?.ourMissionCard1Desc || "Provide rich, verse-by-verse teaching that makes Scripture come alive." },
              { icon: Heart, title: t.himFirstMedia?.ourMissionCard2Title || "Build Community", desc: t.himFirstMedia?.ourMissionCard2Desc || "Create a space where believers can pray, testify, and grow together." },
              { icon: Globe, title: t.himFirstMedia?.ourMissionCard3Title || "Reach the World", desc: t.himFirstMedia?.ourMissionCard3Desc || "Make the Bible accessible in multiple languages and translations." },
              { icon: Zap, title: t.himFirstMedia?.ourMissionCard4Title || "Equip the Saints", desc: t.himFirstMedia?.ourMissionCard4Desc || "Give believers the tools they need to study, journal, and apply God's Word." },
            ].map((v) => (
              <div key={v.title} className="bg-card rounded-[1.75rem] p-6 sm:p-8 border border-border">
                <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-5 shadow-sm">
                  <v.icon className="w-6 h-6 text-brand-primary" />
                </div>
                <h3 className="text-lg font-black text-brand-primary mb-2 font-[family-name:var(--font-heading)]">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium">{v.desc}</p>
              </div>
            ))}
          </motion.div>

          <motion.div variants={animFadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mt-12 text-center">
            <Link to="/register">
              <Button className="bg-brand-primary text-white hover:bg-brand-primary-dark px-8 py-6 rounded-[2rem] font-black text-base shadow-2xl shadow-brand-primary/20 uppercase tracking-widest">
                {t.himFirstMedia?.ourMissionCta || "Join Our Mission"} <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default OurMission;
