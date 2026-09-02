import { BookOpen, Brain, MessageSquareText } from "lucide-react";
import { DailyCompletionButton } from "./DailyReadingCompletion";
import { DailyReadingJourneyItem } from "./DailyReadingJourneyItem";
import type { DailyReadingPageModel } from "../hooks/useDailyReadingPage";

interface Props {
  model: DailyReadingPageModel;
}

export function DailyReadingJourney({ model }: Props) {
  const { data, actions } = model;
  const chapters = data.assignment?.chapters || [];
  const reflections = data.assignment?.reflections || [];
  const quizQuestions = data.assignment?.quizQuestions || [];
  const answeredReflections = reflections.filter((reflection) => reflection.reflectionText.trim()).length;

  return (
    <aside className="hidden lg:sticky lg:top-6 lg:block">
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-lg shadow-black/[0.03]">
        <div className="border-b border-border/60 bg-muted/30 px-5 py-4">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Today's journey</p>
          <h2 className="mt-1 text-lg font-bold">Stay present, not rushed</h2>
        </div>
        <div className="space-y-3 p-4">
          <DailyReadingJourneyItem
            icon={BookOpen}
            label="Read Scripture"
            detail={`${chapters.length} ${chapters.length === 1 ? "passage" : "passages"} assigned`}
          />
          <DailyReadingJourneyItem
            icon={MessageSquareText}
            label="Reflect"
            detail={`${answeredReflections} of ${reflections.length} responses written`}
            complete={data.allReflectionsAnswered}
          />
          {quizQuestions.length > 0 && (
            <DailyReadingJourneyItem
              icon={Brain}
              label="Check understanding"
              detail={`${quizQuestions.length} ${quizQuestions.length === 1 ? "question" : "questions"}`}
              complete={data.quizDone}
            />
          )}
        </div>
        <div className="border-t border-border/60 bg-muted/20 p-4">
          <DailyCompletionButton
            isCompleted={data.isCompleted}
            canComplete={data.canComplete}
            isSubmitting={data.isSubmitting}
            dayNumber={data.dayNumber}
            onSubmit={actions.handleSubmitDay}
            incompleteMessage={data.incompleteMessage}
          />
        </div>
      </div>
    </aside>
  );
}
