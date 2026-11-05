import { useState } from "react";
import { Globe, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { tt } from "@/components/languages/hardcodedTranslate";
import { useJournalDetail } from "../hooks/useJournalDetail";
import JournalDetailBody from "../components/JournalDetailBody";
import JournalDetailDeleteDialog from "../components/JournalDetailDeleteDialog";
import JournalDetailLoadingSkeleton from "../components/JournalDetailLoadingSkeleton";
import JournalDetailTopBar from "../components/JournalDetailTopBar";
import JournalDetailWordSheet from "../components/JournalDetailWordSheet";
import { JournalActionDialog, type JournalAction } from "../components/JournalActionDialog";

export default function JournalDetailPage() {
  const { data: p, actions: a } = useJournalDetail();
  const [action, setAction] = useState<JournalAction | null>(null);
  return <div className="min-h-full bg-background" dir={p.isRtl ? "rtl" : "ltr"}>
    <JournalDetailTopBar isOwner={p.isOwner} isFavorite={!!p.entry?.isFavorite} copied={p.copied} exporting={p.exporting} updatingFavorite={p.updatingFavorite} disabled={!p.entry}
      onBack={a.goBack} onToggleFavorite={a.handleToggleFavorite} onShare={() => p.entry && setAction({ kind: "share", entries: [p.entry] })} onExportPdf={() => p.entry && setAction({ kind: "pdf", entries: [p.entry] })} onCopy={a.handleCopy} onEdit={a.handleEdit} onDelete={a.openDeleteDialog} />
    {!p.entry ? p.loading ? <JournalDetailLoadingSkeleton /> : <div className="mx-auto max-w-2xl p-6 text-muted-foreground">{tt("Entry could not be loaded. Go back to Journal and try again.")}</div> : <>
      <JournalDetailBody entry={p.entry} t={p.t} category={p.catMeta} mood={p.moodInfo} tags={p.tagsArray} reflectionSections={p.reflectionSections} formatDate={a.formatDate} formatDateShort={a.formatDateShort} />
      {p.isOwner && <div className="mx-auto max-w-2xl px-5 pb-5"><Button variant="outline" disabled={p.updatingPublished} onClick={a.handleTogglePublished} className="max-w-full gap-2 text-[clamp(0.65rem,2vw,0.875rem)]"><span className="shrink-0">{p.updatingPublished ? <Loader2 className="size-4 animate-spin" /> : p.entry.isPublished ? <Lock className="size-4" /> : <Globe className="size-4" />}</span><span className="min-w-0 truncate">{tt(p.entry.isPublished ? "Make private" : "Share publicly")}</span></Button></div>}
      <JournalDetailDeleteDialog open={p.showDeleteDialog} title={p.entry.title} deleting={p.deleting} onOpenChange={a.handleDeleteDialogChange} onCancel={a.closeDeleteDialog} onDelete={a.handleDelete} />
    </>}
    <JournalActionDialog action={action} onClose={() => setAction(null)} />
    <JournalDetailWordSheet open={p.studiedWordSheetOpen} selectedWord={p.selectedStudiedWord} onOpenChange={a.handleStudiedWordSheetChange} />
  </div>;
}
