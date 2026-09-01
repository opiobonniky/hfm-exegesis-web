import { Quote } from "lucide-react";
import { useHimFirstMediaPage } from "../hooks/useHimFirstMediaPage";
import { FOUNDERS_DATA } from "../constants";
import {
  HimFirstMediaPageLayout, HimFirstHero, HimFirstContentSection, HimFirstAnimated,
  HimFirstQuoteBlock, HimFirstSmallText, HimFirstCTAButton, HimFirstFounderGrid,
} from "../components";

const Founders = () => {
  const { t } = useHimFirstMediaPage();

  return (
    <HimFirstMediaPageLayout>
      <HimFirstHero
        titleText={t.himFirstMedia?.foundersTitle || "Our"}
        titleHighlight={t.himFirstMedia?.foundersTitleHighlight || "Founders"}
        subtitle={t.himFirstMedia?.foundersTagline || "The men and women God used to birth this vision."}
      />

      <HimFirstContentSection>
        <HimFirstFounderGrid founders={FOUNDERS_DATA} />

        <HimFirstAnimated className="mt-16">
          <HimFirstQuoteBlock
            quote={t.himFirstMedia?.foundersQuote || "The Exegesis Project was born out of a simple but powerful conviction."}
            attribution={t.himFirstMedia?.foundersQuoteAttribution || "— Apostle Charles Ubani"}
          />
        </HimFirstAnimated>

        <HimFirstAnimated className="mt-12 text-center">
          <HimFirstCTAButton to="/register">
            {t.himFirstMedia?.foundersCta || "Join the Movement"}
          </HimFirstCTAButton>
        </HimFirstAnimated>
      </HimFirstContentSection>
    </HimFirstMediaPageLayout>
  );
};

export default Founders;
