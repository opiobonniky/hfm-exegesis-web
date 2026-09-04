// AdminBookPrologues — thin page composing hook + components (no inline HTML)
"use client";

import { useNavigate } from "react-router-dom";
import { ScrollText } from "lucide-react";
import { PaginationControls } from "../components/PaginationControls";
import { useAdminBookProloguesPage } from "../hooks/useAdminBookProloguesPage";
import {
  AdminPageHeader,
  AdminEmptyState,
  AdminLoadingGrid,
  AdminSearchBar,
  AdminPageContent,
} from "../components";
import { PrologueGrid } from "../components/PrologueGrid";
import { PrologueDeleteDialog } from "../components/PrologueDeleteDialog";

export default function AdminBookPrologues() {
  const h = useAdminBookProloguesPage();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <AdminPageHeader
        title="Book Prologues Manager"
        subtitle={`${h.totalCount} prologues`}
        icon={<ScrollText className="w-5 h-5 text-primary" />}
        onBack={() => navigate("/admin")}
        onAdd={() => navigate("/admin/add-book-prologue")}
        addLabel="Add Prologue"
      />

      <AdminPageContent className="py-6">
        <AdminSearchBar
          value={h.search}
          onChange={h.setSearch}
          onSearch={() => {}}
          placeholder="Search by book name..."
        />

        {h.loading && h.items.length === 0 ? (
          <AdminLoadingGrid />
        ) : h.items.length === 0 ? (
          <AdminEmptyState
            icon={<ScrollText className="w-12 h-12" />}
            title="No prologues found"
            message={
              h.search
                ? "Try a different search term"
                : "Create your first book prologue"
            }
            onAction={!h.search ? () => navigate("/admin/add-book-prologue") : undefined}
          />
        ) : (
          <>
            <PrologueGrid
              items={h.items}
              loadingMore={false}
              hasMore={h.hasMore}
              sentinelRef={h.sentinelRef}
              onEdit={(item) =>
                navigate(
                  `/admin/edit-book-prologue/${encodeURIComponent(item.bookName)}`,
                )
              }
              onDelete={(item) => h.setDeleteItem(item)}
              onView={(item) =>
                navigate(
                  `/admin/book-prologues/${encodeURIComponent(item.bookName)}`,
                )
              }
            />

            <PaginationControls
              page={h.currentPage}
              total={h.totalCount}
              pageSize={12}
              onPageChange={h.setPage}
            />
          </>
        )}
      </AdminPageContent>

      <PrologueDeleteDialog
        open={!!h.deleteItem}
        bookName={h.deleteItem?.bookName || null}
        deleting={h.deleting === h.deleteItem?.bookName}
        onOpenChange={(o) => !o && h.setDeleteItem(null)}
        onConfirm={h.handleDelete}
      />
    </div>
  );
}
