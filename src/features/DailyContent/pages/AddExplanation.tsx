"use client";

/**
 * AddVerseExplanation — add/edit verse explanation with live preview.
 * State in useAddExplanation, UI in extracted components.
 * Single root div — pure compositor.
 */
import { BookOpen, Save, Loader2, ScrollText, Info, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useAddExplanation } from "../hooks/useAddExplanation";
import {
  CharCount, LivePreview, PromptSelector, ValidationChecklist, FormattingTips,
  PageContentWrapper, FormField, FormSectionCard, FormTwoColumn,
  VerseTextPreview, LivePreviewPanel, SaveActionsRow, DailyContentPageHeader,
  InlineLoadingIndicator, FieldLabelWithCounter, InlineWarning, FormGrid,
} from "../components";
import { BIBLE_BOOKS } from "@/features/Bible/constants";
import { BIBLE_VERSIONS } from "../constants";
import { routes } from "@/components/Routes/routes";

const AddVerseExplanation = () => {
  const h = useAddExplanation();

  const validationItems = [
    { label: h.t.verseExplanations.clBookSelected, ok: (h.bookName ?? "").trim() !== "" },
    { label: h.t.verseExplanations.clValidChapter, ok: h.chapter >= 1 },
    { label: h.t.verseExplanations.clValidVerse, ok: h.verseNumber >= 1 },
    { label: h.t.verseExplanations.clExplanationWords, ok: (h.explanation ?? "").trim().split(/\s+/).length >= 20 },
  ];

  return (
    <PageContentWrapper isRtl={h.isRtl} maxWidth="mx-auto space-y-6">
      <DailyContentPageHeader
        backTo={routes.verseExplanations.path}
        backLabel={h.t.common.back}
        icon={ScrollText}
        title={h.isEditMode
          ? `${h.t.verseExplanations.editPageTitle?.split("{")[0] || "Edit"} ${h.qBook} ${h.qCh}:${h.qVn}`
          : h.t.verseExplanations.addPageTitle}
        subtitle={h.isEditMode ? h.t.verseExplanations.editPageSubtitle : h.t.verseExplanations.addPageSubtitle}
        rightElement={h.existingFound ? (
          <Badge variant="outline" className="ml-auto gap-1.5 border-amber-300 bg-amber-50 text-amber-700">
            <AlertCircle className="w-3.5 h-3.5" /> {h.t.verseExplanations.existingBadge}
          </Badge>
        ) : undefined}
      />

      <FormTwoColumn
        left={
          <>
            <FormSectionCard icon={BookOpen} title={h.t.verseExplanations.refTitle} description={h.t.verseExplanations.refDesc}>
              <FormField label={h.t.verseExplanations.book}>
                <Select value={h.bookName || ""} onValueChange={(v) => { h.setBookName(v); }} disabled={h.isEditMode}>
                  <SelectTrigger className={cn(h.isEditMode && "bg-muted/40 text-muted-foreground")}>
                    <SelectValue placeholder={h.t.verseExplanations.selectBookPlaceholder} />
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    {BIBLE_BOOKS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FormField>
              <FormGrid columns={2}>
                <FormField label={h.t.verseExplanations.chapter}>
                  <Input type="number" min={1} max={150} value={h.chapter}
                    readOnly={h.isEditMode} className={cn(h.isEditMode && "bg-muted/40 text-muted-foreground")}
                    onChange={(e) => { h.setChapter(Math.max(1, parseInt(e.target.value) || 1)); }} onBlur={h.handleVerseBlur} />
                </FormField>
                <FormField label={h.t.verseExplanations.verse}>
                  <Input type="number" min={1} max={200} value={h.verseNumber}
                    onChange={(e) => { h.setVerseNumber(Math.max(1, parseInt(e.target.value) || 1)); }} onBlur={h.handleVerseBlur} />
                </FormField>
              </FormGrid>
              {h.verseText && (
                <VerseTextPreview
                  verseText={h.verseText} bookName={h.bookName ?? ""} chapter={h.chapter} verseNumber={h.verseNumber}
                  verseTextLabel={h.t.verseExplanations.verseText} verseTextHint={h.t.verseExplanations.verseTextHint}
                />
              )}
              <FormField label={h.t.verseExplanations.bibleVersion} optional>
                <Select value={h.bibleVersion || h.NONE_VALUE} onValueChange={(v) => h.setBibleVersion(v === h.NONE_VALUE ? "" : v)}>
                  <SelectTrigger><SelectValue placeholder={h.t.verseExplanations.bibleVersionPlaceholder} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={h.NONE_VALUE}>{h.t.verseExplanations.noneOption}</SelectItem>
                    {BIBLE_VERSIONS.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FormField>
              {h.loadingExisting && <InlineLoadingIndicator text={h.t.verseExplanations.checkingExisting} />}
            </FormSectionCard>

            <FormSectionCard icon={ScrollText} title={h.t.verseExplanations.explanationTitle} description={h.t.verseExplanations.explanationDesc}>
              <FieldLabelWithCounter label={h.t.verseExplanations.explanationText} counter={<CharCount value={h.explanation} max={5000} />} />
              <Textarea rows={8} placeholder={h.t.verseExplanations.explanationPlaceholder}
                value={h.explanation} onChange={(e) => h.setExplanation(e.target.value)}
                maxLength={5000} className="resize-y font-mono text-sm leading-relaxed" />
              {(h.explanation ?? "").trim().length > 0 && (h.explanation ?? "").trim().length < 20 && (
                <InlineWarning message={h.t.verseExplanations.minCharsError} />
              )}
            </FormSectionCard>

            <FormSectionCard icon={Info} title={h.t.verseExplanations.learnMoreTitle} variant="amber" description={h.t.verseExplanations.learnMoreDesc}>
              <FieldLabelWithCounter label={h.t.verseExplanations.learnMoreLabel} counter={<CharCount value={h.learnMore} max={8000} />} />
              <Textarea rows={6} placeholder={h.t.verseExplanations.learnMorePlaceholder}
                value={h.learnMore} onChange={(e) => h.setLearnMore(e.target.value)}
                maxLength={8000} className="resize-y font-mono text-sm leading-relaxed" />
            </FormSectionCard>

            <PromptSelector prompts={h.prompts} loading={h.promptsLoading}
              selectedIds={h.selectedPromptIds} onToggle={h.togglePrompt} t={h.t} />

            <SaveActionsRow
              infoText={h.existingFound ? h.t.verseExplanations.savingOverwrite : h.t.verseExplanations.savingCreate}
              infoIcon={<Info className="w-3.5 h-3.5" />}
            >
              <Button onClick={h.handleSave} disabled={h.saving || !h.isValid || h.saved} size="lg"
                className={cn("gap-2 min-w-36", h.saved ? "bg-emerald-600 hover:bg-emerald-600" : "bg-gradient-to-r from-primary to-primary/80 shadow-md")}>
                {h.saved ? <><CheckCircle2 className="w-4 h-4" /> {h.t.verseExplanations.savedLabel}</>
                  : h.saving ? <><Loader2 className="w-4 h-4 animate-spin" /> {h.t.verseExplanations.savingLabel}</>
                    : <><Save className="w-4 h-4" /> {h.existingFound ? h.t.verseExplanations.updateExplanation : h.t.verseExplanations.saveExplanation}</>}
              </Button>
            </SaveActionsRow>
          </>
        }
        right={
          <LivePreviewPanel label={h.t.verseExplanations.appPreview}>
            <LivePreview bookName={h.bookName} chapter={h.chapter} verseNumber={h.verseNumber}
              bibleVersion={h.bibleVersion} explanation={h.explanation} learnMore={h.learnMore} t={h.t} />
            <FormattingTips t={h.t} />
            <ValidationChecklist items={validationItems} valid={h.isValid} t={h.t} />
          </LivePreviewPanel>
        }
      />
    </PageContentWrapper>
  );
};

export default AddVerseExplanation;
