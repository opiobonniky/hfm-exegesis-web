// AdminReadingPlans — thin page composing hook + components (no inline HTML)
"use client";

import { Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAdminReadingPlans } from "../hooks/useAdminReadingPlans";
import {
  AdminPageHeader,
  AdminEmptyState,
  AdminLoadingGrid,
  AdminSearchBar,
  AdminPageContent,
} from "../components";
import { ReadingPlanGrid } from "../components/ReadingPlanGrid";
import { ReadingPlanFormDialog } from "../components/ReadingPlanFormDialog";
import { ReadingPlanDeleteDialog } from "../components/ReadingPlanDeleteDialog";

export default function AdminReadingPlans() {
  const h = useAdminReadingPlans();
  const navigate = useNavigate();

  const showEditDialog = !!h.editPlan || h.editForm.title !== "";

  return (
    <div className="min-h-screen bg-background">
      <AdminPageHeader
        title="Reading Plans Manager"
        subtitle={`${h.totalCount || h.plans.length} plans`}
        icon={<Calendar className="w-5 h-5 text-primary" />}
        onBack={() => window.history.back()}
        onAdd={() => h.openEdit()}
        addLabel="Add Plan"
      />

      <AdminPageContent className="py-6">
        <AdminSearchBar
          value={h.search}
          onChange={h.setSearch}
          onSearch={h.handleSearch}
          placeholder="Search plans..."
        />

        {h.loading && h.plans.length === 0 ? (
          <AdminLoadingGrid />
        ) : h.plans.length === 0 ? (
          <AdminEmptyState
            icon={<Calendar className="w-12 h-12" />}
            title="No reading plans found"
            description="Create your first reading plan"
            onAction={() => h.openEdit()}
          />
        ) : (
          <ReadingPlanGrid
            plans={h.plans}
            loadingMore={h.loadingMore}
            hasMore={h.hasMore}
            sentinelRef={h.sentinelRef}
            onEdit={(plan) => h.openEdit(plan)}
            onDelete={(plan) => h.setDeletePlan(plan)}
            onView={(plan) =>
              navigate(
                `/admin/reading-plans/${encodeURIComponent(
                  plan.planId || String(plan.id),
                )}`,
              )
            }
          />
        )}
      </AdminPageContent>

      <ReadingPlanFormDialog
        open={showEditDialog}
        editPlan={h.editPlan}
        form={h.editForm}
        saving={h.saving}
        onFieldChange={h.updateFormField}
        onSave={h.handleSave}
        onClose={h.closeEdit}
      />

      <ReadingPlanDeleteDialog
        open={!!h.deletePlan}
        title={h.deletePlan?.title || null}
        deleting={h.deleting}
        onOpenChange={(o) => !o && h.setDeletePlan(null)}
        onConfirm={h.handleDelete}
      />
    </div>
  );
}
