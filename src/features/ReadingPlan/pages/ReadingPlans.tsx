import { useNavigate } from "react-router-dom";
import Gate from "@/components/Gate";
import { PageLayout } from "@/components/PageLayout";
import { PageHeader } from "@/components/PageHeader";
import { StatChips } from "@/components/StatChips";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { routes } from "@/components/Routes/routes";
import { useReadingPlansPage } from "../hooks/useReadingPlansPage";
import { ReadingPlanCard } from "../components/ReadingPlanCard";
import { ReadingPlanFilters } from "../components/ReadingPlanFilters";
import { ReadingPlanPagination } from "../components/ReadingPlanPagination";

const ReadingPlans = () => {
  const p = useReadingPlansPage();
  const navigate = useNavigate();

  return (
    <Gate tier="legacy_sower" featureName="Reading Plans" featureDescription="Track your daily Bible reading progress with personalized reading plans.">
      <PageLayout isRtl={p.isRtl} accentColor="teal">
        <PageHeader
          icon={null}
          title={p.t.readingPlan?.readingPlans || "Reading Plans"}
          subtitle={p.t.readingPlan?.buildHabit || "Build a daily Bible habit"}
          action={
            <Button onClick={() => navigate("/admin/plans/new")} className="gap-2">
              <Plus className="w-4 h-4" />{p.t.readingPlan?.createPlan || "Create Plan"}
            </Button>
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
            title={p.t.readingPlan?.noPlans || "No plans yet"}
            description={p.t.readingPlan?.noPlansDesc || "Create your first reading plan to get started."}
            action={
              <Button onClick={() => navigate("/admin/plans/new")} className="gap-2">
                <Plus className="w-4 h-4" />Create Plan
              </Button>
            }
          />
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {p.plans.map((plan) => (
                <ReadingPlanCard
                  key={plan.planId}
                  plan={plan}
                  isRtl={p.isRtl}
                  t={p.t}
                  onPress={() => navigate(routes.readingPlanDetail.path.replace(":planId", plan.planId))}
                />
              ))}
            </div>
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
};

export default ReadingPlans;
