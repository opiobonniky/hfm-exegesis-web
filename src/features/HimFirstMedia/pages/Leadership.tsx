import { useHimFirstMediaPage } from "../hooks/useHimFirstMediaPage";
import { LEADERSHIP_DATA } from "../constants";
import {
  HimFirstMediaPageLayout, HimFirstHero, HimFirstContentSection, HimFirstAnimated,
  HimFirstQuoteBlock, HimFirstHeading, HimFirstParagraph, HimFirstLeaderGrid,
} from "../components";

const Leadership = () => {
  const { t } = useHimFirstMediaPage();

  return (
    <HimFirstMediaPageLayout>
      <HimFirstHero
        titleText={t.himFirstMedia?.leadershipTitle || "Our"}
        titleHighlight={t.himFirstMedia?.leadershipTitleHighlight || "Leadership"}
        subtitle={t.himFirstMedia?.leadershipTagline || "Visionaries called by God to lead, equip, and build His Kingdom."}
      />

      <HimFirstContentSection>
        <HimFirstAnimated>
          <HimFirstHeading>{t.himFirstMedia?.leadershipSectionTitle || "Apostolic Oversight"}</HimFirstHeading>
          <HimFirstParagraph className="mb-6">{t.himFirstMedia?.leadershipPara1 || "The Exegesis Project operates under spiritual oversight of Christ Love International Outreach."}</HimFirstParagraph>
          <HimFirstParagraph className="mb-12">{t.himFirstMedia?.leadershipPara2 || "With over three decades of ministry experience, their leadership ensures every aspect remains rooted."}</HimFirstParagraph>
        </HimFirstAnimated>

        <HimFirstLeaderGrid leaders={LEADERSHIP_DATA} />

        <HimFirstAnimated className="mt-12">
          <HimFirstQuoteBlock
            quote={t.himFirstMedia?.leadershipClosing || "And He Himself gave some to be apostles, some prophets, some evangelists."}
            attribution={t.himFirstMedia?.leadershipClosingRef || "Ephesians 4:11-12"}
          />
        </HimFirstAnimated>
      </HimFirstContentSection>
    </HimFirstMediaPageLayout>
  );
};

export default Leadership;
