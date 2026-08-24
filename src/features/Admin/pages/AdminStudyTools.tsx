"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/components/languages/languageProvider";
import { useStudyTools } from "../hooks/useStudyTools";
import WordsTab from "../components/WordsTab";
import ResourcesTab from "../components/ResourcesTab";
import StudiesTab from "../components/StudiesTab";
import ProloguesTab from "../components/ProloguesTab";
export default function AdminStudyTools() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("words");
  const state = useStudyTools();
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Study Tools Manager</h1>
            <p className="text-sm text-muted-foreground">Manage Strong's words, verse resources, studies, and prologues</p>
          </div>
        </div>
        {/* Tabs */}
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
      </div>
    </div>
  );
}
