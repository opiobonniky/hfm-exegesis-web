import { useLabHome } from "../hooks";
import { 
  LabHistoryList, LabHomeEmpty, LabHomeFooter, LabHomeHeader, 
  LabHomeHero, LabHomeLoading, LabHomeMethod, LabHomeOnboarding, 
  LabHomeStats, LabHomeWorkspace, LabPageWrapper 
} from "../components";

export default function LabHomePage() {
  const p = useLabHome();

  return (
    <LabPageWrapper>
      <LabHomeHeader />
      {p.loading ? (
        <LabHomeLoading />
      ) : (
        <LabHomeWorkspace>
          <LabHomeHero
            activeSession={p.activeSession}
            onStartStudy={p.openNewStudy}
            handleResumeStudy={p.handleResumeStudy}
          />
          {p.history.length > 0 && (
            <LabHomeStats
              completedCount={p.completedCount}
              totalCount={p.history.length}
              inProgressCount={p.inProgressCount}
            />
          )}
          <LabHomeMethod />
          {p.history.length > 0 && (
            <LabHistoryList
              history={p.history}
              handleResumeStudy={p.handleResumeStudy}
              handleReviewStudy={p.handleReviewStudy}
            />
          )}
          {!p.activeSession && p.history.length === 0 && <LabHomeEmpty />}
          <LabHomeFooter historyCount={p.history.length} />
        </LabHomeWorkspace>
      )}
      {p.showOnboarding && (
        <LabHomeOnboarding
          onDismiss={p.dismissOnboarding}
          step={p.onboardingStep}
          onStepChange={p.setOnboardingStep}
        />
      )}
    </LabPageWrapper>
  );
}
