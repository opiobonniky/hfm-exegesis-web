import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ScrollText, ArrowRight, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/languages/languageProvider";

const founders = [
  {
    name: "Apostle Charles Ubani",
    role: "Founder & President of Him First Media Group",
    bio: "Apostle Charles Ubani is a visionary leader, seasoned apostle, and the President of Him First Media Group. With a deep passion for the Gospel and decades of ministry experience, he founded the Exegesis Project to equip believers worldwide with the Word of God through technology. His leadership is marked by a commitment to biblical truth, prayer, and excellence.",
    image: "/images/charles-ubani.jpg",
  },
    name: "Apostle Judith Ubani",
    role: "Co-Founder & Vice President of Him First Media Group",
    bio: "Apostle Judith Ubani is a woman of God, prophetic voice, and Co-Founder of Him First Media Group. Her heart for discipleship and deep love for Scripture have shaped the spiritual foundation of the Exegesis Project. Together with Apostle Charles, she oversees the vision and ensures that every aspect of the platform reflects the heart of God.",
    image: "/images/judith-ubani.jpg",
];
const Founders = () => {
  const { t } = useLanguage();
  const animFadeUp:any = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } },
  };
  return (
    <div className="w-full bg-background text-foreground overflow-x-hidden">
      <section className="pt-16 sm:pt-20 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-12 bg-brand-dark">
        <div className="w-full max-w-4xl mx-auto text-center">
          <motion.div variants={animFadeUp} initial="hidden" animate="visible">
            {/* <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 mb-6">
              <ScrollText className="w-3.5 h-3.5 text-brand-accent" />
              <span className="text-[10px] sm:text-xs font-black text-white/70 uppercase tracking-widest">{t.himFirstMedia?.foundersBadge || "Founders"}</span>
            </div> */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white font-[family-name:var(--font-heading)] tracking-tighter leading-none mb-6">
              {t.himFirstMedia?.foundersTitle || "Our"} <span className="text-brand-accent">{t.himFirstMedia?.foundersTitleHighlight || "Founders"}</span>
            </h1>
            <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed font-medium">
              {t.himFirstMedia?.foundersTagline || "The men and women God used to birth this vision and bring it to life."}
            </p>
          </motion.div>
        </div>
      </section>
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-12 bg-card">
        <div className="w-full max-w-4xl mx-auto">
          <motion.div variants={animFadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="space-y-16">
            {founders.map((f, i) => (
              <div key={f.name} className={`flex flex-col ${i % 2 === 1 ? "sm:flex-row-reverse" : "sm:flex-row"} gap-8 sm:gap-12 items-center`}>
                <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-gradient-to-br from-brand-primary to-brand-accent shrink-0 overflow-hidden shadow-xl flex items-center justify-center">
                  <span className="text-6xl font-black text-white">{f.name.charAt(0)}</span>
                </div>
                <div>
                  <h3 className="text-2xl sm:text-3xl font-black text-brand-primary mb-1 font-[family-name:var(--font-heading)]">{f.name}</h3>
                  <p className="text-sm font-black text-brand-accent uppercase tracking-widest mb-4">{f.role}</p>
                  <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-medium">{f.bio}</p>
              </div>
            ))}
          <motion.div variants={animFadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mt-16 bg-card rounded-[2rem] p-8 sm:p-12 border border-border text-center">
            <Quote className="w-8 h-8 text-brand-accent mx-auto mb-4 opacity-50" />
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed font-medium italic mb-4">
              {t.himFirstMedia?.foundersQuote || "\"The Exegesis Project was born out of a simple but powerful conviction that every believer deserves access to deep, reliable, and Spirit-led Bible study tools.\""}
            <p className="text-sm font-black text-brand-accent uppercase tracking-widest">{t.himFirstMedia?.foundersQuoteAttribution || "— Apostle Charles Ubani"}</p>
          <motion.div variants={animFadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mt-12 text-center">
            <Link to="/register">
              <Button className="bg-brand-primary text-white hover:bg-brand-primary-dark px-8 py-6 rounded-[2rem] font-black text-base shadow-2xl shadow-brand-primary/20 uppercase tracking-widest">
                {t.himFirstMedia?.foundersCta || "Join the Movement"} <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
    </div>
  );
};
export default Founders;
