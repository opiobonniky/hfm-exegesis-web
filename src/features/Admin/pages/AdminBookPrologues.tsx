// AdminBookPrologues — thin page composing hook + components (no inline HTML)
"use client";

import { useNavigate } from "react-router-dom";
import { ScrollText } from "lucide-react";
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
  const { data, actions } = useAdminBookProloguesPage();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <AdminPageHeader
        title="Book Prologues Manager"
        subtitle={`${data.totalCount} prologues`}
        icon={<ScrollText className="w-5 h-5 text-primary" />}
        onBack={() => navigate("/admin")}
        onAdd={() => navigate("/admin/add-book-prologue")}
        addLabel="Add Prologue"
      />

      <AdminPageContent className="py-6">
        <AdminSearchBar
          value={data.search}
          onChange={actions.setSearch}
          onSearch={() => actions.refresh()}
          placeholder="Search by book name..."
        />

        {data.loading && data.items.length === 0 ? (
          <AdminLoadingGrid />
        ) : data.items.length === 0 ? (
          <AdminEmptyState
            icon={<ScrollText className="w-12 h-12" />}
            title="No prologues found"
            message={
              data.search
                ? "Try a different search term"
                : "Create your first book prologue"
            }
            onAction={!data.search ? () => navigate("/admin/add-book-prologue") : undefined}
          />
        ) : (
          <>
            <PrologueGrid
              items={data.items}
              loadingMore={data.loadingMore}
              hasMore={data.hasMore}
              sentinelRef={data.sentinelRef}
              onEdit={(item) =>
                navigate(
                  `/admin/edit-book-prologue/${encodeURIComponent(item.bookName)}`,
                )
              }
              onDelete={(item) => actions.setDeleteItem(item)}
              onView={(item) =>
                navigate(
                  `/admin/book-prologues/${encodeURIComponent(item.bookName)}`,
                )
              }
            />

          </>
        )}
      </AdminPageContent>

      <PrologueDeleteDialog
        open={!!data.deleteItem}
        bookName={data.deleteItem?.bookName || null}
        deleting={data.deleting === data.deleteItem?.bookName}
        onOpenChange={(o) => !o && actions.setDeleteItem(null)}
        onConfirm={actions.handleDelete}
      />
    </div>
  );
}
