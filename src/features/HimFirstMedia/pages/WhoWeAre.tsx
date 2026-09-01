import { Users } from "lucide-react";
import { useHimFirstMediaPage } from "../hooks/useHimFirstMediaPage";
import { WHO_WE_ARE_VALUES } from "../constants";
import {
  HimFirstMediaPageLayout, HimFirstHero, HimFirstContentSection, HimFirstAnimated,
  HimFirstParagraph, HimFirstAccentText, HimFirstCTAButton, HimFirstBadge,
  HimFirstValues,
} from "../components";

const WhoWeAre = () => {
  const { t } = useHimFirstMediaPage();

  return (
    <HimFirstMediaPageLayout>
      <HimFirstHero
        badge={<HimFirstBadge icon={<Users className="w-3.5 h-3.5 text-brand-accent" />} label={t.himFirstMedia?.whoWeAreBadge || "About Us"} />}
        titleText={t.himFirstMedia?.whoWeAreTitle || "Who"}
        titleHighlight={t.himFirstMedia?.whoWeAreTitleHighlight || "We Are"}
        subtitle={t.himFirstMedia?.whoWeAreTagline || "We're passionate Jesus followers, tech experts, and creative visionaries."}
      />

      <HimFirstContentSection>
        <HimFirstAnimated>
          <HimFirstParagraph className="mb-8">{t.himFirstMedia?.whoWeArePara1 || "At Exegesis, we believe your spiritual journey deserves more than just a casual reading."}</HimFirstParagraph>
          <HimFirstParagraph className="mb-8">{t.himFirstMedia?.whoWeArePara2 || "We are a project of Him First Media Group."}</HimFirstParagraph>
          <HimFirstParagraph className="mb-12">{t.himFirstMedia?.whoWeArePara3 || "Our goal is simple: to help you reach more people and glorify God."}</HimFirstParagraph>
        </HimFirstAnimated>

        <div className="mt-12">
          <HimFirstValues items={WHO_WE_ARE_VALUES} />
        </div>

        <HimFirstAnimated className="mt-12 text-center">
          <HimFirstAccentText className="mb-8">{t.himFirstMedia?.whoWeAreMotto || "\"Quality, Service, & Integrity — Built for His Glory.\""}</HimFirstAccentText>
          <HimFirstCTAButton to="/register">
            {t.himFirstMedia?.whoWeAreCta || "Join Our Community"}
          </HimFirstCTAButton>
        </HimFirstAnimated>
      </HimFirstContentSection>
    </HimFirstMediaPageLayout>
  );
};

export default WhoWeAre;
