"use client";

/**
 * AddDailyDevotion — add a new daily devotion with Bible reference.
 * State in useAddDailyDevotion hook, UI composed of reusable components.
 */
import { Sun, Save, ArrowLeft, Lightbulb, Clock, CalendarIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Combobox } from "@/components/ui/combobox";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { useAddDailyDevotion } from "../hooks/useAddDailyDevotion";

const AddDailyDevotion = () => {
  const h = useAddDailyDevotion();

  return (
    <div className="min-h-screen bg-background p-6 lg:p-8" dir={h.isRtl ? "rtl" : "ltr"}>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/daily-devotions" className="flex items-center gap-2">
              <ArrowLeft className="h-5 w-5" /> {h.t.common.back}
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center shadow-sm">
              <Sun className="h-7 w-7 text-accent" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gradient">{h.t.devotions.addDevotion}</h1>
              <p className="text-muted-foreground">{h.t.devotions.addPageSubtitle}</p>
            </div>
          </div>
        </div>

        <Card className="fade-up stagger-1 border-border/40 shadow-md">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 pb-6">
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" /> {h.t.devotions.devotionDetails}
            </CardTitle>
            <CardDescription>{h.t.devotions.devotionDetailsDesc}</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-8">
            <form onSubmit={h.handleSave} className="space-y-7">
              {/* Title */}
              <div className="space-y-2">
                <Label>{h.t.common.title} *</Label>
                <Input value={h.title} onChange={(e) => h.setTitle(e.target.value)} placeholder={h.t.devotions.titlePlaceholder} className="text-lg" />
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label>{h.t.common.content} *</Label>
                <Textarea value={h.content} onChange={(e) => h.setContent(e.target.value)} placeholder={h.t.devotions.contentPlaceholder} className="min-h-[300px] leading-relaxed" />
              </div>

              {/* Bible Reference */}
              <div className="space-y-3">
                <Label className="text-muted-foreground">{h.t.devotions.optionalBibleReference}</Label>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  <div className="space-y-2">
                    <Label>{h.t.devotions.testament}</Label>
                    <Combobox
                      options={[{ value: "Old", label: h.t.dailyVerse.oldTestament }, { value: "New", label: h.t.dailyVerse.newTestament }]}
                      value={h.testament} onChange={h.setTestament}
                      placeholder={h.t.devotions.selectTestament} width="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{h.t.dailyVerse.book}</Label>
                    <Combobox options={h.books.map((b) => ({ value: b, label: b }))}
                      value={h.book} onChange={h.setBook} placeholder={h.t.dailyVerse.selectBook} disabled={!h.testament} width="w-full" />
                  </div>
                  <div className="space-y-2">
                    <Label>{h.t.dailyVerse.chapter}</Label>
                    <Combobox options={h.chapters.map((c) => ({ value: String(c), label: String(c) }))}
                      value={h.chapter} onChange={h.setChapter} placeholder={h.t.dailyVerse.selectChapter} disabled={!h.book} width="w-full" />
                  </div>
                  <div className="space-y-2">
                    <Label>{h.t.dailyVerse.verse}</Label>
                    <Input type="number" value={h.verseNumber} onChange={(e) => h.setVerseNumber(e.target.value)}
                      placeholder="Verse #" disabled={!h.chapter} min={1} />
                  </div>
                </div>
                {h.book && h.chapter && h.verseNumber && (
                  <p className="text-sm text-muted-foreground">{h.book} {h.chapter}:{h.verseNumber}</p>
                )}
              </div>

              {/* Date + Time */}
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>{h.t.devotions.displayDate} *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !h.selectedDate && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {h.selectedDate ? format(h.selectedDate, "PPP") : h.t.devotions.pickDate}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={h.selectedDate} onSelect={(d) => d && h.setSelectedDate(d)} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>{h.t.devotions.displayTime}</Label>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <Input type="time" value={h.selectedTime} onChange={h.handleTimeChange} className="flex-1" />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-4 pt-4">
                <Button variant="outline" asChild><Link to="/daily-devotions">{h.t.common.cancel}</Link></Button>
                <Button type="submit" className="gap-2"><Save className="w-4 h-4" /> {h.t.devotions.saveDevotion}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddDailyDevotion;
