// AdminStudyTools — thin page composing hook + components (no inline HTML)
"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStudyTools } from "../hooks/useStudyTools";
import WordsTab from "../components/WordsTab";
import ResourcesTab from "../components/ResourcesTab";
import StudiesTab from "../components/StudiesTab";
import ProloguesTab from "../components/ProloguesTab";
import { StudyToolsHeader } from "../components/StudyToolsHeader";
import { AdminPageContent } from "../components/AdminPageContent";

export default function AdminStudyTools() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("words");
  const state = useStudyTools();

  return (
    <div className="min-h-screen bg-background">
      <AdminPageContent className="py-6 space-y-6">
        <StudyToolsHeader onBack={() => navigate(-1)} />

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="words">Words</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="studies">Studies</TabsTrigger>
            <TabsTrigger value="prologues">Prologues</TabsTrigger>
          </TabsList>
          <TabsContent value="words"><WordsTab state={state} /></TabsContent>
          <TabsContent value="resources"><ResourcesTab state={state} /></TabsContent>
          <TabsContent value="studies"><StudiesTab state={state} /></TabsContent>
          <TabsContent value="prologues"><ProloguesTab state={state} /></TabsContent>
        </Tabs>
      </AdminPageContent>
    </div>
  );
}
