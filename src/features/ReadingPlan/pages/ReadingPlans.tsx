import { useNavigate } from "react-router-dom";
import Gate from "@/components/Gate";
import { PageLayout } from "@/components/PageLayout";
import { PageHeader } from "@/components/PageHeader";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { routes } from "@/components/Routes/routes";
import { useReadingPlansPage } from "../hooks/useReadingPlansPage";
import { ReadingPlanFilters } from "../components/ReadingPlanFilters";
import { ReadingPlanPagination } from "../components/ReadingPlanPagination";
import { CreatePlanButton, PlansGrid } from "../components";

const ReadingPlans = () => {
  const p = useReadingPlansPage();
  const navigate = useNavigate();

    return (
    <Gate tier="legacy_sower" featureName="Reading Plans" featureDescription="Track your daily Bible reading progress with personalized reading plans.">
      <PageLayout isRtl={p.isRtl} accentColor="teal">
        <PageHeader
          icon={null}
          title={p.pageTitle}
          subtitle={p.pageSubtitle}
          action={
            <CreatePlanButton
              label={p.createPlanLabel}
              onClick={() => navigate("/admin/plans/new")}
            />
          }
        />

        <ReadingPlanFilters
          search={p.search} setSearch={p.setSearch}
          catFilter={p.catFilter} setCatFilter={p.setCatFilter}
          t={p.t} isRtl={p.isRtl}
        />

        {p.loading ? (
          <LoadingState />
        ) : p.plans.length === 0 ? (
          <EmptyState
            title={p.noPlansTitle}
            message={p.noPlansDesc}
            actionLabel="Create Plan"
            onAction={() => navigate("/admin/plans/new")}
          />
        ) : (
          <>
            <PlansGrid
              plans={p.plans}
              isRtl={p.isRtl}
              t={p.t}
              onPress={(planId) => navigate(routes.readingPlanDetail.path.replace(":planId", planId))}
            />
            <ReadingPlanPagination
              page={p.page || 1} setPage={p.setPage || (() => {})}
              totalPages={p.totalPages || 1} hasNext={p.hasNext || false} hasPrevious={p.hasPrevious || false}
              t={p.t}
            />
          </>
        )}
      </PageLayout>
    </Gate>
  );
}
;

export default ReadingPlans;
