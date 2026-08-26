"use client";

/**
 * AddDailyExegesis — add/edit daily exegesis with all fields.
 * Fields: title, passageReference, teachingBody, introduction, contextSummary,
 *         application, prayer, tags, displayDate, isPublished
 */
import {
  Sparkles, Save, BookOpen,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { useAddDailyExegesis } from "../hooks/useAddDailyExegesis";
import { CollapsibleSection as Section } from "../components";

const AddDailyExegesis = () => {
  const h = useAddDailyExegesis();

  return (
    <div dir={h.isRtl ? "rtl" : "ltr"} className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-6 lg:p-10">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/daily-exegesis" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2">
            ← {h.t.common.back}
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center shadow-sm">
              <Sparkles className="h-7 w-7 text-accent" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gradient">
                {h.isEditing ? "Edit Exegesis" : "Add Daily Exegesis"}
              </h1>
              <p className="text-muted-foreground">Teach, explain, and apply Scripture with rich context</p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <Card className="border-border/40 shadow-md">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 pb-6">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Exegesis Details
            </CardTitle>
            <CardDescription>Provide the passage, teaching body, and supporting content</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <form onSubmit={h.handleSave} className="space-y-8">
              {/* 1. Title */}
              <Section title="Title">
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input value={h.title} onChange={(e) => h.setTitle(e.target.value)}
                    placeholder="Enter exegesis title..." className="text-lg" />
                </div>
              </Section>

              {/* 2. Passage Reference */}
              <Section title="Passage Reference">
                <div className="space-y-2">
                  <Label>Passage Reference *</Label>
                  <Input value={h.passageReference} onChange={(e) => h.setPassageReference(e.target.value)}
                    placeholder="e.g., Psalm 46:10, John 15:1-5, Romans 8:28-30" />
                  <p className="text-xs text-muted-foreground">The Bible passage this exegesis covers</p>
                </div>
              </Section>

              {/* 3. Teaching Body */}
              <Section title="Teaching Body">
                <div className="space-y-2">
                  <Label>Teaching Body *</Label>
                  <Textarea value={h.teachingBody} onChange={(e) => h.setTeachingBody(e.target.value)}
                    placeholder="Write the main teaching content — the expository explanation of the passage..."
                    rows={10} className="min-h-[250px] leading-relaxed resize-none" />
                </div>
              </Section>

              {/* 4. Introduction & Context */}
              <Section title="Introduction & Context" defaultOpen={false}>
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label>Introduction</Label>
                    <Textarea value={h.introduction} onChange={(e) => h.setIntroduction(e.target.value)}
                      placeholder="Introduce the passage, its purpose, and what the reader will learn..."
                      rows={4} className="resize-none" />
                  </div>
                  <div className="space-y-2">
                    <Label>Context Summary</Label>
                    <Textarea value={h.contextSummary} onChange={(e) => h.setContextSummary(e.target.value)}
                      placeholder="Describe the historical, literary, and theological context..."
                      rows={4} className="resize-none" />
                  </div>
                </div>
              </Section>

              {/* 5. Application & Prayer */}
              <Section title="Application & Prayer" defaultOpen={false}>
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label>Application</Label>
                    <Textarea value={h.application} onChange={(e) => h.setApplication(e.target.value)}
                      placeholder="How should readers apply this passage to their lives?"
                      rows={4} className="resize-none" />
                  </div>
                  <div className="space-y-2">
                    <Label>Prayer</Label>
                    <Textarea value={h.prayer} onChange={(e) => h.setPrayer(e.target.value)}
                      placeholder="Write a prayer inspired by this passage..."
                      rows={4} className="resize-none" />
                  </div>
                </div>
              </Section>

              {/* 6. Tags */}
              <Section title="Tags" defaultOpen={false}>
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <Input value={h.tags} onChange={(e) => h.setTags(e.target.value)}
                    placeholder="e.g., daily, exegesis, psalms, trust" />
                  <p className="text-xs text-muted-foreground">Comma-separated tags for categorization</p>
                </div>
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

              {/* Actions */}
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="ghost" asChild>
                  <Link to="/daily-exegesis">{h.t.common.cancel}</Link>
                </Button>
                <Button
                  type="submit"
                  disabled={h.saveDisabled}
                  className="bg-gradient-to-r from-primary to-primary/90 shadow-md"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {h.isEditing ? "Update Exegesis" : "Create Exegesis"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddDailyExegesis;
