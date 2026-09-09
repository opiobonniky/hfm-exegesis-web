import Gate from "@/components/Gate";
import { PageLayout } from "@/components/PageLayout";
import { PageHeader } from "@/components/PageHeader";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { routes } from "@/components/Routes/routes";
import { useReadingPlansPage } from "../hooks/useReadingPlansPage";
import { ReadingPlanFilters } from "../components/ReadingPlanFilters";
import { ReadingPlanPagination } from "../components/ReadingPlanPagination";
import { CreatePlanButton, DeletePlanModal, PlansGrid } from "../components";

export default function ReadingPlans() {
  const { data, actions } = useReadingPlansPage();

  return (
    <Gate tier="legacy_sower" featureName="Reading Plans" featureDescription="Track your daily Bible reading progress with personalized reading plans.">
      <PageLayout isRtl={data.isRtl} accentColor="teal">
        <PageHeader
          icon={null}
          title={data.pageTitle}
          subtitle={data.pageSubtitle}
          action={
            <CreatePlanButton
              label={data.createPlanLabel}
              onClick={() => data.navigate(routes.addReadingPlan.path)}
            />
          }
        />

        <ReadingPlanFilters
          search={data.search} setSearch={actions.setSearch}
          catFilter={data.catFilter} setCatFilter={actions.setCatFilter}
          t={data.t} isRtl={data.isRtl}
        />

        {data.loading ? (
          <LoadingState />
        ) : data.plans.length === 0 ? (
          <EmptyState
            title={data.noPlansTitle}
            message={data.noPlansDesc}
            actionLabel="Create Plan"
            onAction={() => data.navigate("/admin/plans/new")}
          />
        ) : (
          <>
            <PlansGrid
              plans={data.plans}
              isRtl={data.isRtl}
              t={data.t}
              onPress={(planId) => data.navigate(routes.readingPlanDetail.path.replace(":planId", planId))}
              onDelete={actions.setDeleteTarget}
            />
            <ReadingPlanPagination
              page={data.page || 1} setPage={actions.setPage || (() => {})}
              totalPages={data.totalPages || 1} hasNext={data.hasNext || false} hasPrevious={data.hasPrevious || false}
              t={data.t}
            />
          </>
        )}
        <DeletePlanModal
          visible={!!data.deleteTarget}
          plan={data.deleteTarget}
          confirmationText={data.deleteConfirmText}
          deleting={data.deleting}
          onConfirmationTextChange={actions.setDeleteConfirmText}
          onConfirm={actions.handleDelete}
          onClose={() => {
            actions.setDeleteTarget(null);
            actions.setDeleteConfirmText("");
          }}
        />
      </PageLayout>
    </Gate>
  );
}
