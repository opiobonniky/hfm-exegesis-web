// AdminReadingPlans — thin page composing hook + components
"use client";

import { Calendar, Search, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { useAdminReadingPlans } from "../hooks/useAdminReadingPlans";
import {
  AdminPageHeader,
  AdminEmptyState,
  AdminLoadingGrid,
} from "../components";
import { ReadingPlanCard } from "../components/ReadingPlanCard";

export default function AdminReadingPlans() {
  const h = useAdminReadingPlans();
  const navigate = useNavigate();

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

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6">
        {/* Search */}
        <div className="flex items-center gap-2 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search plans..."
              value={h.search}
              onChange={(e) => h.setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && h.handleSearch()}
              className="pl-9 h-9 text-sm"
            />
          </div>
          <Button
            size="sm"
            onClick={h.handleSearch}
            className="h-9 gap-1 text-xs"
          >
            Search
          </Button>
        </div>

        {/* Plans list */}
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
          <>
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {h.plans.map((plan) => (
                <ReadingPlanCard
                  key={plan.id}
                  plan={plan}
                  onEdit={() => h.openEdit(plan)}
                  onDelete={() => h.setDeletePlan(plan)}
                  onView={() => navigate(`/admin/reading-plans/${encodeURIComponent(plan.planId || String(plan.id))}`)}
                />
              ))}
            </div>

                        {/* Infinite scroll sentinel */}
            <div ref={h.sentinelRef} className="h-4" />
            {h.loadingMore && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            )}
            {!h.hasMore && h.items.length > 0 && (
              <p className="text-center text-xs text-muted-foreground/50 py-4">
                All items loaded
              </p>
            )}
          </>
        )}
      </div>

      {/* Edit/Create dialog */}
      <Dialog
        open={!!h.editPlan || h.editForm.title !== ""}
        onOpenChange={(o) => !o && h.closeEdit()}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {h.editPlan ? "Edit Reading Plan" : "Create Reading Plan"}
            </DialogTitle>
            <DialogDescription>
              {h.editPlan
                ? "Update the reading plan details"
                : "Create a new reading plan for users"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Title *</Label>
              <Input
                placeholder="e.g., 30-Day Psalms Journey"
                value={h.editForm.title}
                onChange={(e) => h.updateFormField("title", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Description</Label>
              <Textarea
                placeholder="Describe the reading plan..."
                value={h.editForm.description}
                onChange={(e) =>
                  h.updateFormField("description", e.target.value)
                }
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Category</Label>
                <Input
                  placeholder="e.g., devotional"
                  value={h.editForm.category}
                  onChange={(e) =>
                    h.updateFormField("category", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold">
                  Duration (days)
                </Label>
                <Input
                  type="number"
                  min="1"
                  value={h.editForm.durationDays}
                  onChange={(e) =>
                    h.updateFormField("durationDays", e.target.value)
                  }
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-xs font-semibold">Published</Label>
                <p className="text-xs text-muted-foreground">
                  Make this plan visible to users
                </p>
              </div>
              <Switch
                checked={h.editForm.isPublished}
                onCheckedChange={(c) => h.updateFormField("isPublished", c)}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={h.closeEdit}>
              Cancel
            </Button>
            <Button
              onClick={h.handleSave}
              disabled={h.saving || !h.editForm.title.trim()}
              className="gap-2"
            >
              {h.saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : null}{" "}
              {h.editPlan ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete dialog */}
      <Dialog
        open={!!h.deletePlan}
        onOpenChange={(o) => !o && h.setDeletePlan(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Reading Plan</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete &ldquo;{h.deletePlan?.title}
            &rdquo;? This action cannot be undone.
          </p>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => h.setDeletePlan(null)}
              disabled={h.deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={h.handleDelete}
              disabled={h.deleting}
              className="gap-2"
            >
              {h.deleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}{" "}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
