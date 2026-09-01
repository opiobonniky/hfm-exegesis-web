"use client";

/**
 * AddDailyDevotion — add/edit daily devotion with all rich content fields.
 * Matches the app's AddDailyDevotion screen fields.
 */
import {
  Sun, BookOpen,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Combobox } from "@/components/ui/combobox";
import { format } from "date-fns";
import { useAddDailyDevotion } from "../hooks/useAddDailyDevotion";
import { StructuredContentSection, CollapsibleSection as Section, DailyContentPageHeader, DailyContentFormActions } from "../components";

const AddDailyDevotion = () => {
  const h = useAddDailyDevotion();

  return (
    <div dir={h.isRtl ? "rtl" : "ltr"} className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-6 lg:p-10">
      <div className="max-w-4xl mx-auto space-y-8">
        <DailyContentPageHeader
          backTo="/daily-devotions"
          backLabel={h.t.common.back}
          icon={Sun}
          title={h.isEditing ? "Edit Devotion" : h.t.devotions.addDevotion}
          subtitle={h.t.devotions.addPageSubtitle}
        />

        {/* Form Card */}
        <Card className="border-border/40 shadow-md">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 pb-6">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              {h.t.devotions.devotionDetails}
            </CardTitle>
            <CardDescription>{h.t.devotions.devotionDetailsDesc}</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <form onSubmit={h.handleSave} className="space-y-8">
              {/* 1. Title */}
              <Section title="Devotion Title">
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input value={h.title} onChange={(e) => h.setTitle(e.target.value)}
                    placeholder="Enter devotion title..." className="text-lg" />
                </div>
              </Section>

              {/* 2. Content */}
              <Section title="Devotion Content">
                <div className="space-y-2">
                  <Label>Content *</Label>
                  <Textarea value={h.content} onChange={(e) => h.setContent(e.target.value)}
                    placeholder="Write your devotional message..."
                    className="min-h-[200px] leading-relaxed resize-none" />
                </div>
              </Section>

              {/* 3. Bible Reference */}
              <Section title="Optional Bible Reference" defaultOpen={false}>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Testament</Label>
                    <Combobox
                      options={[{ value: "Old", label: h.t.dailyVerse.oldTestament }, { value: "New", label: h.t.dailyVerse.newTestament }]}
                      value={h.testament} onChange={h.setTestament}
                      placeholder={h.t.devotions.selectTestament} width="w-full" />
                  </div>
                  <div className="space-y-2">
                    <Label>Book</Label>
                    <Combobox options={h.books.map((b) => ({ value: b, label: b }))}
                      value={h.book} onChange={h.setBook} placeholder={h.t.dailyVerse.selectBook}
                      disabled={!h.testament} width="w-full" />
                  </div>
                  <div className="space-y-2">
                    <Label>Chapter</Label>
                    <Combobox options={h.chapters.map((c) => ({ value: String(c), label: String(c) }))}
                      value={h.chapter} onChange={h.setChapter} placeholder={h.t.dailyVerse.selectChapter}
                      disabled={!h.book} width="w-full" />
                  </div>
                  <div className="space-y-2">
                    <Label>Verse</Label>
                    <Input type="number" value={h.verseNumber} onChange={(e) => h.setVerseNumber(e.target.value)}
                      placeholder="Verse #" disabled={!h.chapter} min={1} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Bible Version</Label>
                  <Combobox
                    options={[{ value: "BSB", label: "BSB (Berean Study Bible)" }, { value: "KJV", label: "KJV (King James)" }, { value: "ESV", label: "ESV" }, { value: "NIV", label: "NIV" }]}
                    value={h.bibleVersion} onChange={h.setBibleVersion}
                    placeholder="Select version" width="w-full" />
                </div>
                {h.verseText && (
                  <div className="rounded-lg bg-muted/30 border border-border/40 p-4">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">Verse Preview:</p>
                    <p className="text-sm italic text-foreground/80">"{h.verseText}"</p>
                  </div>
                )}
              </Section>

              {/* 4. Rich Content (required) */}
              <Section title="Content Fields">
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label>Explanation</Label>
                    <Textarea value={h.explanation} onChange={(e) => h.setExplanation(e.target.value)}
                      placeholder={h.t.devotions.contentPlaceholder || "Explain the heart of this devotion and its key message..."}
                      rows={5} className="resize-none" />
                  </div>
                  <div className="space-y-2">
                    <Label>Application</Label>
                    <Textarea value={h.application} onChange={(e) => h.setApplication(e.target.value)}
                      placeholder={h.t.devotions.contentPlaceholder || "How should readers respond and apply this to daily life?"}
                      rows={4} className="resize-none" />
                  </div>
                  <div className="space-y-2">
                    <Label>Introduction</Label>
                    <Textarea value={h.verseIntroduction} onChange={(e) => h.setVerseIntroduction(e.target.value)}
                      placeholder="Introduce the devotion, the verse, and its central purpose..."
                      rows={4} className="resize-none" />
                  </div>
                  <div className="space-y-2">
                    <Label>Learn More <span className="text-xs text-muted-foreground">(optional)</span></Label>
                    <Textarea value={h.learnMore} onChange={(e) => h.setLearnMore(e.target.value)}
                      placeholder="Additional resources, related verses, or deeper insights..."
                      rows={4} className="resize-none" />
                  </div>
                </div>
              </Section>

              {/* 5. Background */}
              <Section title="Background" defaultOpen={false}>
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label>Author</Label>
                    <Textarea value={h.backgroundAuthor} onChange={(e) => h.setBackgroundAuthor(e.target.value)}
                      placeholder="Who wrote the book and why does that matter?"
                      rows={3} className="resize-none" />
                  </div>
                  <div className="space-y-2">
                    <Label>Book</Label>
                    <Textarea value={h.backgroundBook} onChange={(e) => h.setBackgroundBook(e.target.value)}
                      placeholder="Summarize the book and its major purpose..."
                      rows={3} className="resize-none" />
                  </div>
                  <div className="space-y-2">
                    <Label>Context</Label>
                    <Textarea value={h.backgroundContext} onChange={(e) => h.setBackgroundContext(e.target.value)}
                      placeholder="Describe the immediate historical and literary context..."
                      rows={3} className="resize-none" />
                  </div>
                </div>
              </Section>

              {/* 6. Structured content */}
              <Section title="Rich Content" defaultOpen={false}>
                <StructuredContentSection
                  wordStudies={h.wordStudies} setWordStudies={h.setWordStudies}
                  practicalApplications={h.practicalApplications} setPracticalApplications={h.setPracticalApplications}
                  keyThemes={h.keyThemes} setKeyThemes={h.setKeyThemes}
                  crossReferences={h.crossReferences} setCrossReferences={h.setCrossReferences}
                  finalThoughts={h.finalThoughts} setFinalThoughts={h.setFinalThoughts}
                  takeaways={h.takeaways} setTakeaways={h.setTakeaways}
                  isRtl={h.isRtl}
                />
              </Section>

              {/* 7. Date/Time + Publish */}
              <Section title="Schedule & Publish">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Published</Label>
                      <p className="text-xs text-muted-foreground">Show to all users</p>
                    </div>
                    <Switch checked={h.published} onCheckedChange={h.setPublished} />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Date *</Label>
                      <Input type="date" value={format(h.selectedDate, "yyyy-MM-dd")}
                        onChange={(e) => {
                          const d = new Date(e.target.value);
                          d.setHours(h.selectedDate.getHours(), h.selectedDate.getMinutes(), 0, 0);
                          h.setSelectedDate(d);
                        }} />
                    </div>
                    <div className="space-y-2">
                      <Label>Time</Label>
                      <Input type="time" value={h.selectedTime} onChange={h.handleTimeChange} />
                    </div>
                  </div>
                </div>
              </Section>

              <DailyContentFormActions
                cancelTo="/daily-devotions"
                cancelLabel={h.t.common.cancel}
                saveLabel={h.isEditing ? "Update Devotion" : h.t.devotions.saveDevotion}
                disabled={h.saveDisabled}
                onSave={h.handleSave}
              />
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddDailyDevotion;
