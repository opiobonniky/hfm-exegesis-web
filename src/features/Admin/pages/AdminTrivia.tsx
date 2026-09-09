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
  const { data, actions } = useAdminTrivia();
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6" dir={data.isRtl ? "rtl" : "ltr"}>
      <AdminTriviaHeader
        onPerformanceClick={() => window.location.assign("/admin/trivia/performance")}
      />

      <AdminTriviaTabs activeTab={data.activeTab} onTabChange={actions.setActiveTab}>
        <TabsContent value="overview" className="space-y-4">
          <TriviaOverviewTab h={{ ...data, ...actions }} />
        </TabsContent>

        <TabsContent value="questions" className="space-y-4">
          <TriviaQuestionsTab h={{ ...data, ...actions }} />
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <TriviaUsersTab h={{ ...data, ...actions }} />
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <TriviaQuestionStatsTab h={{ ...data, ...actions }} />
        </TabsContent>
      </AdminTriviaTabs>

      <TriviaQuestionDialog
        open={data.editDialog}
        onOpenChange={actions.setEditDialog}
        form={data.editForm}
        onFormChange={actions.setEditForm}
        optionsArray={data.optionsArray}
        onOptionsChange={actions.setOptionsArray}
        saving={data.saving}
        onSave={actions.handleSave}
      />

      <TriviaDeleteDialog
        target={data.deleteTarget}
        deleting={data.deleting}
        onClose={() => actions.setDeleteTarget(null)}
        onConfirm={actions.handleDelete}
      />
    </div>
  );
};

export default AdminTrivia;
