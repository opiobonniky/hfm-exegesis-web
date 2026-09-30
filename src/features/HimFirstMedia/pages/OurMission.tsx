import { useHimFirstMediaPage } from "../hooks/useHimFirstMediaPage";
import { MISSION_DATA } from "../constants";
import {
  HimFirstMediaPageLayout, HimFirstHero, HimFirstContentSection, HimFirstAnimated,
  HimFirstHeading, HimFirstParagraph, HimFirstCTAButton, HimFirstValues,
} from "../components";
import { tt } from '@/components/languages/hardcodedTranslate';

const OurMission = () => {
  const { data } = useHimFirstMediaPage();
  const { t } = data;

  return (
    <HimFirstMediaPageLayout>
      <HimFirstHero
        titleText={t.himFirstMedia?.ourMissionTitle || "Our"}
        titleHighlight={t.himFirstMedia?.ourMissionTitleHighlight || "Mission"}
        subtitle={t.himFirstMedia?.ourMissionTagline || tt("To help you reach more people and glorify God through His Word.")}
      />

      <HimFirstContentSection>
        <HimFirstAnimated>
          <HimFirstHeading>{t.himFirstMedia?.ourMissionSectionTitle || tt("What Drives Us")}</HimFirstHeading>
          <HimFirstParagraph className="mb-6">{t.himFirstMedia?.ourMissionPara1 || tt("Our mission is simple: to make the deep truths of Scripture accessible to everyone.")}</HimFirstParagraph>
          <HimFirstParagraph className="mb-12">{t.himFirstMedia?.ourMissionPara2 || tt("As a project of Him First Media Group, we bring decades of experience.")}</HimFirstParagraph>
        </HimFirstAnimated>

        <div className="mt-12">
          <HimFirstValues items={MISSION_DATA} columns={2} />
        </div>

        <HimFirstAnimated className="mt-12 text-center">
          <HimFirstCTAButton to="/register">
            {t.himFirstMedia?.ourMissionCta || tt("Join Our Mission")}
          </HimFirstCTAButton>
        </HimFirstAnimated>
      </HimFirstContentSection>
    </HimFirstMediaPageLayout>
  );
};

export default OurMission;
