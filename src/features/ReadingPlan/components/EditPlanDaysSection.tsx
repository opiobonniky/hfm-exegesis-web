import { ChevronDown, ChevronUp, Save, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface DayAssignment {
  dayNumber: number; title: string;
  chapters: { bookName: string; chapter: number }[];
  reflectionPrompt: string; reflectionText: string;
  quizQuestions: { id: number; question: string; options: string[]; correctAnswer: number }[];
}

interface Props {
  days: DayAssignment[];
  expandedDay: number;
  setExpandedDay: (v: number) => void;
  updateDay: (dayIdx: number, field: string, value: any) => void;
  updateChapter: (dayIdx: number, chIdx: number, field: string, value: any) => void;
  handleSaveDay: (dayIdx: number) => void;
  savingDay: number | null;
  setDeleteQuizTarget: (v: { dayIdx: number; quizIdx: number } | null) => void;
}

export function EditPlanDaysSection({
  days, expandedDay, setExpandedDay, updateDay, updateChapter,
  handleSaveDay, savingDay, setDeleteQuizTarget,
}: Props) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">Days ({days.length})</p>
      {days.map((day, di) => {
        const open = expandedDay === di;
        return (
          <div key={di} className="rounded-2xl border border-border bg-card overflow-hidden">
            <button
              onClick={() => setExpandedDay(open ? -1 : di)}
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-bold">{day.dayNumber}</span>
                <span className="text-sm font-medium">{day.title || `Day ${day.dayNumber}`}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground">{day.chapters.length}ch · {day.quizQuestions.length}q</span>
                {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </div>
            </button>
            {open && (
              <div className="border-t border-border p-4 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground">Title</label>
                  <Input value={day.title} onChange={(e) => updateDay(di, "title", e.target.value)} placeholder={`Day ${day.dayNumber}`} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground">Chapters</label>
                  {day.chapters.map((ch, ci) => (
                    <div key={ci} className="flex gap-2">
                      <Input value={ch.bookName} onChange={(e) => updateChapter(di, ci, "bookName", e.target.value)} placeholder="Book" className="flex-1" />
                      <Input type="number" value={ch.chapter} onChange={(e) => updateChapter(di, ci, "chapter", parseInt(e.target.value) || 1)} className="w-20" />
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground">Reflection</label>
                  <Input value={day.reflectionPrompt} onChange={(e) => updateDay(di, "reflectionPrompt", e.target.value)} placeholder="Reflection prompt" />
                </div>
                {day.quizQuestions.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground">Quiz ({day.quizQuestions.length})</label>
                    {day.quizQuestions.map((q, qi) => (
                      <div key={qi} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 text-xs">
                        <span className="font-bold text-muted-foreground">Q{qi + 1}</span>
                        <span className="flex-1 truncate">{q.question}</span>
                        <button onClick={() => setDeleteQuizTarget({ dayIdx: di, quizIdx: qi })} className="p-1 hover:bg-red-100 rounded">
                          <Trash2 className="w-3 h-3 text-red-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <Button size="sm" onClick={() => handleSaveDay(di)} disabled={savingDay === di} className="gap-1.5">
                  <Save className="w-3 h-3" /> {savingDay === di ? "Saving..." : "Save Day"}
                </Button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
