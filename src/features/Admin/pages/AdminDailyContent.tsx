// AdminDailyContent — thin page composing hooks + components
import { CalendarDays } from "lucide-react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useAdminDailyContent } from "../hooks/useAdminDailyContent";
import { PAGE_SIZE } from "../constants";
import {
  ConflictDialog,
  DailyContentCard, DailyContentEmptyState,
  DailyContentFilters, ContentTabPanel, AdminDeleteDialog,
  ContentLoading, DailyVerseForm, DailyDevotionForm, DailyExegesisForm,
} from "../components";
import { useLanguage } from "@/components/languages/languageProvider";

// ── Main page ─────────────────────────────────────────────────────────────────
const AdminDailyContent = () => {
  const h = useAdminDailyContent();
  const { isRtl } = useLanguage();

  // Render form view if in form mode
  if (h.formMode === "verse") return <><DailyVerseForm h={h} /><ConflictDialog open={h.conflictDialog.open} onOpenChange={o => h.setConflictDialog({ open: o, data: null, payload: null })} contentType={h.formMode} data={h.conflictDialog.data} saving={h.saving} onResolve={h.handleConflictUpdate} /></>;
  if (h.formMode === "devotion") return <><DailyDevotionForm h={h} /><ConflictDialog open={h.conflictDialog.open} onOpenChange={o => h.setConflictDialog({ open: o, data: null, payload: null })} contentType={h.formMode} data={h.conflictDialog.data} saving={h.saving} onResolve={h.handleConflictUpdate} /></>;
  if (h.formMode === "exegesis") return <><DailyExegesisForm h={h} /><ConflictDialog open={h.conflictDialog.open} onOpenChange={o => h.setConflictDialog({ open: o, data: null, payload: null })} contentType={h.formMode} data={h.conflictDialog.data} saving={h.saving} onResolve={h.handleConflictUpdate} /></>;

  // List view
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6" dir={isRtl ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/[0.04] via-background to-background border-b border-border/50 -mx-4 sm:-mx-6 lg:-mx-8 -mt-4 sm:-mt-6 lg:-mt-8 px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8 pb-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <CalendarDays className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Daily Content Manager</h1>
            <p className="text-sm text-muted-foreground/80">Manage daily verses, devotions, and exegesis content</p>
          </div>
        </div>
      </div>

      {/* Tabs + content */}
      <Tabs value={h.activeTab} onValueChange={v => { h.setActiveTab(v); h.setPage(0); }}>
      <DailyContentFilters activeTab={h.activeTab} onTabChange={v => { h.setActiveTab(v); h.setPage(0); }}
        searchDate={h.searchDate} onSearchDateChange={v => { h.setSearchDate(v); h.setPage(0); }}
        onClearDate={() => { h.setSearchDate(""); h.setPage(0); }} total={h.total} />

      {["verses", "devotions", "exegesis"].map(tab => (
        <TabsContent key={tab} value={tab} className="space-y-4">
          <ContentTabPanel tab={tab} total={h.total} searchDate={h.searchDate}
            onSearchDateChange={v => { h.setSearchDate(v); h.setPage(0); }}
            onClearDate={() => { h.setSearchDate(""); h.setPage(0); }}
            onAdd={() => h.openForm(tab === "verses" ? "verse" : tab === "devotions" ? "devotion" : "exegesis")}>
            {h.loading ? <ContentLoading /> : h.content.length === 0 ? (
              <DailyContentEmptyState tab={tab} typeLabel={h.typeLabel}
                onAdd={() => h.openForm(tab === "verses" ? "verse" : tab === "devotions" ? "devotion" : "exegesis")} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {h.content.map(item => (
                  <DailyContentCard key={item.id} item={item}
                    onEdit={i => h.openForm(tab === "verses" ? "verse" : tab === "devotions" ? "devotion" : "exegesis", i)}
                    onDelete={i => h.setDeleteTarget(i)} />
                ))}
              </div>
            )}
            {h.total > PAGE_SIZE && (
              <div className="flex items-center justify-between pt-4 border-t border-border/40 mt-4">
                <p className="text-xs text-muted-foreground">Page {h.page + 1} of {Math.ceil(h.total / PAGE_SIZE)}</p>
                <div className="flex gap-1">
                  <button onClick={() => h.setPage(p => p - 1)} disabled={h.page === 0} className="h-7 w-7 rounded-md border border-input bg-background text-xs disabled:opacity-50">←</button>
                  <button onClick={() => h.setPage(p => p + 1)} disabled={(h.page + 1) * PAGE_SIZE >= h.total} className="h-7 w-7 rounded-md border border-input bg-background text-xs disabled:opacity-50">→</button>
                </div>
              </div>
            )}
          </ContentTabPanel>
        </TabsContent>
      ))}
      </Tabs>

      {/* Delete dialog */}
      <AdminDeleteDialog open={!!h.deleteTarget} onOpenChange={o => !o && h.setDeleteTarget(null)}
        title={`Delete ${h.typeLabel}`} description="This action cannot be undone."
        deleting={h.deleting} onConfirm={h.confirmDelete} />
    </div>
  );
};

export default AdminDailyContent;
