import { useDailyReadingPage } from "../hooks/useDailyReadingPage";
import { PageSkeleton } from "@/components/ui/skeletons.tsx";
import DailyReadingHeader from "../components/DailyReadingHeader";
import DailyReadingChapters from "../components/DailyReadingChapters";
import DailyReadingReflections from "../components/DailyReadingReflections";
import DailyReadingQuiz from "../components/DailyReadingQuiz";
import { DailyCompletionButton } from "../components/DailyReadingCompletion";
import { ConfettiOverlay } from "../components/ConfettiOverlay";
import { NotYetAdded } from "../components/NotYetAdded";
import { DailyReadingLayout, DailyReadingContent, DailyReadingGrid, DailyReadingMobileCompletion, DailyReadingJourney } from "../components";
import Gate from "@/components/Gate";

export default function DailyReading() {
  const { data, actions } = useDailyReadingPage();
  const chapters = data.assignment?.chapters || [];
  const reflections = data.assignment?.reflections || [];
  const quizQuestions = data.assignment?.quizQuestions || [];

  if (data.loading) {
    return <PageSkeleton />;
  }

  if (data.notYetAdded) {
    return (
      <DailyReadingLayout
        isRtl={data.isRtl}
        showConfetti={false}
        confettiOverlay={null}
      >
        <DailyReadingHeader
          planTitle={data.planTitle}
          dayNumber={data.dayNumber}
          totalDays={data.totalDays}
          isCompleted={false}
          onBack={() => data.navigate(-1)}
        />
        <NotYetAdded onBack={() => data.navigate(-1)} />
      </DailyReadingLayout>
    );
  }

  return (
    <DailyReadingLayout
      isRtl={data.isRtl}
      showConfetti={data.showConfetti}
      confettiOverlay={<ConfettiOverlay />}
    >
      <DailyReadingHeader
        planTitle={data.planTitle}
        dayNumber={data.dayNumber}
        totalDays={data.totalDays}
        isCompleted={data.isCompleted}
        onBack={() => data.navigate(-1)}
      />

      <DailyReadingContent>
        <Gate
          featureName="Daily Reading"
          featureDescription="Complete daily reading assignments with reflections and quizzes."
        >
          <DailyReadingGrid>
            <main className="min-w-0 space-y-6">
              <DailyReadingChapters
                chapters={chapters}
                onOpenChapter={actions.openBibleReading}
              />

              <DailyReadingReflections
                reflections={reflections}
                onAnswerChange={actions.updateReflectionAnswer}
              />

              {quizQuestions.length > 0 && (
              <DailyReadingQuiz
                questions={quizQuestions}
                currentQ={data.currentQ}
                selected={data.selected}
                showResult={data.showResult}
                isReviewing={data.isReviewing}
                quizDone={data.quizDone}
                correctCount={data.correctCount}
                lastAnswerCorrect={data.lastAnswerCorrect}
                revealedCorrectAnswer={data.revealedCorrectAnswer}
                onSelectAnswer={actions.handleSelectAnswer}
                onNext={actions.handleNextQuestion}
                onRetry={actions.handleRetryQuiz}
                onReview={actions.handleReviewQuiz}
              />
              )}

              <DailyReadingMobileCompletion>
                <DailyCompletionButton
                  isCompleted={data.isCompleted}
                  canComplete={data.canComplete}
                  isSubmitting={data.isSubmitting}
                  dayNumber={data.dayNumber}
                  onSubmit={actions.handleSubmitDay}
                  incompleteMessage={data.incompleteMessage}
                />
              </DailyReadingMobileCompletion>
            </main>

            <DailyReadingJourney model={{ data, actions }} />
          </DailyReadingGrid>
        </Gate>
      </DailyReadingContent>
    </DailyReadingLayout>
  );
}
