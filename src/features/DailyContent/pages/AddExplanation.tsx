import { AddExplanationPageLayout } from "../components/AddExplanationPageLayout";
import { useAddExplanation } from "../hooks/useAddExplanation";

export default function AddExplanationPage() {
  const h = useAddExplanation();

  return <AddExplanationPageLayout model={h} />;
}
