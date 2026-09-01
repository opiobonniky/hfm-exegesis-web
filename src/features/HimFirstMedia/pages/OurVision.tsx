import { useHimFirstMediaPage } from "../hooks/useHimFirstMediaPage";
import {
  HimFirstMediaPageLayout, HimFirstHero, HimFirstContentSection, HimFirstAnimated,
  HimFirstQuoteBlock, HimFirstHeading, HimFirstParagraph, HimFirstCTAButton,
} from "../components";

const OurVision = () => {
  const { t } = useHimFirstMediaPage();

  return (
    <HimFirstMediaPageLayout>
      <HimFirstHero
        titleText={t.himFirstMedia?.ourVisionTitle || "Our"}
        titleHighlight={t.himFirstMedia?.ourVisionTitleHighlight || "Vision"}
        subtitle={t.himFirstMedia?.ourVisionTagline || "To see every believer equipped with the Word of God through technology."}
      />

      <HimFirstContentSection>
        <HimFirstAnimated>
          <HimFirstHeading>{t.himFirstMedia?.ourVisionSectionTitle || "A Kingdom-Focused Future"}</HimFirstHeading>
          <HimFirstParagraph className="mb-6">{t.himFirstMedia?.ourVisionPara1 || "Our vision is to build the most comprehensive Bible study platform."}</HimFirstParagraph>
          <HimFirstParagraph className="mb-6">{t.himFirstMedia?.ourVisionPara2 || "We are committed to using cutting-edge digital tools to spread the Gospel."}</HimFirstParagraph>
          <HimFirstParagraph className="mb-6">{t.himFirstMedia?.ourVisionPara3 || "We see a world where every Christian has a personalized Bible study experience."}</HimFirstParagraph>
        </HimFirstAnimated>

        <HimFirstAnimated className="mt-12">
          <HimFirstQuoteBlock
            quote={t.himFirstMedia?.ourVisionVerse || "Write the vision, and make it plain upon tables."}
            attribution={t.himFirstMedia?.ourVisionVerseRef || "Habakkuk 2:2"}
          />
        </HimFirstAnimated>

        <HimFirstAnimated className="mt-12 text-center">
          <HimFirstCTAButton to="/register">
            {t.himFirstMedia?.ourVisionCta || "Join the Vision"}
          </HimFirstCTAButton>
        </HimFirstAnimated>
      </HimFirstContentSection>
    </HimFirstMediaPageLayout>
  );
};

export default OurVision;
