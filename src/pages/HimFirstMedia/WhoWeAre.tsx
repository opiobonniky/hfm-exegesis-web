import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, ShieldCheck, Heart, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const WhoWeAre = () => {
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
              <Users className="w-3.5 h-3.5 text-brand-accent" />
              <span className="text-[10px] sm:text-xs font-black text-white/70 uppercase tracking-widest">About Us</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white font-[family-name:var(--font-heading)] tracking-tighter leading-none mb-6">
              Who <span className="text-brand-accent">We Are</span>
            </h1>
            <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed font-medium">
              We're passionate Jesus followers, tech experts, and creative visionaries who live to serve the Lord in everything we do.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-12 bg-white">
        <div className="w-full max-w-4xl mx-auto">
          <motion.div variants={animFadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed font-medium mb-8">
              At Exegesis, we believe your spiritual journey deserves more than just a casual reading — it deserves a powerful, purpose-driven digital footprint rooted in faith and fueled by the Gospel.
            </p>
            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed font-medium mb-8">
              We are a project of{" "}
              <a href="https://himfirstmedia.com" target="_blank" rel="noopener noreferrer" className="text-brand-primary font-bold hover:underline">
                Him First Media Group
              </a>
              , a full-service Christian digital marketing agency dedicated to helping Christian businesses, churches, and ministries shine online with excellence and integrity.
            </p>
            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed font-medium mb-12">
              Our goal is simple: to help you reach more people, impact more lives, and glorify God through the power of His Word.
            </p>
          </motion.div>

          <motion.div variants={animFadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid sm:grid-cols-3 gap-6 mt-12">
            {[
              { icon: ShieldCheck, title: "Rooted in Truth", desc: "Every insight is grounded in sound biblical scholarship and prayer." },
              { icon: Heart, title: "Faith-Filled", desc: "Everything we do is centered around faith, excellence, and Kingdom impact." },
              { icon: Sparkles, title: "Spirit-Led Tech", desc: "We use modern technology to illuminate ancient wisdom for today's generation." },
            ].map((v) => (
              <div key={v.title} className="bg-brand-bg rounded-[1.75rem] p-6 sm:p-8 border border-slate-100">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center mb-5 shadow-sm">
                  <v.icon className="w-6 h-6 text-brand-primary" />
                </div>
                <h3 className="text-lg font-black text-brand-primary mb-2 font-[family-name:var(--font-heading)]">{v.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">{v.desc}</p>
              </div>
            ))}
          </motion.div>

          <motion.div variants={animFadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mt-12 text-center">
            <p className="text-xl sm:text-2xl font-black text-brand-accent italic font-[family-name:var(--font-heading)] tracking-tight mb-8">
              "Quality, Service, & Integrity — Built for His Glory."
            </p>
            <Link to="/register">
              <Button className="bg-brand-primary text-white hover:bg-brand-primary-dark px-8 py-6 rounded-[2rem] font-black text-base shadow-2xl shadow-brand-primary/20 uppercase tracking-widest">
                Join Our Community <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default WhoWeAre;
