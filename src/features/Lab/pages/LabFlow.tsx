/**
 * LabFlow — composable page for the 5-stage Bible study flow.
 * Uses useLabFlowPage which wraps useLabFlow + data fetching.
 */
import { useLabFlowPage } from "../hooks";
import { LabFlowHeader, LabFlowLayout, LabFlowLoading, LabFlowStageContent } from "../components";

export default function LabFlow() {
  const p = useLabFlowPage();

  if (p.lab.loading) return <LabFlowLoading />;

  return (
    <LabFlowLayout isRtl={p.isRtl}>
      <LabFlowHeader
        passageRef={p.lab.passageRef}
        stage={p.lab.stage}
        saving={p.lab.saving}
        completed={p.lab.completed}
        onBack={p.goBack}
        onSave={p.lab.saveCurrentProgress}
        onGoToStage={p.lab.goToStage}
      />
      <LabFlowStageContent h={p} />
    </LabFlowLayout>
  );
}
