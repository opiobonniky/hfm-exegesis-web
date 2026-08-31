"use client";

import { useState, useEffect, useCallback } from "react";
import { BookOpen, Search, Loader2, Plus, Edit2, Trash2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { sendPostRequest } from "@/services/api";
import { AdminPageHeader, AdminEmptyState, AdminLoadingGrid } from "../components";

interface ReadingPlan {
  id: number;
  title: string;
  description: string;
  category: string;
  durationDays: number;
  isPublished: boolean;
  createdOn: string;
}

const EMPTY_FORM = { title: "", description: "", category: "", durationDays: "7", isPublished: true };

export default function AdminReadingPlans() {
  const { toast } = useToast();
  const [plans, setPlans] = useState<ReadingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const [editPlan, setEditPlan] = useState<ReadingPlan | null>(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const [deletePlan, setDeletePlan] = useState<ReadingPlan | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadPlans = useCallback(async (pageNum: number, q: string, append = false) => {
    setLoading(true);
    try {
      const res = await sendPostRequest("readingPlan", "get-all", {
        page: pageNum, size: 20, search: q || undefined,
      });
      const data = res?.returnData;
      const items = data?.plans || data?.content || data || [];
      setPlans(prev => append ? [...prev, ...items] : items);
      setHasMore(items.length === 20);
    } catch {
      toast({ title: "Failed to load plans", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { loadPlans(0, search); }, []);

  const handleSearch = () => { setPage(0); loadPlans(0, search); };

  const openEdit = (plan?: ReadingPlan) => {
    if (plan) {
      setEditPlan(plan);
      setEditForm({
        title: plan.title, description: plan.description || "",
        category: plan.category || "", durationDays: String(plan.durationDays || 7),
        isPublished: plan.isPublished ?? true,
      });
    } else {
      setEditPlan(null);
      setEditForm(EMPTY_FORM);
    }
  };

  const handleSave = async () => {
    if (!editForm.title.trim()) return;
    setSaving(true);
    try {
      const payload = {
        ...editForm,
        durationDays: parseInt(editForm.durationDays) || 7,
        ...(editPlan ? { id: editPlan.id } : {}),
      };
      const res = await sendPostRequest("readingPlan", editPlan ? "update" : "create", payload);
      if (res.returnCode === 200) {
        toast({ title: editPlan ? "Updated" : "Created" });
        setEditPlan(null);
        setEditForm(EMPTY_FORM);
        loadPlans(0, search);
      }
    } catch {
      toast({ title: "Failed to save", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletePlan) return;
    setDeleting(true);
    try {
      const res = await sendPostRequest("readingPlan", "delete", { id: deletePlan.id });
      if (res.returnCode === 200) {
        setPlans(prev => prev.filter(p => p.id !== deletePlan.id));
        toast({ title: "Deleted" });
        setDeletePlan(null);
      }
    } catch {
      toast({ title: "Failed to delete", variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminPageHeader
        title="Reading Plans Manager"
        subtitle={`${plans.length} plans`}
        icon={<Calendar className="w-5 h-5 text-primary" />}
        onBack={() => window.history.back()}
        onAdd={() => openEdit()}
        addLabel="Add Plan"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search */}
        <div className="flex items-center gap-2 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search plans..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-9 h-9 text-sm"
            />
          </div>
          <Button size="sm" onClick={handleSearch} className="h-9 gap-1 text-xs">Search</Button>
        </div>

        {/* Plans list */}
        {loading && plans.length === 0 ? (
          <AdminLoadingGrid />
        ) : plans.length === 0 ? (
          <AdminEmptyState icon={<Calendar className="w-12 h-12" />} title="No reading plans found" message="Create your first reading plan" onAction={() => openEdit()} />
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {plans.map((plan) => (
                <div key={plan.id} className="rounded-xl border border-border bg-card p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-sm line-clamp-1">{plan.title}</h3>
                    <Badge variant={plan.isPublished ? "default" : "secondary"}>
                      {plan.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </div>
                  {plan.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{plan.description}</p>
                  )}
                  <div className="flex items-center gap-2 mb-3">
                    {plan.category && <Badge variant="outline" className="text-[10px]">{plan.category}</Badge>}
                    <span className="text-[10px] text-muted-foreground">{plan.durationDays} days</span>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(plan)} className="gap-1 h-7 text-xs">
                      <Edit2 className="w-3 h-3" /> Edit
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeletePlan(plan)} className="gap-1 h-7 text-xs text-destructive hover:text-destructive">
                      <Trash2 className="w-3 h-3" /> Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-6">
                <Button variant="outline" onClick={() => { const np = page + 1; setPage(np); loadPlans(np, search, true); }} disabled={loading} className="gap-2">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Load More
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit/Create dialog */}
      <Dialog open={!!editPlan || editForm.title !== ""} onOpenChange={(o) => { if (!o) { setEditPlan(null); setEditForm(EMPTY_FORM); } }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editPlan ? "Edit Reading Plan" : "Create Reading Plan"}</DialogTitle>
            <DialogDescription>{editPlan ? "Update the reading plan details" : "Create a new reading plan for users"}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">Title *</label>
              <Input placeholder="e.g., 30-Day Psalms Journey" value={editForm.title} onChange={(e) => setEditForm(p => ({ ...p, title: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">Description</label>
              <Textarea placeholder="Describe the reading plan..." value={editForm.description} onChange={(e) => setEditForm(p => ({ ...p, description: e.target.value }))} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Category</label>
                <Input placeholder="e.g., devotional" value={editForm.category} onChange={(e) => setEditForm(p => ({ ...p, category: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Duration (days)</label>
                <Input type="number" min="1" value={editForm.durationDays} onChange={(e) => setEditForm(p => ({ ...p, durationDays: e.target.value }))} />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setEditPlan(null); setEditForm(EMPTY_FORM); }}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !editForm.title.trim()} className="gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null} {editPlan ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete dialog */}
      <Dialog open={!!deletePlan} onOpenChange={(o) => !o && setDeletePlan(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Reading Plan</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Are you sure you want to delete &ldquo;{deletePlan?.title}&rdquo;? This action cannot be undone.</p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeletePlan(null)} disabled={deleting}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting} className="gap-2">
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
