import { useDailyReadingPage } from "../hooks/useDailyReadingPage";
import { PageSkeleton } from "@/components/ui/skeletons.tsx";
import DailyReadingHeader from "../components/DailyReadingHeader";
import DailyReadingChapters from "../components/DailyReadingChapters";
import DailyReadingReflections from "../components/DailyReadingReflections";
import DailyReadingQuiz from "../components/DailyReadingQuiz";
import { DailyCompletionButton } from "../components/DailyReadingCompletion";
import { ConfettiOverlay } from "../components/ConfettiOverlay";
import { NotYetAdded } from "../components/NotYetAdded";
import { DailyReadingLayout, DailyReadingContent, DailyReadingGrid, DailyReadingMain, DailyReadingMobileCompletion, DailyReadingJourney } from "../components";
import Gate from "@/components/Gate";

export default function DailyReading() {
  const { data, actions } = useDailyReadingPage();
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
            <DailyReadingMain>
              <DailyReadingChapters
                chapters={data.chapters}
                onOpenChapter={actions.openBibleReading}
              />

              <DailyReadingReflections
                reflections={data.reflections}
                onAnswerChange={actions.updateReflectionAnswer}
              />

              {data.quizQuestions.length > 0 && (
              <DailyReadingQuiz
                questions={data.quizQuestions}
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
            </DailyReadingMain>

            <DailyReadingJourney
              chapters={data.chapters}
              reflections={data.reflections}
              quizQuestions={data.quizQuestions}
              allReflectionsAnswered={data.allReflectionsAnswered}
              quizDone={data.quizDone}
              isCompleted={data.isCompleted}
              canComplete={data.canComplete}
              isSubmitting={data.isSubmitting}
              dayNumber={data.dayNumber}
              incompleteMessage={data.incompleteMessage}
              onSubmit={actions.handleSubmitDay}
            />
          </DailyReadingGrid>
        </Gate>
      </DailyReadingContent>
    </DailyReadingLayout>
  );
}
