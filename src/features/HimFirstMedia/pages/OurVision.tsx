import { useHimFirstMediaPage } from "../hooks/useHimFirstMediaPage";
import {
  HimFirstMediaPageLayout, HimFirstHero, HimFirstContentSection, HimFirstAnimated,
  HimFirstQuoteBlock, HimFirstHeading, HimFirstParagraph, HimFirstCTAButton,
} from "../components";
import { tt } from '@/components/languages/hardcodedTranslate';

const OurVision = () => {
  const { data } = useHimFirstMediaPage();
  const { t } = data;

  return (
    <HimFirstMediaPageLayout>
      <HimFirstHero
        titleText={t.himFirstMedia?.ourVisionTitle || "Our"}
        titleHighlight={t.himFirstMedia?.ourVisionTitleHighlight || "Vision"}
        subtitle={t.himFirstMedia?.ourVisionTagline || tt("To see every believer equipped with the Word of God through technology.")}
      />

      <HimFirstContentSection>
        <HimFirstAnimated>
          <HimFirstHeading>{t.himFirstMedia?.ourVisionSectionTitle || tt("A Kingdom-Focused Future")}</HimFirstHeading>
          <HimFirstParagraph className="mb-6">{t.himFirstMedia?.ourVisionPara1 || tt("Our vision is to build the most comprehensive Bible study platform.")}</HimFirstParagraph>
          <HimFirstParagraph className="mb-6">{t.himFirstMedia?.ourVisionPara2 || tt("We are committed to using cutting-edge digital tools to spread the Gospel.")}</HimFirstParagraph>
          <HimFirstParagraph className="mb-6">{t.himFirstMedia?.ourVisionPara3 || tt("We see a world where every Christian has a personalized Bible study experience.")}</HimFirstParagraph>
        </HimFirstAnimated>

        <HimFirstAnimated className="mt-12">
          <HimFirstQuoteBlock
            quote={t.himFirstMedia?.ourVisionVerse || "Write the vision, and make it plain upon tables."}
            attribution={t.himFirstMedia?.ourVisionVerseRef || "Habakkuk 2:2"}
          />
        </HimFirstAnimated>

        <HimFirstAnimated className="mt-12 text-center">
          <HimFirstCTAButton to="/register">
            {t.himFirstMedia?.ourVisionCta || tt("Join the Vision")}
          </HimFirstCTAButton>
        </HimFirstAnimated>
      </HimFirstContentSection>
    </HimFirstMediaPageLayout>
  );
};

export default OurVision;
