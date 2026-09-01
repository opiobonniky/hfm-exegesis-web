import { useHimFirstMediaPage } from "../hooks/useHimFirstMediaPage";
import { MISSION_DATA } from "../constants";
import {
  HimFirstMediaPageLayout, HimFirstHero, HimFirstContentSection, HimFirstAnimated,
  HimFirstHeading, HimFirstParagraph, HimFirstCTAButton, HimFirstValues,
} from "../components";

const OurMission = () => {
  const { t } = useHimFirstMediaPage();

  return (
    <HimFirstMediaPageLayout>
      <HimFirstHero
        titleText={t.himFirstMedia?.ourMissionTitle || "Our"}
        titleHighlight={t.himFirstMedia?.ourMissionTitleHighlight || "Mission"}
        subtitle={t.himFirstMedia?.ourMissionTagline || "To help you reach more people and glorify God through His Word."}
      />

      <HimFirstContentSection>
        <HimFirstAnimated>
          <HimFirstHeading>{t.himFirstMedia?.ourMissionSectionTitle || "What Drives Us"}</HimFirstHeading>
          <HimFirstParagraph className="mb-6">{t.himFirstMedia?.ourMissionPara1 || "Our mission is simple: to make the deep truths of Scripture accessible to everyone."}</HimFirstParagraph>
          <HimFirstParagraph className="mb-12">{t.himFirstMedia?.ourMissionPara2 || "As a project of Him First Media Group, we bring decades of experience."}</HimFirstParagraph>
        </HimFirstAnimated>

        <div className="mt-12">
          <HimFirstValues items={MISSION_DATA} columns={2} />
        </div>

        <HimFirstAnimated className="mt-12 text-center">
          <HimFirstCTAButton to="/register">
            {t.himFirstMedia?.ourMissionCta || "Join Our Mission"}
          </HimFirstCTAButton>
        </HimFirstAnimated>
      </HimFirstContentSection>
    </HimFirstMediaPageLayout>
  );
};

export default OurMission;
