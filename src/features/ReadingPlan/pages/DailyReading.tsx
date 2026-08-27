import Gate from "@/components/Gate";
import { PageLayout } from "@/components/PageLayout";
import { LoadingState } from "@/components/ui/LoadingState";
import { useDailyReadingPage } from "../hooks/useDailyReadingPage";
import DailyReadingHeader from "../components/DailyReadingHeader";
import DailyReadingChapters from "../components/DailyReadingChapters";
import DailyReadingReflections from "../components/DailyReadingReflections";
import DailyReadingQuiz from "../components/DailyReadingQuiz";
import { DailyCompletionButton } from "../components/DailyReadingCompletion";
import { ConfettiOverlay } from "../components/ConfettiOverlay";
import { NotYetAdded } from "../components/NotYetAdded";
import {PageSkeleton} from "@/components/ui/skeletons.tsx";

export default function DailyReading() {
  const p = useDailyReadingPage();

  if (p.loading) {
    return (
      <PageSkeleton/>
    );
  }

  if (p.notYetAdded) {
    return (
      <div className="min-h-screen bg-background">
        <DailyReadingHeader planTitle="Daily Reading" dayNumber={p.dayNumber} totalDays={p.totalDays} isCompleted={false} onBack={() => p.navigate(-1)} />
        <NotYetAdded onBack={() => p.navigate(-1)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir={p.isRtl ? "rtl" : "ltr"}>
      {p.showConfetti && <ConfettiOverlay />}

      <DailyReadingHeader planTitle={p.planTitle} dayNumber={p.dayNumber} totalDays={p.totalDays} isCompleted={p.isCompleted} onBack={() => p.navigate(-1)} />

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
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
      </div>
    </div>
  );
}
