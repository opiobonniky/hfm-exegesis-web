// JournalEntryAdminDetail — thin page composing hook + components (no inline HTML)
"use client";

import { BookOpen } from "lucide-react";
import { useJournalEntryAdminDetail } from "../hooks/useJournalEntryAdminDetail";
import { DetailLoading, DetailPageHeader, DetailContent, DetailBackButton } from "../components/DetailPageLayout";
import { DetailMetadataGrid } from "../components/DetailSection";
import { JournalDetailContent, JournalDetailHeader } from "../components/JournalDetailContent";
import { AdminDeleteDialog } from "../components/AdminDeleteDialog";

export default function JournalEntryAdminDetail() {
  const { data, actions } = useJournalEntryAdminDetail();
  if (data.loading) return <DetailLoading />;
  if (!data.item) return null;

  return (
    <div className="min-h-screen bg-background">
      <DetailPageHeader
        icon={<BookOpen className="w-5 h-5 text-primary" />}
        title="Journal Entry"
        subtitle={`by user ${data.item.userId?.slice(0, 8)}…`}
        onBack={() => actions.navigate("/admin/journal-moderation")}
        actions={
          <JournalDetailHeader
            userId={data.item.userId}
            isPublished={data.item.isPublished}
            onTogglePublication={actions.handleTogglePublication}
            onDelete={() => actions.setConfirmDelete(true)}
          />
        }
      />

      <DetailContent>
        <JournalDetailContent item={data.item} />

        <DetailMetadataGrid
          fields={[
            { label: "Created", value: data.item.createdOn, format: "datetime" },
            { label: "Updated", value: data.item.updatedOn, format: "datetime" },
          ]}
        />

        <DetailBackButton label="Back to Journal" onClick={() => actions.navigate("/admin/journal-moderation")} />
      </DetailContent>

      <AdminDeleteDialog
        open={data.confirmDelete}
        onOpenChange={actions.setConfirmDelete}
        title="Delete Journal Entry"
        description={`Are you sure you want to delete "${data.item.title}"? This action cannot be undone.`}
        deleting={data.deleting}
        onConfirm={() => {
          actions.setConfirmDelete(false);
          actions.handleDelete();
        }}
      />
    </div>
  );
}
