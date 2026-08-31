// AdminTrivia — thin page composing hook + components (no inline HTML)
"use client";

import { TabsContent } from "@/components/ui/tabs";
import { useAdminTrivia } from "../hooks/useAdminTrivia";
import {
  TriviaQuestionDialog,
  TriviaOverviewTab,
  TriviaQuestionsTab,
  TriviaUsersTab,
  TriviaQuestionStatsTab,
  TriviaDeleteDialog,
} from "../components";
import { AdminTriviaHeader } from "../components/AdminTriviaHeader";
import { AdminTriviaTabs } from "../components/AdminTriviaTabs";

const AdminTrivia = () => {
  const h = useAdminTrivia();

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6" dir={h.isRtl ? "rtl" : "ltr"}>
      <AdminTriviaHeader
        onPerformanceClick={() => window.location.assign("/admin/trivia/performance")}
      />

      <AdminTriviaTabs activeTab={h.activeTab} onTabChange={h.setActiveTab}>
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
      </AdminTriviaTabs>

      <TriviaQuestionDialog
        open={h.editDialog}
        onOpenChange={h.setEditDialog}
        form={h.editForm}
        onFormChange={h.setEditForm}
        optionsArray={h.optionsArray}
        onOptionsChange={h.setOptionsArray}
        saving={h.saving}
        onSave={h.handleSave}
      />

      <TriviaDeleteDialog
        target={h.deleteTarget}
        deleting={h.deleting}
        onClose={() => h.setDeleteTarget(null)}
        onConfirm={h.handleDelete}
      />
    </div>
  );
};

export default AdminTrivia;
