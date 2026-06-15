import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Gem, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const Founders = () => {
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
              <Gem className="w-3.5 h-3.5 text-brand-accent" />
              <span className="text-[10px] sm:text-xs font-black text-white/70 uppercase tracking-widest">Founders</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white font-[family-name:var(--font-heading)] tracking-tighter leading-none mb-6">
              Our <span className="text-brand-accent">Founders</span>
            </h1>
            <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed font-medium">
              Built on a foundation of faith, vision, and a relentless commitment to Kingdom impact.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-12 bg-white">
        <div className="w-full max-w-4xl mx-auto">
          <motion.div variants={animFadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <h2 className="text-2xl sm:text-3xl font-black text-brand-primary mb-6 font-[family-name:var(--font-heading)] tracking-tight">
              Tom Donovan — Founder, Him First Media Group
            </h2>
            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed font-medium mb-6">
              The Exegesis Project was born out of the vision and resources of Him First Media Group, founded by Tom Donovan. A Christian businessman with a passion for using technology to advance the Gospel, Tom has spent decades building digital solutions that serve the Body of Christ.
            </p>
            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed font-medium mb-6">
              Him First Media Group is a full-service Christian digital marketing agency that specializes in Christian SEO, social media marketing, website design, and app development for Christian businesses, churches, and ministries. The company was founded on the principle that every digital effort should put Jesus first.
            </p>
            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed font-medium mb-6">
              The Exegesis Project is the fulfillment of a long-held dream to create a Bible study platform that combines deep theological insight with cutting-edge technology — making the Word of God accessible, engaging, and transformative for believers around the world.
            </p>
          </motion.div>

          <motion.div variants={animFadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mt-12 bg-brand-dark rounded-[2rem] p-8 sm:p-12 text-center">
            <p className="text-xl sm:text-2xl font-black text-brand-accent italic font-[family-name:var(--font-heading)] tracking-tight mb-4">
              "Quality, Service, & Integrity — Built for His Glory."
            </p>
            <p className="text-sm font-black text-white/40 uppercase tracking-widest">— The Him First Media Group Motto</p>
          </motion.div>

          <motion.div variants={animFadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mt-12 text-center">
            <Link to="/register">
              <Button className="bg-brand-primary text-white hover:bg-brand-primary-dark px-8 py-6 rounded-[2rem] font-black text-base shadow-2xl shadow-brand-primary/20 uppercase tracking-widest">
                Be Part of the Story <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Founders;
