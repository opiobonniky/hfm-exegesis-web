import type { NoteItem } from "../hooks/useNotesPage";
import { BibleGroupSection, BibleSubGroup } from "./BibleGroupSection";
import { NoteCard } from "./NoteCard";

interface Props {
  grouped: Record<string, Record<number, NoteItem[]>>;
  verseTextMap: Record<string, string>;
  deleting: number | null;
  onGoToReader: (bookName: string, chapter: number) => void;
  onEdit: (note: NoteItem) => void;
  onDelete: (id: number) => void;
  formatDate: (date: string) => string;
}

export function NotesList({ grouped, verseTextMap, deleting, onGoToReader, onEdit, onDelete, formatDate }: Props) {
  return (
    <>
      {Object.entries(grouped).map(([book, chapters]) => (
        <BibleGroupSection key={book} label={book}>
          {Object.entries(chapters).map(([chapter, notes]) => (
            <BibleSubGroup key={chapter} label={`Chapter ${chapter}`}>
              {notes.map((note) => (
                <NoteCard
                  key={note.id}
                  bookName={note.bookName}
                  chapter={note.chapter}
                  verseNumber={note.verseNumber}
                  verseText={verseTextMap[`${note.bookName} ${note.chapter}:${note.verseNumber}`]}
                  note={note.note}
                  createdOn={note.createdOn}
                  updatedOn={note.updatedOn}
                  deleting={deleting === note.id}
                  onGoToReader={() => onGoToReader(note.bookName, note.chapter)}
                  onEdit={() => onEdit(note)}
                  onDelete={() => onDelete(note.id)}
                  formatDate={formatDate}
                />
              ))}
            </BibleSubGroup>
          ))}
        </BibleGroupSection>
      ))}
    </>
  );
}
