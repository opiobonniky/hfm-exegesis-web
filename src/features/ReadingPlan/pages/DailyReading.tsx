 * DailyReading — thin page composing extracted components.
 * Zero raw HTML tags — all UI in extracted components.
 */
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Gate from "@/components/Gate";
import { useDailyReadingPage } from "../hooks/useDailyReadingPage";
import DailyReadingHeader from "../components/DailyReadingHeader";
import DailyReadingChapters from "../components/DailyReadingChapters";
import DailyReadingReflections from "../components/DailyReadingReflections";
import DailyReadingQuiz from "../components/DailyReadingQuiz";

export default function DailyReading() {
  const p = useDailyReadingPage();
  if (p.loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  if (p.notYetAdded) {
      <div className="min-h-screen bg-background">
        <DailyReadingHeader planTitle="Daily Reading" dayNumber={p.dayNumber} totalDays={p.totalDays} isCompleted={false} onBack={() => p.navigate(-1)} />
        <div className="flex flex-col items-center justify-center py-20 gap-4 px-4">
          <p className="text-muted-foreground text-center">This day's reading has not been added yet.</p>
          <Button variant="outline" onClick={() => p.navigate(-1)}>Go Back</Button>
        </div>
  return (
    <div className="min-h-screen bg-background" dir={p.isRtl ? "rtl" : "ltr"}>
      <DailyReadingHeader planTitle={p.planTitle} dayNumber={p.dayNumber} totalDays={p.totalDays} isCompleted={p.isCompleted} onBack={() => p.navigate(-1)} />
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Confetti overlay */}
        {p.showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-50">
            <div className="absolute inset-0 bg-primary/5 animate-pulse" />
          </div>
        )}
        <Gate featureName="Daily Reading" featureDescription="Complete daily reading assignments with reflections and quizzes.">
          {/* Chapters */}
          <DailyReadingChapters chapters={p.assignment?.chapters || []} />
          {/* Reflections */}
          <DailyReadingReflections reflections={p.assignment?.reflections || []} ponderedIds={p.ponderedReflections} onTogglePonder={p.togglePonder} />
          {/* Quiz */}
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
          {/* Complete button */}
          {!p.isCompleted && (
            <Button onClick={p.handleSubmitDay} disabled={!p.canComplete || p.isSubmitting} className="w-full" size="lg">
              {p.isSubmitting ? "Submitting..." : p.canComplete ? "Complete Day" : "Complete all reflections & quiz first"}
            </Button>
          {p.isCompleted && (
            <div className="text-center py-4">
              <p className="text-sm text-green-600 font-semibold">Day {p.dayNumber} completed!</p>
            </div>
        </Gate>
    </div>
  );
}
