import { useJournalDetail } from "../hooks/useJournalDetail";
import JournalDetailBody from "../components/JournalDetailBody";
import JournalDetailDeleteDialog from "../components/JournalDetailDeleteDialog";
import JournalDetailLoadingSkeleton from "../components/JournalDetailLoadingSkeleton";
import JournalDetailTopBar from "../components/JournalDetailTopBar";
import JournalDetailWordSheet from "../components/JournalDetailWordSheet";

export default function JournalDetailPage() {
  const p = useJournalDetail();

  if (p.loading) return <JournalDetailLoadingSkeleton />;
  if (!p.entry) return null;

  return (
    <div className="min-h-full bg-amber-50/30 dark:bg-stone-950" dir={p.isRtl ? "rtl" : "ltr"}>
      <JournalDetailTopBar
        isOwner={p.isOwner}
        isFavorite={p.entry.isFavorite}
        copied={p.copied}
        exporting={p.exporting}
        updatingFavorite={p.updatingFavorite}
        onBack={p.goBack}
        onToggleFavorite={p.handleToggleFavorite}
        onShare={p.handleShare}
        onExportPdf={p.handleExportPdf}
        onCopy={p.handleCopy}
        onEdit={p.handleEdit}
        onDelete={p.openDeleteDialog}
      />

      <JournalDetailBody
        entry={p.entry}
        t={p.t}
        category={p.catMeta}
        mood={p.moodInfo}
        tags={p.tagsArray}
        reflectionSections={p.reflectionSections}
        formatDate={p.formatDate}
        formatDateShort={p.formatDateShort}
      />

      <JournalDetailDeleteDialog
        open={p.showDeleteDialog}
        title={p.entry.title}
        deleting={p.deleting}
        onOpenChange={p.handleDeleteDialogChange}
        onCancel={p.closeDeleteDialog}
        onDelete={p.handleDelete}
      />

      <JournalDetailWordSheet
        open={p.studiedWordSheetOpen}
        selectedWord={p.selectedStudiedWord}
        onOpenChange={p.handleStudiedWordSheetChange}
      />
    </div>
  );
}
