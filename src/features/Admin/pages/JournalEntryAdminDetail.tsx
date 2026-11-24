// JournalEntryAdminDetail — thin page composing hook + components (no inline HTML)
"use client";

import { useJournalEntryAdminDetail } from "../hooks/useJournalEntryAdminDetail";
import JournalEntryDetailHeader from "../components/JournalEntryDetailHeader";
import { JournalDetailContent } from "../components/JournalDetailContent";
import { AdminDeleteDialog } from "../components/AdminDeleteDialog";
import BookOverviewLoading from "../../Bible/components/BookOverviewLoading";
import BookOverviewEmpty from "../../Bible/components/BookOverviewEmpty";
import { tt } from '@/components/languages/hardcodedTranslate';
import '../../Bible/theme/bookOverview.css';

export default function JournalEntryAdminDetail() {
  const { data, actions } = useJournalEntryAdminDetail();

  return (
    <div className="book-prologue-view consumer-book-overview h-full flex flex-col">
      <JournalEntryDetailHeader
        userId={data.item?.userId}
        isPublished={data.item?.isPublished !== false}
        onBack={() => actions.navigate("/admin/journal-moderation")}
        onTogglePublication={actions.handleTogglePublication}
        onDelete={() => actions.setConfirmDelete(true)}
      />

      <main className="flex-1 min-h-0 overflow-y-auto">
        {data.loading ? (
          <BookOverviewLoading />
        ) : data.item ? (
          <JournalDetailContent item={data.item} />
        ) : (
          <BookOverviewEmpty />
        )}
      </main>

      <AdminDeleteDialog
        open={data.confirmDelete}
        onOpenChange={actions.setConfirmDelete}
        title={tt("Delete Journal Entry")}
        description={`Are you sure you want to delete "${data.item?.title ?? ""}"? This action cannot be undone.`}
        deleting={data.deleting}
        onConfirm={() => {
          actions.setConfirmDelete(false);
          actions.handleDelete();
        }}
      />
    </div>
  );
}
