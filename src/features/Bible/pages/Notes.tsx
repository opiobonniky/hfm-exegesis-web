// Notes — standalone page for viewing and managing verse notes
"use client";

import { useNotesPage } from "../hooks/useNotesPage";
import { BiblePageLayout } from "../components/BiblePageLayout";
import { EditNoteDialog } from "../components/EditNoteDialog";
import { NotesList } from "../components";

export default function Notes() {
  const h = useNotesPage();

  return (
    <>
      <BiblePageLayout
        title="My Notes"
        count={h.notes.length}
        contentCount={h.filtered.length}
        isRtl={h.isRtl}
        searchQuery={h.searchQuery}
        onSearchChange={h.setSearchQuery}
        filterBook={h.filterBook}
        onFilterBookChange={h.setFilterBook}
        loading={h.loading}
        onRefresh={h.refresh}
        searchPlaceholder="Search notes by verse or content..."
        emptyTitle="No notes yet"
        emptyMessage="Add notes to verses while reading to see them here"
      >
        <NotesList
          grouped={h.grouped}
          verseTextMap={h.verseTextMap}
          deleting={h.deleting}
          onGoToReader={h.goToReader}
          onEdit={h.openEdit}
          onDelete={h.deleteNote}
          formatDate={h.formatDate}
        />
      </BiblePageLayout>

      <EditNoteDialog
        open={!!h.editingNote}
        mode="edit"
        verseRef={h.editingNote
          ? `${h.editingNote.bookName} ${h.editingNote.chapter}:${h.editingNote.verseNumber}`
          : undefined}
        text={h.editText}
        saving={h.saving}
        onTextChange={h.setEditText}
        onSave={h.saveNote}
        onClose={h.closeEdit}
      />
    </>
  );
}
