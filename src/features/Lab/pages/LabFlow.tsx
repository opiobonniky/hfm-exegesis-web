/**
 * LabFlow — composable page for the 5-stage Bible study flow.
 * Uses useLabFlowPage which wraps useLabFlow + data fetching.
 */
import { useLabFlowPage } from "../hooks";
import { LabFlowHeader, LabFlowLayout, LabFlowLoading, LabFlowStageContent } from "../components";

export default function LabFlow() {
  const { data, actions } = useLabFlowPage();

  if (data.lab.loading) return <LabFlowLoading />;

  return (
    <LabFlowLayout isRtl={data.isRtl}>
      <LabFlowHeader
        passageRef={data.lab.passageRef}
        stage={data.lab.stage}
        saving={data.lab.saving}
        completed={data.lab.completed}
        onBack={actions.goBack}
        onSave={actions.lab.saveCurrentProgress}
        onGoToStage={actions.lab.goToStage}
      />
      <LabFlowStageContent h={{ data, actions }} />
    </LabFlowLayout>
  );
}
