import { motion } from "framer-motion";
import { useHimFirstMediaPage } from "../hooks/useHimFirstMediaPage";
import {
  HimFirstMediaPageLayout,
  HimFirstHero,
  HimFirstContentSection,
  HimFirstAnimated,
  HimFirstQuoteBlock,
  HimFirstCard,
  HimFirstAvatar,
} from "../components";

const leadership = [
  { name: "Apostle Charles Ubani", role: "General Overseer / President" },
  { name: "Apostle Judith Ubani", role: "General Overseer / Vice President" },
];

const Leadership = () => {
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
            {t.himFirstMedia?.leadershipTitle || "Our"} <span className="text-brand-accent">{t.himFirstMedia?.leadershipTitleHighlight || "Leadership"}</span>
          </h1>
        }
        subtitle={t.himFirstMedia?.leadershipTagline || "Visionaries called by God to lead, equip, and build His Kingdom through the Exegesis Project."}
      />

      <HimFirstContentSection>
        <HimFirstAnimated>
          <h2 className="text-2xl sm:text-3xl font-black text-brand-primary mb-6 font-[family-name:var(--font-heading)] tracking-tight">
            {t.himFirstMedia?.leadershipSectionTitle || "Apostolic Oversight"}
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed font-medium mb-6">
            {t.himFirstMedia?.leadershipPara1 || "The Exegesis Project operates under the spiritual oversight and apostolic covering of Christ Love International Outreach."}
          </p>
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed font-medium mb-12">
            {t.himFirstMedia?.leadershipPara2 || "With over three decades of ministry experience, their leadership ensures that every aspect remains rooted in sound doctrine."}
          </p>
        </HimFirstAnimated>

        <motion.div variants={animFadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid sm:grid-cols-2 gap-8">
          {leadership.map((l) => (
            <HimFirstCard key={l.name} className="text-center">
              <HimFirstAvatar initial={l.name.charAt(0)} size="md" />
              <h3 className="text-xl font-black text-brand-primary mb-1 font-[family-name:var(--font-heading)]">{l.name}</h3>
              <p className="text-sm font-black text-brand-accent uppercase tracking-widest">{l.role}</p>
            </HimFirstCard>
          ))}
        </motion.div>

        <HimFirstAnimated className="mt-12">
          <HimFirstQuoteBlock
            quote={t.himFirstMedia?.leadershipClosing || "And He Himself gave some to be apostles, some prophets, some evangelists, and some pastors and teachers, for the equipping of the saints for the work of ministry."}
            attribution={t.himFirstMedia?.leadershipClosingRef || "Ephesians 4:11-12"}
          />
        </HimFirstAnimated>
      </HimFirstContentSection>
    </HimFirstMediaPageLayout>
  );
};

export default Leadership;
