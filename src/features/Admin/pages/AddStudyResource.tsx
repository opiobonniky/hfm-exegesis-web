import { useStudyTools } from "../hooks/useStudyTools";
import StudyResourceEditor from "../components/StudyResourceEditor";

export default function AddStudyResource() {
  const model = useStudyTools();
  return <StudyResourceEditor model={model} onBack={() => model.navigate(-1)} />;
}
