import type { JournalEntryPageModel } from "../hooks/useJournalEntryPage";
import { JournalEntryAdditionalSection } from "./JournalEntryAdditionalSection";
import { JournalEntryCoreForm } from "./JournalEntryCoreForm";
import { JournalEntryReflectionFields } from "./JournalEntryReflectionFields";
import { ScriptureLink } from "./ScriptureLink";

interface JournalEntryFormProps {
  model: JournalEntryPageModel;
}

export function JournalEntryForm({ model }: JournalEntryFormProps) {
  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <JournalEntryCoreForm
            t={model.t}
            title={model.entry.title}
            content={model.entry.content}
            category={model.entry.category}
            mood={model.entry.mood}
            wordCount={model.wordCount}
            onTitleChange={model.handleTitleChange}
            onContentChange={model.handleContentChange}
            onCategoryChange={model.handleCategoryChange}
            onMoodChange={model.handleMoodChange}
          />
          <JournalEntryReflectionFields
            t={model.t}
            learnings={model.entry.learnings}
            application={model.entry.application}
            gratitude={model.entry.gratitude}
            prayers={model.entry.prayers}
            onLearningsChange={model.handleLearningsChange}
            onApplicationChange={model.handleApplicationChange}
            onGratitudeChange={model.handleGratitudeChange}
            onPrayersChange={model.handlePrayersChange}
          />
        </div>
        <aside className="space-y-6">
          <ScriptureLink
            t={model.t}
            testament={model.testament}
            bookName={model.entry.bookName}
            chapter={model.entry.chapter}
            verseNumber={model.entry.verseNumber}
            books={model.books}
            chapters={model.chapters}
            verses={model.verses}
            onTestamentChange={model.handleTestamentChange}
            onBookChange={model.handleBookChange}
            onChapterChange={model.handleChapterChange}
            onVerseChange={model.handleVerseChange}
            onOpenBibleReader={model.handleOpenBibleReader}
          />
          <JournalEntryAdditionalSection
            t={model.t}
            tags={model.entry.tags}
            isFavorite={model.entry.isFavorite}
            isPublished={model.entry.isPublished}
            onTagsChange={model.handleTagsChange}
            onFavoriteChange={model.handleFavoriteChange}
            onPublishedChange={model.handlePublishedChange}
          />
        </aside>
      </div>
    </main>
  );
}
