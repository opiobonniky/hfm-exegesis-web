// AdminTrivia — thin page composing hooks + components
import { Sparkles, Activity } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Users, HelpCircle, TrendingUp } from "lucide-react";
import { useAdminTrivia } from "../hooks/useAdminTrivia";
import {
  TriviaQuestionDialog,
  TriviaOverviewTab, TriviaQuestionsTab, TriviaUsersTab,
  TriviaQuestionStatsTab, TriviaDeleteDialog,
} from "../components";

const AdminTrivia = () => {
  const h = useAdminTrivia();

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6" dir={h.isRtl ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-heading)]">Trivia Management</h1>
          <p className="text-sm text-muted-foreground">Create, edit, and analyze Bible trivia questions</p>
        </div>
        <a href="/admin/trivia/performance" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors">
          <Activity className="w-3.5 h-3.5" /> Performance
        </a>
      </div>

      <Tabs value={h.activeTab} onValueChange={h.setActiveTab} className="space-y-4">
        <TabsList className="overflow-x-auto flex-nowrap w-full justify-start">
          <TabsTrigger value="overview" className="whitespace-nowrap"><BarChart3 className="w-4 h-4 mr-1.5 hidden sm:inline text-foreground/60" />Overview</TabsTrigger>
          <TabsTrigger value="questions" className="whitespace-nowrap"><HelpCircle className="w-4 h-4 mr-1.5 hidden sm:inline text-foreground/60" />Questions</TabsTrigger>
          <TabsTrigger value="users" className="whitespace-nowrap"><Users className="w-4 h-4 mr-1.5 hidden sm:inline text-foreground/60" />User Performance</TabsTrigger>
          <TabsTrigger value="performance" className="whitespace-nowrap"><TrendingUp className="w-4 h-4 mr-1.5 hidden sm:inline text-foreground/60" />Question Stats</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <TriviaOverviewTab h={h} />
        </TabsContent>

        <TabsContent value="questions" className="space-y-4">
          <TriviaQuestionsTab h={h} />
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <TriviaUsersTab h={h} />
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <TriviaQuestionStatsTab h={h} />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <TriviaQuestionDialog open={h.editDialog} onOpenChange={h.setEditDialog} form={h.editForm}
        onFormChange={h.setEditForm} optionsArray={h.optionsArray} onOptionsChange={h.setOptionsArray}
        saving={h.saving} onSave={h.handleSave} />

      <TriviaDeleteDialog target={h.deleteTarget} deleting={h.deleting}
        onClose={() => h.setDeleteTarget(null)} onConfirm={h.handleDelete} />
    </div>
  );
};

export default AdminTrivia;
