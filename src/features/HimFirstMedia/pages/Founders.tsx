import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Quote, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHimFirstMediaPage } from "../hooks/useHimFirstMediaPage";
import {
  HimFirstMediaPageLayout,
  HimFirstHero,
  HimFirstContentSection,
  HimFirstAnimated,
  FounderCard,
} from "../components";

const founders = [
  { name: "Apostle Charles Ubani", role: "Founder & President of Him First Media Group", bio: "Apostle Charles Ubani is a visionary leader, seasoned apostle, and the President of Him First Media Group. With a deep passion for the Gospel and decades of ministry experience, he founded the Exegesis Project." },
  { name: "Apostle Judith Ubani", role: "Co-Founder & Vice President of Him First Media Group", bio: "Apostle Judith Ubani is a woman of God, prophetic voice, and Co-Founder of Him First Media Group. Her heart for discipleship and deep love for Scripture have shaped the spiritual foundation." },
];

const Founders = () => {
  const { t } = useHimFirstMediaPage();

  return (
    <HimFirstMediaPageLayout>
      <HimFirstHero
        title={
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white font-[family-name:var(--font-heading)] tracking-tighter leading-none mb-6">
            {t.himFirstMedia?.foundersTitle || "Our"} <span className="text-brand-accent">{t.himFirstMedia?.foundersTitleHighlight || "Founders"}</span>
          </h1>
        }
        subtitle={t.himFirstMedia?.foundersTagline || "The men and women God used to birth this vision and bring it to life."}
      />

      <HimFirstContentSection>
        <HimFirstAnimated className="space-y-16">
          {founders.map((f, i) => (
            <FounderCard key={f.name} name={f.name} role={f.role} bio={f.bio} reverse={i % 2 === 1} />
          ))}
        </HimFirstAnimated>

        <HimFirstAnimated className="mt-16">
          <div className="bg-card rounded-[2rem] p-8 sm:p-12 border border-border text-center">
            <Quote className="w-8 h-8 text-brand-accent mx-auto mb-4 opacity-50" />
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed font-medium italic mb-4">
              {t.himFirstMedia?.foundersQuote || "\"The Exegesis Project was born out of a simple but powerful conviction that every believer deserves access to deep, reliable, and Spirit-led Bible study tools.\""}
            </p>
            <p className="text-sm font-black text-brand-accent uppercase tracking-widest">{t.himFirstMedia?.foundersQuoteAttribution || "— Apostle Charles Ubani"}</p>
          </div>
        </HimFirstAnimated>

        <HimFirstAnimated className="mt-12 text-center">
          <Link to="/register">
            <Button className="bg-brand-primary text-white hover:bg-brand-primary-dark px-8 py-6 rounded-[2rem] font-black text-base shadow-2xl shadow-brand-primary/20 uppercase tracking-widest">
              {t.himFirstMedia?.foundersCta || "Join the Movement"} <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </HimFirstAnimated>
      </HimFirstContentSection>
    </HimFirstMediaPageLayout>
  );
};

export default Founders;
