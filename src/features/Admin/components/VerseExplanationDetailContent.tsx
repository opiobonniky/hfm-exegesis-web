// VerseExplanationDetail — Structured view of a verse explanation
"use client";

import { BookOpen, Lightbulb, Target, Tag, Link as LinkIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface Props {
  item: any;
}

export function VerseExplanationDetailContent({ item }: Props) {
  if (!item) return null;

  const {
    bookName, chapter, verseNumber, bibleVersion,
    exegesis, studyMetadata, wordStudies, practicalApps, crossReferences, themes
  } = item;

  return (
    <div className="space-y-10 pb-10">
      {/* SECTION 1: Mention the Verse */}
      <section className="text-center space-y-4 py-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
          <BookOpen className="w-3 h-3" /> Verse Study
        </div>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
          {bookName} {chapter}:{verseNumber} <span className="text-muted-foreground text-xl font-sans">({bibleVersion || "BSB"})</span>
        </h1>
        <div className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground italic leading-relaxed px-4">
          {/* This would ideally be fetched from the Bible API, but for now we show the reference */}
          "The sacred text of the verse would be rendered here..."
        </div>
      </section>

      <Separator />

      {/* SECTION 2: Explanation & Application */}
      <section className="space-y-8">
        <div className="flex items-center gap-2 text-primary font-bold text-xl">
          <Lightbulb className="w-6 h-6" />
          <h2>Theological Explanation</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="prose prose-stone dark:prose-invert max-w-none text-foreground/90 leading-relaxed text-lg">
              {exegesis?.explanationText?.split('\n').map((para, i) => (
                <p key={i} className="mb-4">{para}</p>
              ))}
            </div>
          </div>
          
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-tight text-primary flex items-center gap-2">
                <Target className="w-4 h-4" /> Practical Application
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-foreground/80 italic">
                {exegesis?.applicationText || "No application provided for this verse."}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator />

      {/* SECTION 3: Learn More */}
      <section className="space-y-12">
        <div className="flex items-center gap-2 text-primary font-bold text-xl">
          <BookOpen className="w-6 h-6" />
          <h2>Study Guide</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Introduction & Background */}
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-sm font-bold uppercase text-muted-foreground tracking-wider">Verse Introduction</h3>
              <p className="text-foreground/80 leading-relaxed">{studyMetadata?.introduction || "No introduction available."}</p>
            </div>
            
            <div className="p-4 rounded-2xl bg-muted/50 border space-y-3">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-xs font-bold uppercase text-muted-foreground">Contextual Background</span>
              </div>
              <div className="space-y-2 text-sm">
                <p><span className="font-bold">Author:</span> {studyMetadata?.backgroundAuthor || "Unknown"}</p>
                <p><span className="font-bold">Book:</span> {studyMetadata?.backgroundBook || "Unknown"}</p>
                <p><span className="font-bold">Context:</span> {studyMetadata?.backgroundContext || "Unknown"}</p>
              </div>
            </div>
          </div>

          {/* Word Studies */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase text-muted-foreground tracking-wider">Strong Concordance Word Study</h3>
            <div className="space-y-3">
              {wordStudies && wordStudies.length > 0 ? (
                wordStudies.map((ws, i) => (
                  <div key={i} className="p-3 rounded-xl border bg-card shadow-sm hover:border-primary/30 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-foreground">{ws.surfaceText}</span>
                      <Badge variant="outline" className="text-[10px] font-mono">{ws.strongsId}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {ws.customDefinition || "No specific definition provided."}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground italic">No word studies available.</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Applications & Themes */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-2">
                <Target className="w-4 h-4" /> Practical Applications
              </h3>
              <ul className="space-y-3">
                {practicalApps && practicalApps.length > 0 ? (
                  practicalApps.map((pa, i) => (
                    <li key={i} className="flex gap-3 text-sm text-foreground/80 leading-relaxed">
                      <span className="font-bold text-primary">{i + 1}.</span>
                      {pa.applicationText}
                    </li>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground italic">No applications listed.</p>
                )}
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-2">
                <Tag className="w-4 h-4" /> Key Themes
              </h3>
              <div className="flex flex-wrap gap-2">
                {themes && themes.length > 0 ? (
                  themes.map((t, i) => (
                    <Badge key={i} variant="secondary" className="px-2 py-0.5 text-xs font-medium">
                      {t.themeName}
                    </Badge>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground italic">No themes listed.</p>
                )}
              </div>
            </div>
          </div>

          {/* Cross References */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-2">
              <LinkIcon className="w-4 h-4" /> Cross References
            </h3>
            <div className="space-y-4">
              {crossReferences && crossReferences.length > 0 ? (
                crossReferences.map((cr, i) => (
                  <div key={i} className="p-3 rounded-xl border bg-muted/20">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-primary">{cr.bookName} {cr.chapter}:{cr.verseNumber}</span>
                    </div>
                    <p className="text-xs italic text-foreground/70 mb-2 leading-relaxed">
                      "{cr.referenceText}"
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {cr.commentary}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground italic">No cross references available.</p>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 space-y-4">
          <h3 className="text-sm font-bold uppercase text-primary tracking-wider text-center">Final Thoughts</h3>
          <p className="text-center text-foreground/80 leading-relaxed italic max-w-2xl mx-auto">
            {studyMetadata?.finalThoughts || "No final thoughts provided."}
          </p>
        </div>
      </section>
    </div>
  );
}
