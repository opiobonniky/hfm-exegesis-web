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
  const { data, actions } = useAdminDailyContent();
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <AdminDailyContentHeader />

      <Tabs value={data.activeTab} onValueChange={actions.handleTabChange}>
        <DailyContentFilters
          activeTab={data.activeTab}
          onTabChange={actions.handleTabChange}
          searchDate={data.searchDate}
          onSearchDateChange={actions.handleSearchDateChange}
          onClearDate={actions.handleClearDate}
          total={data.total}
        />

        <TabsContent value="verses" className="space-y-4">
          <ContentTabPanel
            tab="verses"
            total={data.total}
            searchDate={data.searchDate}
            onSearchDateChange={actions.handleSearchDateChange}
            onClearDate={actions.handleClearDate}
            onAdd={data.verses.handleAdd}
          >
            {data.loading ? (
              <ContentLoading />
            ) : data.content.length === 0 ? (
              <DailyContentEmptyState tab="verses" typeLabel={data.typeLabel} onAdd={data.verses.handleAdd} />
            ) : (
              <DailyContentGrid
                items={data.content}
                onView={data.verses.handleView}
                onEdit={data.verses.handleEdit}
                onDelete={actions.setDeleteTarget}
              />
            )}
            <PaginationControls
              page={data.page}
              total={data.total}
              pageSize={PAGE_SIZE}
              onPageChange={actions.setPage}
            />
          </ContentTabPanel>
        </TabsContent>

        <TabsContent value="devotions" className="space-y-4">
          <ContentTabPanel
            tab="devotions"
            total={data.total}
            searchDate={data.searchDate}
            onSearchDateChange={actions.handleSearchDateChange}
            onClearDate={actions.handleClearDate}
            onAdd={data.devotions.handleAdd}
          >
            {data.loading ? (
              <ContentLoading />
            ) : data.content.length === 0 ? (
              <DailyContentEmptyState tab="devotions" typeLabel={data.typeLabel} onAdd={data.devotions.handleAdd} />
            ) : (
              <DailyContentGrid
                items={data.content}
                onView={data.devotions.handleView}
                onEdit={data.devotions.handleEdit}
                onDelete={actions.setDeleteTarget}
              />
            )}
            <PaginationControls
              page={data.page}
              total={data.total}
              pageSize={PAGE_SIZE}
              onPageChange={actions.setPage}
            />
          </ContentTabPanel>
        </TabsContent>

        <TabsContent value="exegesis" className="space-y-4">
          <ContentTabPanel
            tab="exegesis"
            total={data.total}
            searchDate={data.searchDate}
            onSearchDateChange={actions.handleSearchDateChange}
            onClearDate={actions.handleClearDate}
            onAdd={data.exegesis.handleAdd}
          >
            {data.loading ? (
              <ContentLoading />
            ) : data.content.length === 0 ? (
              <DailyContentEmptyState tab="exegesis" typeLabel={data.typeLabel} onAdd={data.exegesis.handleAdd} />
            ) : (
              <DailyContentGrid
                items={data.content}
                onView={data.exegesis.handleView}
                onEdit={data.exegesis.handleEdit}
                onDelete={actions.setDeleteTarget}
              />
            )}
            <PaginationControls
              page={data.page}
              total={data.total}
              pageSize={PAGE_SIZE}
              onPageChange={actions.setPage}
            />
          </ContentTabPanel>
        </TabsContent>
      </Tabs>

      <AdminDeleteDialog
        open={!!data.deleteTarget}
        onOpenChange={actions.handleDeleteOpenChange}
        title={`Delete ${data.typeLabel}`}
        description="This action cannot be undone."
        deleting={data.deleting}
        onConfirm={actions.confirmDelete}
      />
    </div>
  );
};

export default AdminDailyContent;
