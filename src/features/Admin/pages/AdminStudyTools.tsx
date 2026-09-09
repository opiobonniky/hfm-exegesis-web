// AdminStudyTools — thin page composing hook + components (no inline HTML)
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStudyTools } from "../hooks/useStudyTools";
import WordsTab from "../components/WordsTab";
import ResourcesTab from "../components/ResourcesTab";
import StudiesTab from "../components/StudiesTab";
import ProloguesTab from "../components/ProloguesTab";
import { StudyToolsHeader } from "../components/StudyToolsHeader";
import { AdminPageContent } from "../components/AdminPageContent";

export default function AdminStudyTools() {
  const { data, actions } = useStudyTools();
  return (
    <div className="min-h-screen bg-background">
      <AdminPageContent className="py-6 space-y-6">
        <StudyToolsHeader onBack={() => actions.navigate(-1)} onAddResource={() => actions.navigate("/admin/study-tools/add")} />

        <Tabs value={data.activeTab} onValueChange={actions.setActiveTab}>
          <TabsList>
            <TabsTrigger value="words">Words</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="studies">Studies</TabsTrigger>
            <TabsTrigger value="prologues">Prologues</TabsTrigger>
          </TabsList>
          <TabsContent value="words"><WordsTab state={{ ...data, ...actions }} /></TabsContent>
          <TabsContent value="resources"><ResourcesTab state={{ ...data, ...actions }} /></TabsContent>
          <TabsContent value="studies"><StudiesTab state={{ ...data, ...actions }} /></TabsContent>
          <TabsContent value="prologues"><ProloguesTab state={{ ...data, ...actions }} /></TabsContent>
        </Tabs>
      </AdminPageContent>
    </div>
  );
}
