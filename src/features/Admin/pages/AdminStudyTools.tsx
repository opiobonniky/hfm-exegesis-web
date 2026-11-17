// AdminStudyTools — thin page composing hook + components (no inline HTML)
"use client";

import { useStudyTools } from "../hooks/useStudyTools";
import WordsTab from "../components/WordsTab";
import { StudyToolsHeader } from "../components/StudyToolsHeader";
import { AdminPageContent } from "../components/AdminPageContent";

export default function AdminStudyTools() {
  const { data, actions } = useStudyTools();
  return (
    <div className="min-h-screen bg-background">
      <AdminPageContent className="py-6 space-y-6">
        <StudyToolsHeader onBack={() => actions.navigate(-1)} />
        <WordsTab state={{ ...data, ...actions }} />
      </AdminPageContent>
    </div>
  );
}
