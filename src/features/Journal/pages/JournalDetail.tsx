import { useJournalDetail } from "../hooks/useJournalDetail";
import JournalDetailBody from "../components/JournalDetailBody";
import JournalDetailDeleteDialog from "../components/JournalDetailDeleteDialog";
import JournalDetailLoadingSkeleton from "../components/JournalDetailLoadingSkeleton";
import JournalDetailTopBar from "../components/JournalDetailTopBar";
import JournalDetailWordSheet from "../components/JournalDetailWordSheet";

export default function JournalDetailPage() {
  const { data, actions } = useJournalDetail();

  if (data.loading) return <JournalDetailLoadingSkeleton />;


  return (
    <div className="min-h-full bg-amber-50/30 dark:bg-stone-950" dir={data.isRtl ? "rtl" : "ltr"}>
      <JournalDetailTopBar
        isOwner={data.isOwner}
        isFavorite={data.entry.isFavorite}
        copied={data.copied}
        exporting={data.exporting}
        updatingFavorite={data.updatingFavorite}
        onBack={actions.goBack}
        onToggleFavorite={actions.handleToggleFavorite}
        onShare={actions.handleShare}
        onExportPdf={actions.handleExportPdf}
        onCopy={actions.handleCopy}
        onEdit={actions.handleEdit}
        onDelete={actions.openDeleteDialog}
      />

      <JournalDetailBody
        entry={data.entry}
        t={data.t}
        category={data.catMeta}
        mood={data.moodInfo}
        tags={data.tagsArray}
        reflectionSections={data.reflectionSections}
        formatDate={actions.formatDate}
        formatDateShort={actions.formatDateShort}
      />

      <JournalDetailDeleteDialog
        open={data.showDeleteDialog}
        title={data.entry.title}
        deleting={data.deleting}
        onOpenChange={actions.handleDeleteDialogChange}
        onCancel={actions.closeDeleteDialog}
        onDelete={actions.handleDelete}
      />

      <JournalDetailWordSheet
        open={data.studiedWordSheetOpen}
        selectedWord={data.selectedStudiedWord}
        onOpenChange={actions.handleStudiedWordSheetChange}
      />
    </div>
  );
}
