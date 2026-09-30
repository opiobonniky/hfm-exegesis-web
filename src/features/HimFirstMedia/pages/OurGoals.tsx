import { useHimFirstMediaPage } from "../hooks/useHimFirstMediaPage";
import { GOALS_DATA } from "../constants";
import {
  HimFirstMediaPageLayout, HimFirstHero, HimFirstContentSection, HimFirstAnimated,
  HimFirstCTAButton, HimFirstFeatureList,
} from "../components";
import { tt } from '@/components/languages/hardcodedTranslate';

const OurGoals = () => {
  const { data } = useHimFirstMediaPage();
  const { t } = data;

  return (
    <HimFirstMediaPageLayout>
      <HimFirstHero
        titleText={t.himFirstMedia?.ourGoalsTitle || "Our"}
        titleHighlight={t.himFirstMedia?.ourGoalsTitleHighlight || "Goals"}
        subtitle={t.himFirstMedia?.ourGoalsTagline || tt("Clear targets we're pursuing to fulfill our calling.")}
      />

      <HimFirstContentSection>
        <HimFirstFeatureList items={GOALS_DATA} />

        <HimFirstAnimated className="mt-12 text-center">
          <HimFirstCTAButton to="/register">
            {t.himFirstMedia?.ourGoalsCta || tt("Join Us in Reaching These Goals")}
          </HimFirstCTAButton>
        </HimFirstAnimated>
      </HimFirstContentSection>
    </HimFirstMediaPageLayout>
  );
};

export default OurGoals;
