import { useDailyReadingPage } from "../hooks/useDailyReadingPage";
import { PageSkeleton } from "@/components/ui/skeletons.tsx";
import DailyReadingHeader from "../components/DailyReadingHeader";
import DailyReadingChapters from "../components/DailyReadingChapters";
import DailyReadingReflections from "../components/DailyReadingReflections";
import DailyReadingQuiz from "../components/DailyReadingQuiz";
import { DailyCompletionButton } from "../components/DailyReadingCompletion";
import { ConfettiOverlay } from "../components/ConfettiOverlay";
import { NotYetAdded } from "../components/NotYetAdded";
import { DailyReadingLayout, DailyReadingContent } from "../components";
import Gate from "@/components/Gate";

export default function DailyReading() {
  const p = useDailyReadingPage();

  if (p.loading) {
    return <PageSkeleton />;
  }

  if (p.notYetAdded) {
    return (
      <DailyReadingLayout isRtl={p.isRtl} showConfetti={false} confettiOverlay={null}>
        <DailyReadingHeader planTitle={p.planTitle} dayNumber={p.dayNumber} totalDays={p.totalDays} isCompleted={false} onBack={() => p.navigate(-1)} />
        <NotYetAdded onBack={() => p.navigate(-1)} />
      </DailyReadingLayout>
    );
  }

  return (
    <DailyReadingLayout isRtl={p.isRtl} showConfetti={p.showConfetti} confettiOverlay={<ConfettiOverlay />}>
      <DailyReadingHeader planTitle={p.planTitle} dayNumber={p.dayNumber} totalDays={p.totalDays} isCompleted={p.isCompleted} onBack={() => p.navigate(-1)} />

      <DailyReadingContent>
        <Gate featureName="Daily Reading" featureDescription="Complete daily reading assignments with reflections and quizzes.">
          <DailyReadingChapters chapters={p.assignment?.chapters || []} />

          <DailyReadingReflections
            reflections={p.assignment?.reflections || []}
            ponderedIds={p.ponderedReflections}
            onTogglePonder={p.togglePonder}
          />

          {p.assignment?.quizQuestions && p.assignment.quizQuestions.length > 0 && (
            <DailyReadingQuiz
              questions={p.assignment.quizQuestions}
              currentQ={p.currentQ}
              selected={p.selected}
              showResult={p.showResult}
              isReviewing={p.isReviewing}
              quizDone={p.quizDone}
              correctCount={p.correctCount}
              lastAnswerCorrect={p.lastAnswerCorrect}
              revealedCorrectAnswer={p.revealedCorrectAnswer}
              onSelectAnswer={p.handleSelectAnswer}
              onNext={p.handleNextQuestion}
              onRetry={p.handleRetryQuiz}
              onReview={p.handleReviewQuiz}
            />
          )}

          <DailyCompletionButton
            isCompleted={p.isCompleted}
            canComplete={p.canComplete}
            isSubmitting={p.isSubmitting}
            dayNumber={p.dayNumber}
            onSubmit={p.handleSubmitDay}
          />
        </Gate>
      </DailyReadingContent>
    </DailyReadingLayout>
  );
}
