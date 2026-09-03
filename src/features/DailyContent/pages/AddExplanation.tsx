// AddExplanation — full-page structured editor for verse explanations (add + edit)
"use client";

import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Lightbulb,
  Loader2,
  Plus,
  Save,
  Sparkles,
  Tag,
  Target,
  Trash2,
  ChevronUp,
  ChevronDown,
  Link as LinkIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useAddExplanation } from "../hooks/useAddExplanation";

const stepOrder = ["reference", "exegesis", "study", "extras"] as const;

const AddVerseExplanation = () => {
  const h = useAddExplanation();

  if (h.loadingExisting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-50">
        <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 shadow-lg shadow-slate-950/30">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span className="text-sm text-slate-300">Loading verse explanation...</span>
        </div>
      </div>
    );
  }

  const currentStepIndex = stepOrder.indexOf(h.activeTab as (typeof stepOrder)[number]);
  const currentStep = stepOrder[Math.max(0, currentStepIndex)] ?? "reference";

  const referenceComplete =
    h.form.bookName.trim() !== "" &&
    Number(h.form.chapter) >= 1 &&
    Number(h.form.verseNumber) >= 1;

  const exegesisComplete = h.form.exegesis.explanationText.trim().length >= 20;
  const studyComplete =
    h.form.studyMetadata.introduction.trim().length > 0 ||
    h.form.wordStudies.length > 0 ||
    h.form.themes.length > 0;

  const stepCompletion = {
    reference: referenceComplete,
    exegesis: exegesisComplete,
    study: studyComplete,
    extras: true,
  };

  const steps = [
    { id: "reference", label: "Reference", description: "Verse & translation", icon: BookOpen },
    { id: "exegesis", label: "Exegesis", description: "Main insight", icon: Lightbulb },
    { id: "study", label: "Study", description: "Context & word study", icon: Target },
    { id: "extras", label: "Extras", description: "Applications & themes", icon: Tag },
  ] as const;

  const primaryActionLabel = currentStep === "extras" ? (h.isEditMode ? "Save changes" : "Publish explanation") : "Continue";

  const goToStep = (stepId: string) => h.setActiveTab(stepId);
  const goNext = () => {
    const nextIndex = Math.min(stepOrder.length - 1, currentStepIndex + 1);
    if (nextIndex !== currentStepIndex) goToStep(stepOrder[nextIndex]);
  };
  const goPrevious = () => {
    const prevIndex = Math.max(0, currentStepIndex - 1);
    if (prevIndex !== currentStepIndex) goToStep(stepOrder[prevIndex]);
  };

  const canAdvanceFromCurrent =
    currentStep === "reference"
      ? referenceComplete
      : currentStep === "exegesis"
        ? exegesisComplete
        : currentStep === "study"
          ? true
          : true;

  const completionPercent = Math.round(
    (Object.values(stepCompletion).filter(Boolean).length / stepOrder.length) * 100,
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_35%),linear-gradient(180deg,#020817_0%,#0f172a_100%)] text-slate-50">
      <div className="border-b border-white/10 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-20">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <Button variant="ghost" size="icon" className="rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-slate-200" onClick={h.goBack}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-[0.22em] text-sky-300/80">Study workflow</p>
                <h1 className="truncate text-lg font-bold text-white sm:text-xl">
                  {h.isEditMode ? "Edit Verse Explanation" : "Create Verse Explanation"}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start lg:self-auto">
              <Button variant="outline" className="border-white/10 bg-white/5 text-slate-200 hover:bg-white/10" onClick={h.goBack}>
                Cancel
              </Button>
              <Button onClick={h.handleSave} disabled={!h.isValid || h.saving} className="gap-2 bg-sky-500 text-slate-950 hover:bg-sky-400">
                {h.saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {h.isEditMode ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
        <div className="mb-6 grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-2xl shadow-slate-950/20 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Verse reference</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  {h.form.bookName ? `${h.form.bookName} ${h.form.chapter || "?"}:${h.form.verseNumber || "?"}` : "Choose a passage"}
                </h2>
              </div>
              <div className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
                {completionPercent}% complete
              </div>
            </div>
            <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white/5">
              <div className="h-full rounded-full bg-gradient-to-r from-sky-400 via-cyan-400 to-emerald-400 transition-all" style={{ width: `${completionPercent}%` }} />
            </div>
          </div>

          <div className="rounded-2xl border border-sky-500/20 bg-sky-500/10 p-5">
            <div className="flex items-center gap-2 text-sky-200">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs uppercase tracking-[0.22em]">Quick notes</span>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-slate-200">
              <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 w-4 h-4 text-emerald-300" /> Reference the verse before writing the insight.</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 w-4 h-4 text-emerald-300" /> Keep the explanation clear and practical.</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 w-4 h-4 text-emerald-300" /> Add cross-references and themes to enrich study.</li>
            </ul>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[290px_minmax(0,1fr)]">
          <aside className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 shadow-xl shadow-slate-950/20">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Workflow</p>
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-slate-300">{currentStepIndex + 1}/{steps.length}</span>
            </div>

            <div className="space-y-3">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = step.id === currentStep;
                const isDone = stepCompletion[step.id];

                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => goToStep(step.id)}
                    className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-all ${
                      isActive
                        ? "border-sky-400/70 bg-sky-500/10 shadow-lg shadow-sky-950/20"
                        : "border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg border ${
                      isDone ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-300" : isActive ? "border-sky-400/40 bg-sky-500/10 text-sky-300" : "border-white/10 bg-white/5 text-slate-400"
                    }`}>
                      {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-white">{step.label}</span>
                        <span className="text-[10px] text-slate-400">{index + 1}</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-400">{step.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] p-3">
              <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Required</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-300">
                <li className="flex items-center justify-between gap-2">
                  <span>Reference</span>
                  <span className={referenceComplete ? "text-emerald-300" : "text-slate-500"}>{referenceComplete ? "Ready" : "Missing"}</span>
                </li>
                <li className="flex items-center justify-between gap-2">
                  <span>Explanation</span>
                  <span className={exegesisComplete ? "text-emerald-300" : "text-slate-500"}>{exegesisComplete ? "Ready" : "Missing"}</span>
                </li>
              </ul>
            </div>
          </aside>

          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 shadow-xl shadow-slate-950/20 sm:p-5">
            <Tabs value={h.activeTab} onValueChange={h.setActiveTab}>
              <TabsList className="hidden" aria-hidden="true">
                <TabsTrigger value="reference">Reference</TabsTrigger>
                <TabsTrigger value="exegesis">Exegesis</TabsTrigger>
                <TabsTrigger value="study">Study</TabsTrigger>
                <TabsTrigger value="extras">Extras</TabsTrigger>
              </TabsList>

              <TabsContent value="reference" className="space-y-6">
                <div className="flex items-center gap-2 text-sky-200">
                  <BookOpen className="w-4 h-4" />
                  <span className="text-sm font-medium">Verse reference</span>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-sm font-medium text-slate-200">Book name</Label>
                    <div className="relative">
                      <Input
                        placeholder="Search for a book..."
                        value={h.form.bookName}
                        onChange={(e) => h.updateField("bookName", e.target.value)}
                        className="border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                      />
                      {h.form.bookName && h.filteredBooks.length > 0 && (
                        <div className="absolute z-10 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-white/10 bg-slate-950 shadow-2xl shadow-slate-950/50">
                          {h.filteredBooks.slice(0, 20).map((book) => (
                            <button
                              key={book}
                              type="button"
                              className="block w-full px-3 py-2 text-left text-sm text-slate-200 transition hover:bg-sky-500/10"
                              onClick={() => h.updateField("bookName", book)}
                            >
                              {book}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-200">Bible version</Label>
                    <Input
                      placeholder="e.g., BSB, KJV"
                      value={h.form.bibleVersion}
                      onChange={(e) => h.updateField("bibleVersion", e.target.value)}
                      className="border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-200">Chapter</Label>
                    <Input
                      type="number"
                      min="1"
                      value={h.form.chapter}
                      onChange={(e) => h.updateField("chapter", e.target.value)}
                      className="border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-200">Verse number</Label>
                    <Input
                      type="number"
                      min="1"
                      value={h.form.verseNumber}
                      onChange={(e) => h.updateField("verseNumber", e.target.value)}
                      className="border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="exegesis" className="space-y-6">
                <div className="flex items-center gap-2 text-sky-200">
                  <Lightbulb className="w-4 h-4" />
                  <span className="text-sm font-medium">Main explanation</span>
                </div>

                <div className="space-y-2">
                  <Label className="text-base font-semibold text-white">Explanation</Label>
                  <p className="text-xs text-slate-400">Give the core theological insight and interpretive flow of the verse.</p>
                  <Textarea
                    placeholder="Type the heart of the explanation here..."
                    value={h.form.exegesis.explanationText}
                    onChange={(e) => h.updateNested("exegesis", "explanationText", e.target.value)}
                    rows={12}
                    className="resize-y border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                  />
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Minimum 20 characters</span>
                    <span>{h.form.exegesis.explanationText.trim().length} / 20</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-base font-semibold text-white">Application</Label>
                  <Textarea
                    placeholder="How should this truth shape daily living?"
                    value={h.form.exegesis.applicationText}
                    onChange={(e) => h.updateNested("exegesis", "applicationText", e.target.value)}
                    rows={6}
                    className="resize-y border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                  />
                </div>
              </TabsContent>

              <TabsContent value="study" className="space-y-8">
                <div className="flex items-center gap-2 text-sky-200">
                  <Target className="w-4 h-4" />
                  <span className="text-sm font-medium">Study context</span>
                </div>

                <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-[0.2em] text-slate-400">Introduction</Label>
                    <Textarea
                      placeholder="Brief introduction to the verse..."
                      value={h.form.studyMetadata.introduction}
                      onChange={(e) => h.updateNested("studyMetadata", "introduction", e.target.value)}
                      rows={3}
                      className="border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-[0.2em] text-slate-400">Author</Label>
                      <Input
                        value={h.form.studyMetadata.backgroundAuthor}
                        onChange={(e) => h.updateNested("studyMetadata", "backgroundAuthor", e.target.value)}
                        placeholder="e.g., Moses"
                        className="border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-[0.2em] text-slate-400">Book</Label>
                      <Input
                        value={h.form.studyMetadata.backgroundBook}
                        onChange={(e) => h.updateNested("studyMetadata", "backgroundBook", e.target.value)}
                        placeholder="e.g., Genesis"
                        className="border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-[0.2em] text-slate-400">Context</Label>
                      <Input
                        value={h.form.studyMetadata.backgroundContext}
                        onChange={(e) => h.updateNested("studyMetadata", "backgroundContext", e.target.value)}
                        placeholder="e.g., Creation narrative"
                        className="border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-white">
                      <Tag className="w-4 h-4 text-sky-300" />
                      <span className="font-semibold">Strong's word study</span>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2 border-white/10 bg-white/5 text-white hover:bg-white/10" onClick={h.addWordStudy}>
                      <Plus className="w-3 h-3" /> Add word
                    </Button>
                  </div>

                  {h.form.wordStudies.length === 0 ? (
                    <p className="text-sm text-slate-400 italic">No word studies added yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {h.form.wordStudies.map((ws, i) => (
                        <div key={i} className="flex gap-2 items-start rounded-xl border border-white/10 bg-slate-950/40 p-3">
                          <div className="flex flex-col gap-1 pt-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-300 hover:bg-white/5" disabled={i === 0} onClick={() => {
                              const next = [...h.form.wordStudies];
                              [next[i - 1], next[i]] = [next[i], next[i - 1]];
                              h.updateField("wordStudies", next);
                            }}>
                              <ChevronUp className="w-3 h-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-300 hover:bg-white/5" disabled={i === h.form.wordStudies.length - 1} onClick={() => {
                              const next = [...h.form.wordStudies];
                              [next[i], next[i + 1]] = [next[i + 1], next[i]];
                              h.updateField("wordStudies", next);
                            }}>
                              <ChevronDown className="w-3 h-3" />
                            </Button>
                          </div>

                          <div className="grid flex-1 gap-2 md:grid-cols-3">
                            <Input
                              placeholder="H3034"
                              value={ws.strongsId}
                              onChange={(e) => h.updateWordStudy(i, "strongsId", e.target.value)}
                              className="border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                            />
                            <Input
                              placeholder="Surface text"
                              value={ws.surfaceText}
                              onChange={(e) => h.updateWordStudy(i, "surfaceText", e.target.value)}
                              className="border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                            />
                            <Input
                              placeholder="Definition"
                              value={ws.customDefinition}
                              onChange={(e) => h.updateWordStudy(i, "customDefinition", e.target.value)}
                              className="border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                            />
                          </div>

                          <Button variant="ghost" size="icon" className="mt-1 text-red-300 hover:bg-red-500/10" onClick={() => h.removeWordStudy(i)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="extras" className="space-y-8">
                <div className="flex items-center gap-2 text-sky-200">
                  <Tag className="w-4 h-4" />
                  <span className="text-sm font-medium">Additional value</span>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-white">
                      <Target className="w-4 h-4 text-sky-300" />
                      <span className="font-semibold">Practical applications</span>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2 border-white/10 bg-white/5 text-white hover:bg-white/10" onClick={h.addPracticalApp}>
                      <Plus className="w-3 h-3" /> Add point
                    </Button>
                  </div>

                  {h.form.practicalApps.length === 0 ? (
                    <p className="text-sm text-slate-400 italic">No applications added yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {h.form.practicalApps.map((pa, i) => (
                        <div key={i} className="flex gap-2 items-start rounded-xl border border-white/10 bg-slate-950/40 p-3">
                          <span className="mt-2 w-6 text-right text-sm font-bold text-sky-300">{i + 1}.</span>
                          <Textarea
                            value={pa.applicationText}
                            onChange={(e) => h.updatePracticalApp(i, e.target.value)}
                            rows={2}
                            className="flex-1 resize-y border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                          />
                          <Button variant="ghost" size="icon" className="mt-1 text-red-300 hover:bg-red-500/10" onClick={() => h.removePracticalApp(i)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-white">
                      <LinkIcon className="w-4 h-4 text-sky-300" />
                      <span className="font-semibold">Cross references</span>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2 border-white/10 bg-white/5 text-white hover:bg-white/10" onClick={h.addCrossRef}>
                      <Plus className="w-3 h-3" /> Add ref
                    </Button>
                  </div>

                  {h.form.crossReferences.length === 0 ? (
                    <p className="text-sm text-slate-400 italic">No cross references added yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {h.form.crossReferences.map((cr, i) => (
                        <div key={i} className="rounded-xl border border-white/10 bg-slate-950/40 p-3">
                          <div className="flex flex-col gap-2 md:flex-row md:items-start">
                            <Input
                              placeholder="Book"
                              value={cr.bookName}
                              onChange={(e) => h.updateCrossRef(i, "bookName", e.target.value)}
                              className="flex-1 border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                            />
                            <Input
                              type="number"
                              placeholder="Ch"
                              value={cr.chapter || ""}
                              onChange={(e) => h.updateCrossRef(i, "chapter", parseInt(e.target.value) || 0)}
                              className="w-full border-white/10 bg-white/5 text-white placeholder:text-slate-500 md:w-20"
                            />
                            <Input
                              type="number"
                              placeholder="V"
                              value={cr.verseNumber || ""}
                              onChange={(e) => h.updateCrossRef(i, "verseNumber", parseInt(e.target.value) || 0)}
                              className="w-full border-white/10 bg-white/5 text-white placeholder:text-slate-500 md:w-20"
                            />
                            <Input
                              placeholder="Reference text"
                              value={cr.referenceText}
                              onChange={(e) => h.updateCrossRef(i, "referenceText", e.target.value)}
                              className="flex-1 border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                            />
                            <Button variant="ghost" size="icon" className="text-red-300 hover:bg-red-500/10" onClick={() => h.removeCrossRef(i)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          <Textarea
                            placeholder="Commentary"
                            value={cr.commentary}
                            onChange={(e) => h.updateCrossRef(i, "commentary", e.target.value)}
                            rows={2}
                            className="mt-3 border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-white">
                      <Tag className="w-4 h-4 text-sky-300" />
                      <span className="font-semibold">Key themes</span>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2 border-white/10 bg-white/5 text-white hover:bg-white/10" onClick={h.addTheme}>
                      <Plus className="w-3 h-3" /> Add theme
                    </Button>
                  </div>

                  {h.form.themes.length === 0 ? (
                    <p className="text-sm text-slate-400 italic">No themes added yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {h.form.themes.map((t, i) => (
                        <div key={i} className="flex gap-2 items-center rounded-xl border border-white/10 bg-slate-950/40 p-2">
                          <Input
                            className="flex-1 border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                            placeholder="e.g., Covenant Faithfulness"
                            value={t.themeName}
                            onChange={(e) => h.updateTheme(i, e.target.value)}
                          />
                          <Button variant="ghost" size="icon" className="text-red-300 hover:bg-red-500/10" onClick={() => h.removeTheme(i)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                  <Label className="text-base font-semibold text-white">Final thoughts</Label>
                  <Textarea
                    placeholder="Closing encouragement or application..."
                    value={h.form.studyMetadata.finalThoughts}
                    onChange={(e) => h.updateNested("studyMetadata", "finalThoughts", e.target.value)}
                    rows={4}
                    className="mt-2 resize-y border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-6 flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                {h.isValid ? "Ready to publish" : "Still gathering details"}
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                {currentStepIndex > 0 && (
                  <Button variant="outline" className="border-white/10 bg-white/5 text-slate-200 hover:bg-white/10" onClick={goPrevious}>
                    Back
                  </Button>
                )}

                {currentStepIndex < stepOrder.length - 1 ? (
                  <Button
                    onClick={goNext}
                    disabled={!canAdvanceFromCurrent}
                    className="gap-2 bg-sky-500 text-slate-950 hover:bg-sky-400 disabled:opacity-50"
                  >
                    Continue
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={h.handleSave}
                    disabled={!h.isValid || h.saving}
                    className="gap-2 bg-sky-500 text-slate-950 hover:bg-sky-400 disabled:opacity-50"
                  >
                    {h.saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {h.isEditMode ? "Save changes" : "Submit explanation"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddVerseExplanation;
