 * EditReadingPlan — thin page composing extracted components.
 */
import { Loader2, ArrowLeft, Save, Trash2, ChevronDown, ChevronUp, Plus, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useEditReadingPlanPage } from "../hooks/useEditReadingPlanPage";
import { cn } from "@/lib/utils";

export default function EditReadingPlan() {
  const p = useEditReadingPlanPage();
  if (p.loading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!p.meta) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Plan not found</p></div>;
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => p.navigate(-1)}><ArrowLeft className="w-5 h-5" /></Button>
          <h1 className="text-sm font-semibold">Edit Plan</h1>
          <Button size="sm" onClick={p.handleSaveMeta} disabled={p.savingMeta} className="gap-1.5">
            <Save className="w-3.5 h-3.5" /> {p.savingMeta ? "Saving..." : "Save"}
          </Button>
        </div>
      </header>
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Plan meta */}
        <div className="rounded-2xl border border-border/50 bg-card p-4 space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-bold">Title</Label>
            <Input value={p.meta.title} onChange={(e) => p.updateMeta("title", e.target.value)} />
          </div>
            <Label className="text-xs font-bold">Description</Label>
            <Textarea value={p.meta.description || ""} onChange={(e) => p.updateMeta("description", e.target.value)} rows={3} />
          <div className="flex items-center justify-between">
            <Label className="text-xs font-bold">Published</Label>
            <Switch checked={p.meta.isPublished} onCheckedChange={(v) => p.updateMeta("isPublished", v)} />
        {/* Days */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Days ({p.days.length})</h2>
          {p.days.map((day, dayIdx) => {
            const expanded = p.expandedDay === dayIdx;
            return (
              <div key={day.dayNumber} className="rounded-2xl border border-border/50 bg-card overflow-hidden">
                {/* Day header */}
                <button onClick={() => p.setExpandedDay(expanded ? -1 : dayIdx)} className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{day.dayNumber}</div>
                    <div className="text-left">
                      <p className="text-sm font-semibold">{day.title || `Day ${day.dayNumber}`}</p>
                      <p className="text-[10px] text-muted-foreground">{day.chapters.length} chapters, {day.quizQuestions.length} quizzes</p>
                    </div>
                  </div>
                  {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </button>
                {/* Day body (expanded) */}
                {expanded && (
                  <div className="px-4 pb-4 space-y-4 border-t border-border/30 pt-4">
                    {/* Title */}
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase">Day Title</Label>
                      <Input value={day.title} onChange={(e) => p.updateDay(dayIdx, "title", e.target.value)} placeholder="Day title..." />
                    {/* Chapters */}
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase">Chapters</Label>
                      {day.chapters.map((ch, chIdx) => (
                        <div key={chIdx} className="flex items-center gap-2">
                          <BookOpen className="w-3.5 h-3.5 text-primary/60 shrink-0" />
                          <Input value={ch.bookName} onChange={(e) => p.updateChapter(dayIdx, chIdx, "bookName", e.target.value)} placeholder="Book" className="flex-1" />
                          <Input value={String(ch.chapter)} onChange={(e) => p.updateChapter(dayIdx, chIdx, "chapter", Number(e.target.value))} placeholder="Ch" type="number" className="w-20" />
                        </div>
                      ))}
                    {/* Reflection */}
                      <Label className="text-[10px] font-bold uppercase">Reflection Prompt</Label>
                      <Textarea value={day.reflectionPrompt} onChange={(e) => p.updateDay(dayIdx, "reflectionPrompt", e.target.value)} rows={2} />
                    {/* Quiz questions */}
                    {day.quizQuestions.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase">Quiz ({day.quizQuestions.length})</Label>
                        {day.quizQuestions.map((q, qIdx) => (
                          <div key={q.id || qIdx} className="p-3 rounded-xl bg-muted/20 space-y-1">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-xs font-medium flex-1">{q.question}</p>
                              <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => p.setDeleteQuizTarget({ dayIdx, quizIdx: qIdx })}>
                                <Trash2 className="w-3 h-3 text-destructive" />
                              </Button>
                            </div>
                            {q.options.map((opt, oIdx) => (
                              <p key={oIdx} className={cn("text-[10px] pl-2", oIdx === q.correctAnswer ? "text-green-600 font-bold" : "text-muted-foreground")}>
                                {String.fromCharCode(65 + oIdx)}. {opt}
                              </p>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                    {/* Save day button */}
                    <Button size="sm" onClick={() => p.handleSaveDay(dayIdx)} disabled={p.savingDay === dayIdx} className="w-full gap-1.5">
                      <Save className="w-3.5 h-3.5" /> {p.savingDay === dayIdx ? "Saving..." : "Save Day"}
                    </Button>
                )}
              </div>
            );
          })}
      </div>
      {/* Delete quiz confirmation */}
      {p.deleteQuizTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => p.setDeleteQuizTarget(null)}>
          <div className="w-full max-w-sm rounded-2xl bg-card border border-border shadow-2xl p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold">Remove Quiz?</h3>
            <p className="text-sm text-muted-foreground">This will permanently remove this quiz question.</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => p.setDeleteQuizTarget(null)} className="flex-1">Cancel</Button>
              <Button variant="destructive" onClick={p.handleDeleteQuiz} disabled={p.deletingQuiz} className="flex-1">
                {p.deletingQuiz ? "Removing..." : "Remove"}
              </Button>
            </div>
      )}
    </div>
  );
}
