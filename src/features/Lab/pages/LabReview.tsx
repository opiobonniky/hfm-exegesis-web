import { useLabReviewPage as useLabReview } from "../hooks";
import { LabReviewContent, LabReviewError, LabReviewHeader, LabReviewLoading, LabPageWrapper } from "../components";
import { LAB_ERRORS } from "../constants";

export default function LabReview() {
  const {data, actions} = useLabReview();

  if (data.loading) return <LabReviewLoading />;
  if (data.error || !data.session) {
    return (
      <LabReviewError
        error={data.error ? LAB_ERRORS.LOAD_FAILED : LAB_ERRORS.SESSION_NOT_FOUND}
        onGoBack={actions.goBack}
      />
    );
  }

  return (
    <LabPageWrapper>
      <LabReviewHeader passageRef={data.session.passageRef} onGoBack={actions.goBack} />
      <LabReviewContent session={data.session} onGoBack={actions.goBack} />
    </LabPageWrapper>
  );
}
