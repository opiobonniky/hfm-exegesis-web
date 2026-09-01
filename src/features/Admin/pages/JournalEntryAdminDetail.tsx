// JournalEntryAdminDetail — thin page composing hook + components (no inline HTML)
"use client";

import { BookOpen } from "lucide-react";
import { useJournalEntryAdminDetail } from "../hooks/useJournalEntryAdminDetail";
import { DetailLoading, DetailPageHeader, DetailContent, DetailBackButton } from "../components/DetailPageLayout";
import { DetailMetadataGrid } from "../components/DetailSection";
import { JournalDetailContent, JournalDetailHeader } from "../components/JournalDetailContent";
import { AdminDeleteDialog } from "../components/AdminDeleteDialog";

export default function JournalEntryAdminDetail() {
  const h = useJournalEntryAdminDetail();

  if (h.loading) return <DetailLoading />;
  if (!h.item) return null;

  return (
    <div className="min-h-screen bg-background">
      <DetailPageHeader
        icon={<BookOpen className="w-5 h-5 text-primary" />}
        title="Journal Entry"
        subtitle={`by user ${h.item.userId?.slice(0, 8)}…`}
        onBack={() => h.navigate("/admin/journal-moderation")}
        actions={
          <JournalDetailHeader
            userId={h.item.userId}
            isPublished={h.item.isPublished}
            onTogglePublication={h.handleTogglePublication}
            onDelete={() => h.setConfirmDelete(true)}
          />
        }
      />

      <DetailContent>
        <JournalDetailContent item={h.item} />

        <DetailMetadataGrid
          fields={[
            { label: "Created", value: h.item.createdOn, format: "datetime" },
            { label: "Updated", value: h.item.updatedOn, format: "datetime" },
          ]}
        />

        <DetailBackButton label="Back to Journal" onClick={() => h.navigate("/admin/journal-moderation")} />
      </DetailContent>

      <AdminDeleteDialog
        open={h.confirmDelete}
        onOpenChange={h.setConfirmDelete}
        title="Delete Journal Entry"
        description={`Are you sure you want to delete "${h.item.title}"? This action cannot be undone.`}
        deleting={h.deleting}
        onConfirm={() => {
          h.setConfirmDelete(false);
          h.handleDelete();
        }}
      />
    </div>
  );
}
