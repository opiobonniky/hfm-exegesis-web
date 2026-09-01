// Notes — standalone page for viewing and managing verse notes
"use client";

import { useNotesPage } from "../hooks/useNotesPage";
import { BiblePageLayout } from "../components/BiblePageLayout";
import { NoteCard } from "../components/NoteCard";
import { EditNoteDialog } from "../components/EditNoteDialog";
import { BibleGroupSection, BibleSubGroup } from "../components/BibleGroupSection";

export default function Notes() {
  const h = useNotesPage();

  return (
    <>
      <BiblePageLayout
        title="My Notes"
        count={h.notes.length}
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
        {Object.entries(h.grouped).map(([book, chapters]) => (
          <BibleGroupSection key={book} label={book}>
            {Object.entries(chapters).map(([chapter, verses]) => (
              <BibleSubGroup key={chapter} label={`Chapter ${chapter}`}>
                {verses.map((n) => (
                  <NoteCard
                    key={n.id}
                    bookName={n.bookName}
                    chapter={n.chapter}
                    verseNumber={n.verseNumber}
                    verseText={h.verseTextMap[`${n.bookName} ${n.chapter}:${n.verseNumber}`]}
                    note={n.note}
                    createdOn={n.createdOn}
                    updatedOn={n.updatedOn}
                    deleting={h.deleting === n.id}
                    onGoToReader={() => h.goToReader(n.bookName, n.chapter)}
                    onEdit={() => h.openEdit(n)}
                    onDelete={() => h.deleteNote(n.id)}
                    formatDate={h.formatDate}
                  />
                ))}
              </BibleSubGroup>
            ))}
          </BibleGroupSection>
        ))}
      </BiblePageLayout>

      <EditNoteDialog
        open={!!h.editingNote}
        bookName={h.editingNote?.bookName}
        chapter={h.editingNote?.chapter}
        verseNumber={h.editingNote?.verseNumber}
        text={h.editText}
        saving={h.saving}
        onTextChange={h.setEditText}
        onSave={h.saveNote}
        onClose={() => h.setEditingNote(null)}
      />
    </>
  );
}
