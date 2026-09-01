import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHimFirstMediaPage } from "../hooks/useHimFirstMediaPage";
import {
  HimFirstMediaPageLayout,
  HimFirstHero,
  HimFirstContentSection,
  HimFirstAnimated,
  HimFirstQuoteBlock,
} from "../components";

const OurVision = () => {
  const { t } = useHimFirstMediaPage();

  return (
    <HimFirstMediaPageLayout>
      <HimFirstHero
        title={
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white font-[family-name:var(--font-heading)] tracking-tighter leading-none mb-6">
            {t.himFirstMedia?.ourVisionTitle || "Our"} <span className="text-brand-accent">{t.himFirstMedia?.ourVisionTitleHighlight || "Vision"}</span>
          </h1>
        }
        subtitle={t.himFirstMedia?.ourVisionTagline || "To see every believer equipped with the Word of God through technology that inspires, teaches, and transforms."}
      />

      <HimFirstContentSection>
        <HimFirstAnimated>
          <h2 className="text-2xl sm:text-3xl font-black text-brand-primary mb-6 font-[family-name:var(--font-heading)] tracking-tight">
            {t.himFirstMedia?.ourVisionSectionTitle || "A Kingdom-Focused Future"}
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed font-medium mb-6">
            {t.himFirstMedia?.ourVisionPara1 || "Our vision is to build the most comprehensive, accessible, and Spirit-led Bible study platform in the world."}
          </p>
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed font-medium mb-6">
            {t.himFirstMedia?.ourVisionPara2 || "As a project of Him First Media Group, we are committed to using cutting-edge digital tools to spread the Gospel."}
          </p>
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed font-medium mb-6">
            {t.himFirstMedia?.ourVisionPara3 || "We see a world where every Christian has a personalized Bible study experience."}
          </p>
        </HimFirstAnimated>

        <HimFirstAnimated className="mt-12">
          <HimFirstQuoteBlock
            quote={t.himFirstMedia?.ourVisionVerse || "Write the vision, and make it plain upon tables, that he may run that readeth it."}
            attribution={t.himFirstMedia?.ourVisionVerseRef || "Habakkuk 2:2"}
          />
        </HimFirstAnimated>

        <HimFirstAnimated className="mt-12 text-center">
          <Link to="/register">
            <Button className="bg-brand-primary text-white hover:bg-brand-primary-dark px-8 py-6 rounded-[2rem] font-black text-base shadow-2xl shadow-brand-primary/20 uppercase tracking-widest">
              {t.himFirstMedia?.ourVisionCta || "Join the Vision"} <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </HimFirstAnimated>
      </HimFirstContentSection>
    </HimFirstMediaPageLayout>
  );
};

export default OurVision;
