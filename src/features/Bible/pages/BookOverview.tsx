// BookOverview — displays prologue/introduction for a Bible book
import { useBookOverview } from "../hooks/useBookOverview";
import BookOverviewHeader from "../components/BookOverviewHeader";
import BookOverviewContent from "../components/BookOverviewContent";
import BookOverviewLoading from "../components/BookOverviewLoading";
import BookOverviewEmpty from "../components/BookOverviewEmpty";
import BookOverviewStartCTA from "../components/BookOverviewStartCTA";

export default function BookOverview() {
  const {
    bookName,
    prologue,
    loading,
    resumeChapter,
    isOt,
    designation,
    testamentLabel,
    onStartReading,
    onBack,
  } = useBookOverview();

  return (
    <div className="h-full flex flex-col bg-background">
      <BookOverviewHeader bookName={bookName} onBack={onBack} />

      <main className="flex-1 min-h-0 overflow-y-auto">
        {loading ? (
          <BookOverviewLoading />
        ) : prologue ? (
          <BookOverviewContent
            bookName={bookName}
            prologue={prologue}
            designation={designation}
            testamentLabel={testamentLabel}
          />
        ) : (
          <BookOverviewEmpty />
        )}
      </main>

      <BookOverviewStartCTA onStart={onStartReading} resumeChapter={resumeChapter} />
    </div>
  );
}
