import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Users2, ArrowRight, ShieldCheck, Lightbulb, Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const Leadership = () => {
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
              <Users2 className="w-3.5 h-3.5 text-brand-accent" />
              <span className="text-[10px] sm:text-xs font-black text-white/70 uppercase tracking-widest">Leadership</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white font-[family-name:var(--font-heading)] tracking-tighter leading-none mb-6">
              Our <span className="text-brand-accent">Leadership</span>
            </h1>
            <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed font-medium">
              A team of dedicated professionals committed to serving the Lord with excellence.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-12 bg-white">
        <div className="w-full max-w-4xl mx-auto">
          <motion.div variants={animFadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <h2 className="text-2xl sm:text-3xl font-black text-brand-primary mb-6 font-[family-name:var(--font-heading)] tracking-tight">
              Tom Donovan — Founder & Visionary
            </h2>
            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed font-medium mb-6">
              Tom Donovan is the innovative Founder of Him First Media Group and a bold Christian businessman with a heart on fire for Jesus. With decades of entrepreneurial experience, Tom has launched and developed numerous faith-based companies and Christian digital products designed to serve the Body of Christ.
            </p>
            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed font-medium mb-6">
              His mission is clear: to help ministries, churches, and Christian businesses grow, thrive, and impact the world for God's glory. Tom leads with integrity, creativity, and a deep love for the Lord, keeping his faith at the very top of everything he does.
            </p>
            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed font-medium mb-12">
              Through his visionary leadership, countless organizations have built strong digital foundations rooted in faith, purpose, and excellence. Tom is not just building businesses — he's building the Kingdom.
            </p>
          </motion.div>

          <motion.div variants={animFadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid sm:grid-cols-2 gap-6 mt-12">
            {[
              { icon: ShieldCheck, name: "Eric Johnson", role: "Account Manager" },
              { icon: Lightbulb, name: "Adrian Ostendauf", role: "Social Media Strategist" },
              { icon: Heart, name: "Allyson Tibaldi", role: "Project Management" },
              { icon: Star, name: "Andrew Kamuli", role: "App Development" },
            ].map((p) => (
              <div key={p.name} className="bg-brand-bg rounded-[1.75rem] p-6 sm:p-8 border border-slate-100 flex items-center gap-5">
                <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
                  <p.icon className="w-7 h-7 text-brand-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">{p.name}</h3>
                  <p className="text-sm font-bold text-brand-accent uppercase tracking-widest">{p.role}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Leadership;
