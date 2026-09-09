import { useStudyTools } from "../hooks/useStudyTools";
import StudyResourceEditor from "../components/StudyResourceEditor";

export default function AddStudyResource() {
  const { data, actions } = useStudyTools();
  const state = { ...data, ...actions };
  return <StudyResourceEditor state={state} onBack={() => state.navigate(-1)} />;
}
