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
import { TierFormDialog } from "../components/TierFormDialog";

const AdminSubscriptions = () => {
  const { isRtl } = useLanguage();
  const h = useAdminSubscriptions();

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6" dir={isRtl ? "rtl" : "ltr"}>
      <AdminSubscriptionsHeader
        activeTab={h.activeTab}
        seeding={h.seeding}
        onSeed={h.handleSeed}
        onCreateTier={h.openCreateTier}
      />

      <AdminSubscriptionsTabs activeTab={h.activeTab} onTabChange={h.setActiveTab}>
        <TabsContent value="tiers" className="space-y-4">
          <TiersTab
            tiers={h.tiers}
            loading={h.tiersLoading}
            counts={h.summary?.tierCounts}
            onEdit={h.openEditTier}
            onDelete={(id) => h.setDeleteTier(id)}
          />
        </TabsContent>

        <TabsContent value="subscribers" className="space-y-4">
          <SubscriptionsSummaryCards summary={h.summary} loading={h.subsLoading} />
          <SubscribersTable
            subscribers={h.subscribers}
            loading={h.subsLoading}
            syncing={h.syncing}
            onSyncStripe={h.handleSyncStripe}
            onSuspend={h.setSuspendDialog}
            onManage={h.setManageDialog}
            onRefund={h.setRefundDialog}
          />
        </TabsContent>
      </AdminSubscriptionsTabs>

      {/* Dialogs */}
      <TierFormDialog
        open={h.tierDialog}
        onOpenChange={h.setTierDialog}
        form={h.tierForm}
        onFormChange={h.setTierForm}
        saving={h.tierSaving}
        onSave={h.saveTier}
      />

      <DeleteTierDialog
        open={!!h.deleteTier}
        onOpenChange={(o) => !o && h.setDeleteTier(null)}
        onConfirm={h.confirmDeleteTier}
      />

      <SuspendUserDialog
        user={h.suspendDialog}
        loading={h.suspendLoading}
        onOpenChange={(o) => !o && h.setSuspendDialog(null)}
        onConfirm={h.toggleSuspend}
      />

      <ManageUserDialog
        user={h.manageDialog}
        tiers={h.tiers}
        loading={h.manageLoading}
        onOpenChange={(o) => !o && h.setManageDialog(null)}
        onSave={h.saveManage}
      />

      <RefundUserDialog
        user={h.refundDialog}
        loading={h.refundLoading}
        onOpenChange={(o) => !o && h.setRefundDialog(null)}
        onConfirm={h.confirmRefund}
      />
    </div>
  );
};

export default AdminSubscriptions;
