// AdminDailyContent — thin page composing hook + components (no inline HTML)
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useAdminDailyContent } from "../hooks/useAdminDailyContent";
import { PAGE_SIZE } from "../constants";
import {
  DailyContentEmptyState,
  DailyContentFilters,
  ContentTabPanel,
  AdminDeleteDialog,
  ContentLoading,
} from "../components";
import { DailyContentGrid } from "../components/DailyContentGrid";
import { AdminDailyContentHeader } from "../components/AdminDailyContentHeader";
import { PaginationControls } from "../components/PaginationControls";

const AdminDailyContent = () => {
  const h = useAdminDailyContent();

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <AdminDailyContentHeader />

      <Tabs value={h.activeTab} onValueChange={h.handleTabChange}>
        <DailyContentFilters
          activeTab={h.activeTab}
          onTabChange={h.handleTabChange}
          searchDate={h.searchDate}
          onSearchDateChange={h.handleSearchDateChange}
          onClearDate={h.handleClearDate}
          total={h.total}
        />

        <TabsContent value="verses" className="space-y-4">
          <ContentTabPanel
            tab="verses"
            total={h.total}
            searchDate={h.searchDate}
            onSearchDateChange={h.handleSearchDateChange}
            onClearDate={h.handleClearDate}
            onAdd={h.verses.handleAdd}
          >
            {h.loading ? (
              <ContentLoading />
            ) : h.content.length === 0 ? (
              <DailyContentEmptyState tab="verses" typeLabel={h.typeLabel} onAdd={h.verses.handleAdd} />
            ) : (
              <DailyContentGrid
                items={h.content}
                onView={h.verses.handleView}
                onEdit={h.verses.handleEdit}
                onDelete={h.setDeleteTarget}
              />
            )}
            <PaginationControls
              page={h.page}
              total={h.total}
              pageSize={PAGE_SIZE}
              onPageChange={h.setPage}
            />
          </ContentTabPanel>
        </TabsContent>

        <TabsContent value="devotions" className="space-y-4">
          <ContentTabPanel
            tab="devotions"
            total={h.total}
            searchDate={h.searchDate}
            onSearchDateChange={h.handleSearchDateChange}
            onClearDate={h.handleClearDate}
            onAdd={h.devotions.handleAdd}
          >
            {h.loading ? (
              <ContentLoading />
            ) : h.content.length === 0 ? (
              <DailyContentEmptyState tab="devotions" typeLabel={h.typeLabel} onAdd={h.devotions.handleAdd} />
            ) : (
              <DailyContentGrid
                items={h.content}
                onView={h.devotions.handleView}
                onEdit={h.devotions.handleEdit}
                onDelete={h.setDeleteTarget}
              />
            )}
            <PaginationControls
              page={h.page}
              total={h.total}
              pageSize={PAGE_SIZE}
              onPageChange={h.setPage}
            />
          </ContentTabPanel>
        </TabsContent>

        <TabsContent value="exegesis" className="space-y-4">
          <ContentTabPanel
            tab="exegesis"
            total={h.total}
            searchDate={h.searchDate}
            onSearchDateChange={h.handleSearchDateChange}
            onClearDate={h.handleClearDate}
            onAdd={h.exegesis.handleAdd}
          >
            {h.loading ? (
              <ContentLoading />
            ) : h.content.length === 0 ? (
              <DailyContentEmptyState tab="exegesis" typeLabel={h.typeLabel} onAdd={h.exegesis.handleAdd} />
            ) : (
              <DailyContentGrid
                items={h.content}
                onView={h.exegesis.handleView}
                onEdit={h.exegesis.handleEdit}
                onDelete={h.setDeleteTarget}
              />
            )}
            <PaginationControls
              page={h.page}
              total={h.total}
              pageSize={PAGE_SIZE}
              onPageChange={h.setPage}
            />
          </ContentTabPanel>
        </TabsContent>
      </Tabs>

      <AdminDeleteDialog
        open={!!h.deleteTarget}
        onOpenChange={h.handleDeleteOpenChange}
        title={`Delete ${h.typeLabel}`}
        description="This action cannot be undone."
        deleting={h.deleting}
        onConfirm={h.confirmDelete}
      />
    </div>
  );
};

export default AdminDailyContent;
