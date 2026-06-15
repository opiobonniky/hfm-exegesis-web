import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const OurVision = () => {
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
              <Eye className="w-3.5 h-3.5 text-brand-accent" />
              <span className="text-[10px] sm:text-xs font-black text-white/70 uppercase tracking-widest">Our Vision</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white font-[family-name:var(--font-heading)] tracking-tighter leading-none mb-6">
              Our <span className="text-brand-accent">Vision</span>
            </h1>
            <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed font-medium">
              To see every believer equipped with the Word of God through technology that inspires, teaches, and transforms.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-12 bg-white">
        <div className="w-full max-w-4xl mx-auto">
          <motion.div variants={animFadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <h2 className="text-2xl sm:text-3xl font-black text-brand-primary mb-6 font-[family-name:var(--font-heading)] tracking-tight">
              A Kingdom-Focused Future
            </h2>
            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed font-medium mb-6">
              Our vision is to build the most comprehensive, accessible, and Spirit-led Bible study platform in the world. We envision a global community where believers from every nation can dive deep into Scripture, grow in their faith, and connect with others on the same journey.
            </p>
            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed font-medium mb-6">
              As a project of Him First Media Group, we are committed to using cutting-edge digital tools to spread the Gospel and make disciples of all nations. We believe that technology, when submitted to the Lordship of Jesus Christ, can be a powerful vehicle for Kingdom impact.
            </p>
            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed font-medium mb-6">
              We see a world where every Christian has a personalized Bible study experience — with daily verses, reading plans, journaling tools, and rich verse-by-verse teaching — all designed to draw them closer to the heart of God.
            </p>
          </motion.div>

          <motion.div variants={animFadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mt-12 bg-brand-bg rounded-[2rem] p-8 sm:p-12 border border-slate-100 text-center">
            <p className="text-xl sm:text-2xl font-black text-brand-accent italic font-[family-name:var(--font-heading)] tracking-tight mb-4">
              "Write the vision, and make it plain upon tables, that he may run that readeth it."
            </p>
            <p className="text-sm font-black text-slate-400 uppercase tracking-widest">— Habakkuk 2:2</p>
          </motion.div>

          <motion.div variants={animFadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mt-12 text-center">
            <Link to="/register">
              <Button className="bg-brand-primary text-white hover:bg-brand-primary-dark px-8 py-6 rounded-[2rem] font-black text-base shadow-2xl shadow-brand-primary/20 uppercase tracking-widest">
                Join the Vision <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default OurVision;
