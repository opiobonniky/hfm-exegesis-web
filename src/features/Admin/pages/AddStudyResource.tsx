import { useStudyTools } from "../hooks/useStudyTools";
import StudyResourceEditor from "../components/StudyResourceEditor";

export default function AddStudyResource() {
  const { data, actions } = useStudyTools();
  const model = { ...data, ...actions };
  return <StudyResourceEditor model={model} onBack={() => model.navigate(-1)} />;
}
