import { useLabHome } from "../hooks";
import {
  LabHistoryList,
  LabHomeEmpty,
  LabHomeFooter,
  LabHomeHeader,
  LabHomeHero,
  LabHomeLoading,
  LabHomeMethod,
  LabHomeOnboarding,
  LabHomeStats,
  LabHomeWorkspace,
  LabPageWrapper,
} from "../components";

export default function LabHomePage() {
  const {data, actions} = useLabHome();

  if (data.loading) return <LabHomeLoading />;

  

  return (
    <LabPageWrapper>
      <LabHomeHeader />

      <LabHomeWorkspace>
        <LabHomeHero
          activeSession={data.activeSession}
          onStartStudy={actions.openNewStudy}
          handleResumeStudy={actions.handleResumeStudy}
        />
        {data.history.length > 0 && (
          <LabHomeStats
            completedCount={data.completedCount}
            totalCount={data.history.length}
            inProgressCount={data.inProgressCount}
          />
        )}
        <LabHomeMethod />
        {data.history.length > 0 && (
          <LabHistoryList
            history={data.history}
            handleResumeStudy={actions.handleResumeStudy}
            handleReviewStudy={actions.handleReviewStudy}
          />
        )}
        {!data.activeSession && data.history.length === 0 && <LabHomeEmpty />}
        <LabHomeFooter historyCount={data.history.length} />
      </LabHomeWorkspace>

      {data.showOnboarding && (
        <LabHomeOnboarding
          onDismiss={actions.dismissOnboarding}
          step={data.onboardingStep}
          onStepChange={actions.setOnboardingStep}
        />
      )}
    </LabPageWrapper>
  );
}
