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
  const s = useStudyTools();

  return (
    <div className="min-h-screen bg-background">
      <AdminPageContent className="py-6 space-y-6">
        <StudyToolsHeader onBack={() => s.navigate(-1)} />

        <Tabs value={s.activeTab} onValueChange={s.setActiveTab}>
          <TabsList>
            <TabsTrigger value="words">Words</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="studies">Studies</TabsTrigger>
            <TabsTrigger value="prologues">Prologues</TabsTrigger>
          </TabsList>
          <TabsContent value="words"><WordsTab state={s} /></TabsContent>
          <TabsContent value="resources"><ResourcesTab state={s} /></TabsContent>
          <TabsContent value="studies"><StudiesTab state={s} /></TabsContent>
          <TabsContent value="prologues"><ProloguesTab state={s} /></TabsContent>
        </Tabs>
      </AdminPageContent>
    </div>
  );
}
