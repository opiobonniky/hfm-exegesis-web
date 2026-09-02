import { useLabReviewPage } from "../hooks";
import { LabReviewContent, LabReviewError, LabReviewHeader, LabReviewLoading, LabPageWrapper } from "../components";
import { LAB_ERRORS } from "../constants";

export default function LabReview() {
  const p = useLabReviewPage();

  if (p.loading) return <LabReviewLoading />;
  if (p.error || !p.session) {
    return (
      <LabReviewError
        error={p.error ? LAB_ERRORS.LOAD_FAILED : LAB_ERRORS.SESSION_NOT_FOUND}
        onGoBack={p.goBack}
      />
    );
  }

  return (
    <LabPageWrapper>
      <LabReviewHeader passageRef={p.session.passageRef} onGoBack={p.goBack} />
      <LabReviewContent session={p.session} onGoBack={p.goBack} />
    </LabPageWrapper>
  );
}
