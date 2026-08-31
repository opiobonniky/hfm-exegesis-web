// AdminDailyContent — thin page composing hook + components (no inline HTML)
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useAdminDailyContent } from "../hooks/useAdminDailyContent";
import { PAGE_SIZE, DAILY_CONTENT_ADD_ROUTES, DAILY_CONTENT_VIEW_ROUTES } from "../constants";
import {
  DailyContentCard,
  DailyContentEmptyState,
  DailyContentFilters,
  ContentTabPanel,
  AdminDeleteDialog,
  ContentLoading,
} from "../components";
import { AdminDailyContentHeader } from "../components/AdminDailyContentHeader";
import { PaginationControls } from "../components/PaginationControls";

const AdminDailyContent = () => {
  const h = useAdminDailyContent();
  const navigate = useNavigate();

  const handleAdd = (tab: string) => {
    const path = DAILY_CONTENT_ADD_ROUTES[tab];
    if (path) navigate(path);
  };

  const handleEdit = (tab: string, item: any) => {
    const path = DAILY_CONTENT_ADD_ROUTES[tab];
    if (path) {
      const stateKey = tab === "verses" ? "verse" : tab === "devotions" ? "devotion" : "exegesis";
      navigate(path, { state: { [stateKey]: item } });
    }
  };

  const handleView = (tab: string, item: any) => {
    const basePath = DAILY_CONTENT_VIEW_ROUTES[tab];
    if (basePath) {
      const paramKey = tab === "verses" ? "verse" : tab === "devotions" ? "devotion" : "exegesis";
      navigate(`${basePath}?${paramKey}=${encodeURIComponent(JSON.stringify(item))}`);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <AdminDailyContentHeader />

      <Tabs value={h.activeTab} onValueChange={(v) => { h.setActiveTab(v); h.setPage(0); }}>
        <DailyContentFilters
          activeTab={h.activeTab}
          onTabChange={(v) => { h.setActiveTab(v); h.setPage(0); }}
          searchDate={h.searchDate}
          onSearchDateChange={(v) => { h.setSearchDate(v); h.setPage(0); }}
          onClearDate={() => { h.setSearchDate(""); h.setPage(0); }}
          total={h.total}
        />

        {["verses", "devotions", "exegesis"].map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-4">
            <ContentTabPanel
              tab={tab}
              total={h.total}
              searchDate={h.searchDate}
              onSearchDateChange={(v) => { h.setSearchDate(v); h.setPage(0); }}
              onClearDate={() => { h.setSearchDate(""); h.setPage(0); }}
              onAdd={() => handleAdd(tab)}
            >
              {h.loading ? (
                <ContentLoading />
              ) : h.content.length === 0 ? (
                <DailyContentEmptyState tab={tab} typeLabel={h.typeLabel} onAdd={() => handleAdd(tab)} />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {h.content.map((item) => (
                    <DailyContentCard
                      key={item.id}
                      item={item}
                      onView={() => handleView(tab, item)}
                      onEdit={(i) => handleEdit(tab, i)}
                      onDelete={(i) => h.setDeleteTarget(i)}
                    />
                  ))}
                </div>
              )}
              <PaginationControls
                page={h.page}
                total={h.total}
                pageSize={PAGE_SIZE}
                onPageChange={h.setPage}
              />
            </ContentTabPanel>
          </TabsContent>
        ))}
      </Tabs>

      <AdminDeleteDialog
        open={!!h.deleteTarget}
        onOpenChange={(o) => !o && h.setDeleteTarget(null)}
        title={`Delete ${h.typeLabel}`}
        description="This action cannot be undone."
        deleting={h.deleting}
        onConfirm={h.confirmDelete}
      />
    </div>
  );
};

export default AdminDailyContent;
