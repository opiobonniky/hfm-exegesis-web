"use client";

/**
 * AddVerseExplanation — add/edit verse explanation with live preview.
 * State in useAddExplanation, UI in extracted components.
 */
import {
  ArrowLeft, BookOpen, Save, Loader2, ScrollText,
  Info, CheckCircle2, AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { useAddExplanation } from "../hooks/useAddExplanation";
import { CharCount, LivePreview, PromptSelector, ValidationChecklist, FormattingTips } from "../components";
import { BIBLE_BOOKS } from "@/features/Bible/constants";
import { routes } from "@/components/Routes/routes";
const BIBLE_VERSIONS = ["KJV", "NIV", "ESV", "NASB", "NLT", "NKJV", "CSB", "RSV", "ASV", "AMP", "MSG", "WEB"];
const AddVerseExplanation = () => {
  const h = useAddExplanation();
  const validationItems = [
    { label: h.t.verseExplanations.clBookSelected, ok: (h.bookName ?? "").trim() !== "" },
    { label: h.t.verseExplanations.clValidChapter, ok: h.chapter >= 1 },
    { label: h.t.verseExplanations.clValidVerse, ok: h.verseNumber >= 1 },
    { label: h.t.verseExplanations.clExplanationWords, ok: (h.explanation ?? "").trim().split(/\s+/).length >= 20 },
  ];
  return (
    <div dir={h.isRtl ? "rtl" : "ltr"} className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-6 lg:p-10">
      <div className="mx-auto space-y-6">
        {/* ── Page header ── */}
        <div className="fade-up flex items-center gap-4">
          <Link to={routes.verseExplanations.path} className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2">
            <ArrowLeft className="h-5 w-5" /> {h.t.common.back}
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shadow-sm">
              <ScrollText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gradient">
                {h.isEditMode
                  ? `${h.t.verseExplanations.editPageTitle?.split("{")[0] || "Edit"} ${h.qBook} ${h.qCh}:${h.qVn}`
                  : h.t.verseExplanations.addPageTitle}
              </h1>
              <p className="text-muted-foreground text-sm">
                {h.isEditMode ? h.t.verseExplanations.editPageSubtitle : h.t.verseExplanations.addPageSubtitle}
              </p>
          </div>
          {h.existingFound && (
            <Badge variant="outline" className="ml-auto gap-1.5 border-amber-300 bg-amber-50 text-amber-700">
              <AlertCircle className="w-3.5 h-3.5" /> {h.t.verseExplanations.existingBadge}
            </Badge>
          )}
        </div>
        {/* ── Two-column layout ── */}
        <div className="fade-up stagger-1 grid lg:grid-cols-[1fr_420px] gap-6 items-start">
          {/* LEFT: Form */}
          <div className="space-y-5">
            {/* Verse Reference */}
            <Card className="border-border/40 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 pb-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <BookOpen className="w-4 h-4 text-primary" /> {h.t.verseExplanations.refTitle}
                </CardTitle>
                <CardDescription>{h.t.verseExplanations.refDesc}</CardDescription>
              </CardHeader>
              <CardContent className="pt-5 space-y-4">
                <div className="space-y-1.5">
                  <Label>{h.t.verseExplanations.book}</Label>
                  <Select value={h.bookName || ""} onValueChange={(v) => { h.setBookName(v); }} disabled={h.isEditMode}>
                    <SelectTrigger className={cn(h.isEditMode && "bg-muted/40 text-muted-foreground")}>
                      <SelectValue placeholder={h.t.verseExplanations.selectBookPlaceholder} />
                    </SelectTrigger>
                    <SelectContent className="max-h-64">
                      {BIBLE_BOOKS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>{h.t.verseExplanations.chapter}</Label>
                    <Input type="number" min={1} max={150} value={h.chapter}
                      readOnly={h.isEditMode} className={cn(h.isEditMode && "bg-muted/40 text-muted-foreground")}
                      onChange={(e) => { h.setChapter(Math.max(1, parseInt(e.target.value) || 1)); }} onBlur={h.handleVerseBlur} />
                  </div>
                    <Label>{h.t.verseExplanations.verse}</Label>
                    <Input type="number" min={1} max={200} value={h.verseNumber}
                      onChange={(e) => { h.setVerseNumber(Math.max(1, parseInt(e.target.value) || 1)); }} onBlur={h.handleVerseBlur} />
                {h.verseText && (
                  <div className="space-y-2">
                    <Label>{h.t.verseExplanations.verseText} <span className="text-xs text-muted-foreground font-normal">{h.t.verseExplanations.verseTextHint}</span></Label>
                    <div className="relative">
                      <Textarea value={h.verseText} readOnly className="min-h-[110px] resize-none bg-muted/40 font-serif leading-relaxed" />
                      <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">{h.bookName} {h.chapter}:{h.verseNumber}</div>
                    </div>
                )}
                  <Label>{h.t.verseExplanations.bibleVersion} <span className="text-xs text-muted-foreground font-normal">{h.t.verseExplanations.optionalLabel}</span></Label>
                  <Select value={h.bibleVersion || h.NONE_VALUE} onValueChange={(v) => h.setBibleVersion(v === h.NONE_VALUE ? "" : v)}>
                    <SelectTrigger><SelectValue placeholder={h.t.verseExplanations.bibleVersionPlaceholder} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={h.NONE_VALUE}>{h.t.verseExplanations.noneOption}</SelectItem>
                      {BIBLE_VERSIONS.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                {h.loadingExisting && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> {h.t.verseExplanations.checkingExisting}
              </CardContent>
            </Card>
            {/* Explanation */}
                  <ScrollText className="w-4 h-4 text-primary" /> {h.t.verseExplanations.explanationTitle}
                <CardDescription>{h.t.verseExplanations.explanationDesc}</CardDescription>
              <CardContent className="pt-5 space-y-2">
                <div className="flex items-center justify-between">
                  <Label>{h.t.verseExplanations.explanationText}</Label>
                  <CharCount value={h.explanation} max={5000} />
                <Textarea rows={8} placeholder={h.t.verseExplanations.explanationPlaceholder}
                  value={h.explanation} onChange={(e) => h.setExplanation(e.target.value)}
                  maxLength={5000} className="resize-y font-mono text-sm leading-relaxed" />
                {(h.explanation ?? "").trim().length > 0 && (h.explanation ?? "").trim().length < 20 && (
                  <p className="text-xs text-amber-600 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" /> {h.t.verseExplanations.minCharsError}
                  </p>
            {/* Learn More */}
              <CardHeader className="bg-gradient-to-r from-amber-500/5 to-amber-400/5 pb-4">
                  {h.t.verseExplanations.learnMoreTitle}
                  <Badge variant="outline" className="text-xs font-normal border-amber-200 text-amber-600">{h.t.verseExplanations.learnMoreBadge}</Badge>
                <CardDescription className="mt-1">{h.t.verseExplanations.learnMoreDesc}</CardDescription>
                  <Label>{h.t.verseExplanations.learnMoreLabel}</Label>
                  <CharCount value={h.learnMore} max={8000} />
                <Textarea rows={6} placeholder={h.t.verseExplanations.learnMorePlaceholder}
                  value={h.learnMore} onChange={(e) => h.setLearnMore(e.target.value)}
                  maxLength={8000} className="resize-y font-mono text-sm leading-relaxed" />
            {/* Prompts */}
            <PromptSelector prompts={h.prompts} loading={h.promptsLoading}
              selectedIds={h.selectedPromptIds} onToggle={h.togglePrompt} t={h.t} />
            {/* Save */}
            <div className="flex items-center justify-between pt-2 pb-6">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Info className="w-3.5 h-3.5" />
                {h.existingFound ? h.t.verseExplanations.savingOverwrite : h.t.verseExplanations.savingCreate}
              </div>
              <Button onClick={h.handleSave} disabled={h.saving || !h.isValid || h.saved} size="lg"
                className={cn("gap-2 min-w-36", h.saved ? "bg-emerald-600 hover:bg-emerald-600" : "bg-gradient-to-r from-primary to-primary/80 shadow-md")}>
                {h.saved ? <><CheckCircle2 className="w-4 h-4" /> {h.t.verseExplanations.savedLabel}</>
                  : h.saving ? <><Loader2 className="w-4 h-4 animate-spin" /> {h.t.verseExplanations.savingLabel}</>
                    : <><Save className="w-4 h-4" /> {h.existingFound ? h.t.verseExplanations.updateExplanation : h.t.verseExplanations.saveExplanation}</>}
              </Button>
          {/* RIGHT: Preview */}
          <div className="space-y-4 lg:sticky lg:top-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{h.t.verseExplanations.appPreview}</span>
              <div className="flex-1 h-px bg-border/50" />
            <LivePreview bookName={h.bookName} chapter={h.chapter} verseNumber={h.verseNumber}
              bibleVersion={h.bibleVersion} explanation={h.explanation} learnMore={h.learnMore} t={h.t} />
            <FormattingTips t={h.t} />
            <ValidationChecklist items={validationItems} valid={h.isValid} t={h.t} />
      </div>
    </div>
  );
};
export default AddVerseExplanation;
