import { motion } from "framer-motion";
import { Crown } from "lucide-react";
import { useHimFirstMediaPage } from "../hooks/useHimFirstMediaPage";

const leadership = [
  {
    name: "Apostle Charles Ubani",
    role: "General Overseer / President",
    image: "/images/charles-ubani.jpg",
  },
  {
    name: "Apostle Judith Ubani",
    role: "General Overseer / Vice President",
    image: "/images/judith-ubani.jpg",
  },
];

const Leadership = () => {
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
              {t.himFirstMedia?.leadershipTitle || "Our"} <span className="text-brand-accent">{t.himFirstMedia?.leadershipTitleHighlight || "Leadership"}</span>
            </h1>
            <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed font-medium">
              {t.himFirstMedia?.leadershipTagline || "Visionaries called by God to lead, equip, and build His Kingdom through the Exegesis Project."}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-12 bg-card">
        <div className="w-full max-w-4xl mx-auto">
          <motion.div variants={animFadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <h2 className="text-2xl sm:text-3xl font-black text-brand-primary mb-6 font-[family-name:var(--font-heading)] tracking-tight">
              {t.himFirstMedia?.leadershipSectionTitle || "Apostolic Oversight"}
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed font-medium mb-6">
              {t.himFirstMedia?.leadershipPara1 || "The Exegesis Project operates under the spiritual oversight and apostolic covering of Christ Love International Outreach, led by Apostle Charles Ubani and Apostle Judith Ubani."}
            </p>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed font-medium mb-12">
              {t.himFirstMedia?.leadershipPara2 || "With over three decades of ministry experience, their leadership ensures that every aspect of the Exegesis Project remains rooted in sound doctrine, prayer, and the leading of the Holy Spirit."}
            </p>
          </motion.div>

          <motion.div variants={animFadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid sm:grid-cols-2 gap-8">
            {leadership.map((l) => (
              <div key={l.name} className="bg-card rounded-[2rem] p-6 sm:p-8 border border-border text-center">
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-brand-primary to-brand-accent mx-auto mb-6 overflow-hidden shadow-lg flex items-center justify-center">
                  <span className="text-3xl font-black text-white">{l.name.charAt(0)}</span>
                </div>
                <h3 className="text-xl font-black text-brand-primary mb-1 font-[family-name:var(--font-heading)]">{l.name}</h3>
                <p className="text-sm font-black text-brand-accent uppercase tracking-widest">{l.role}</p>
              </div>
            ))}
          </motion.div>

          <motion.div variants={animFadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mt-12 bg-card rounded-[2rem] p-8 sm:p-12 border border-border text-center">
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed font-medium italic">
              {t.himFirstMedia?.leadershipClosing || "\"And He Himself gave some to be apostles, some prophets, some evangelists, and some pastors and teachers, for the equipping of the saints for the work of ministry.\""}
            </p>
            <p className="text-sm font-black text-muted-foreground uppercase tracking-widest mt-4">— {t.himFirstMedia?.leadershipClosingRef || "Ephesians 4:11-12"}</p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Leadership;
