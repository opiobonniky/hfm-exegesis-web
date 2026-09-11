// AdminSubscriptions — thin page composing hook + components (no inline HTML)
"use client";

import { TabsContent } from "@/components/ui/tabs";
import { useLanguage } from "@/components/languages/languageProvider";
import { useAdminSubscriptions } from "../hooks/useAdminSubscriptions";
import { AdminSubscriptionsHeader } from "../components/AdminSubscriptionsHeader";
import { AdminSubscriptionsTabs } from "../components/AdminSubscriptionsTabs";
import { SubscriptionsSummaryCards } from "../components/SubscriptionsSummaryCards";
import { TiersTab } from "../components/TiersTab";
import { SubscribersTable } from "../components/SubscribersTable";
import { SuspendUserDialog } from "../components/SuspendUserDialog";
import { DeleteTierDialog } from "../components/DeleteTierDialog";
import { ManageUserDialog } from "../components/ManageUserDialog";
import { RefundUserDialog } from "../components/RefundUserDialog";
import { SubscriptionHistorySheet } from "../components/SubscriptionHistorySheet";
import { TierFormDialog } from "../components/TierFormDialog";

const AdminSubscriptions = () => {
  const { isRtl } = useLanguage();
  const { data, actions } = useAdminSubscriptions();
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6" dir={isRtl ? "rtl" : "ltr"}>
      <AdminSubscriptionsHeader
        activeTab={data.activeTab}
        seeding={data.seeding}
        onSeed={actions.handleSeed}
        onCreateTier={actions.openCreateTier}
      />

      <AdminSubscriptionsTabs activeTab={data.activeTab} onTabChange={actions.setActiveTab}>
        <TabsContent value="tiers" className="space-y-4">
          <TiersTab
            tiers={data.tiers}
            loading={data.tiersLoading}
            counts={data.summary?.tierCounts}
            onEdit={actions.openEditTier}
            onDelete={(id) => actions.setDeleteTier(id)}
          />
        </TabsContent>

        <TabsContent value="subscribers" className="space-y-4">
          <SubscriptionsSummaryCards summary={data.summary} loading={data.subsLoading} />
          <SubscribersTable
            subscribers={data.subscribers}
            loading={data.subsLoading}
            syncing={data.syncing}
            onSyncStripe={actions.handleSyncStripe}
            onSuspend={actions.setSuspendDialog}
            onManage={actions.setManageDialog}
            onRefund={actions.setRefundDialog}
            onHistory={actions.setHistoryDialog}
          />
        </TabsContent>
      </AdminSubscriptionsTabs>

      {/* Dialogs */}
      <TierFormDialog
        open={data.tierDialog}
        onOpenChange={actions.setTierDialog}
        form={data.tierForm}
        onFormChange={actions.setTierForm}
        saving={data.tierSaving}
        onSave={actions.saveTier}
      />

      <DeleteTierDialog
        open={!!data.deleteTier}
        onOpenChange={(o) => !o && actions.setDeleteTier(null)}
        onConfirm={actions.confirmDeleteTier}
      />

      <SuspendUserDialog
        user={data.suspendDialog}
        loading={data.suspendLoading}
        onOpenChange={(o) => !o && actions.setSuspendDialog(null)}
        onConfirm={actions.toggleSuspend}
      />

      <ManageUserDialog
        user={data.manageDialog}
        tiers={data.tiers}
        loading={data.manageLoading}
        onOpenChange={(o) => !o && actions.setManageDialog(null)}
        onSave={actions.saveManage}
      />

      <RefundUserDialog
        user={data.refundDialog}
        loading={data.refundLoading}
        onOpenChange={(o) => !o && actions.setRefundDialog(null)}
        onConfirm={actions.confirmRefund}
      />

      <SubscriptionHistorySheet
        user={data.historyUser}
        onOpenChange={(o) => !o && actions.setHistoryDialog(null)}
      />
    </div>
  );
};

export default AdminSubscriptions;
