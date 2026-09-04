// VerseExplanationDetail — modern responsive admin detail layout
"use client";

import { useEffect, useRef, useState } from "react";
import { sendPostRequest } from "@/services/api";

import {
  BookOpen,
  Lightbulb,
  Edit2,
  Globe,
  Tag,
  Link as LinkIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface Props {
  item: any;
}

export function VerseExplanationDetailContent({ item }: Props) {
  if (!item) return null;

  const {
    bookName,
    chapter,
    verseNumber,
    bibleVersion,
    isPublished,
    exegesis,
    studyMetadata,
    wordStudies,
    practicalApps,
    crossReferences,
    themes,
  } = item;

  // feed: holds the current explanation plus any appended explanations loaded as the user scrolls
  const [feed, setFeed] = useState<any[]>([item]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // reset feed when the prop item changes (navigating to another explanation)
  useEffect(() => {
    setFeed([item]);
    setHasMore(true);
  }, [item]);

  // observer to load next explanation when sentinel is visible
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (
            entry.isIntersecting &&
            !loadingMore &&
            hasMore
          ) {
            loadNextExplanation();
          }
        });
      },
      { root: null, rootMargin: "300px", threshold: 0.1 },
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [sentinelRef, loadingMore, hasMore, feed]);

  // fetch the next verse explanation (naive: increment verseNumber)
  const loadNextExplanation = async () => {
    if (loadingMore) return;
    const last = feed[feed.length - 1];
    if (!last) return setHasMore(false);
    setLoadingMore(true);

    // naive next verse: +1; if not found we stop (could be improved to advance chapter)
    const nextVerse = Number(last.verseNumber) + 1;
    try {
      const res = await sendPostRequest("bible", "get-verse-explanation", {
        bookName: last.bookName,
        chapter: last.chapter,
        verseNumber: nextVerse,
      });

      if (res?.returnCode === 200 && res.returnData) {
        const d = res.returnData;
        // avoid duplicates
        const exists = feed.find((f) => f.bookName === d.bookName && Number(f.chapter) === Number(d.chapter) && Number(f.verseNumber) === Number(d.verseNumber));
        if (!exists) setFeed((s) => [...s, d]);
      } else {
        // no more contiguous verses found — stop further automatic fetches
        setHasMore(false);
      }
    } catch (e) {
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="w-full mx-auto py-8 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left column: meta + actions */}
        <aside className="lg:col-span-1">
          <div className="sticky top-6 space-y-4">
            <Card className="overflow-visible">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <CardTitle className="text-sm">Reference</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-lg font-bold">
                    {bookName} {chapter}:{verseNumber}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {bibleVersion || "BSB"}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant={isPublished ? "default" : "secondary"}>
                      {isPublished ? "Published" : "Draft"}
                    </Badge>
                    <Badge variant="outline" className="text-xs font-mono">
                      ID: {item.id}
                    </Badge>
                  </div>

                  <Separator className="my-3" />

                  <div className="flex flex-col gap-2">
                    <Button
                      variant="secondary"
                      onClick={() =>
                        (window.location.href = `/admin/edit-verse-explanation/${encodeURIComponent(bookName)}/${chapter}/${verseNumber}`)
                      }
                    >
                      <Edit2 className="w-4 h-4 mr-2" /> Edit
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() =>
                        navigator.clipboard?.writeText(
                          `${bookName} ${chapter}:${verseNumber} — ${bibleVersion || "BSB"}`,
                        )
                      }
                    >
                      Copy reference
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-primary" />
                  <CardTitle className="text-sm">Study Info</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-foreground/90 leading-relaxed">
                  <p>
                    <strong>Introduction:</strong>
                  </p>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    {studyMetadata?.introduction || "—"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-primary" />
                  <CardTitle className="text-sm">Themes</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {themes && themes.length > 0 ? (
                    themes.map((t: any, i: number) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        className="px-2 py-0.5 text-xs"
                      >
                        {t.themeName}
                      </Badge>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      No themes
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </aside>

        {/* Right column: main content stacked vertically */}
        <main className="lg:col-span-3 space-y-6">
          {/* Header */}
          <div className="bg-card p-6 rounded-xl border">
            <div className="flex items-start justify-between gap-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-serif font-bold">
                  {bookName} {chapter}:{verseNumber}
                </h1>
                <div className="text-sm text-muted-foreground">
                  {bibleVersion || "BSB"}
                </div>
                {item.verseText && (
                  <blockquote className="mt-3 italic text-foreground/80 border-l-2 border-primary/30 pl-4 text-base leading-7 md:max-w-2xl">
                    “{item.verseText}”
                  </blockquote>
                )}
              </div>
              <div className="flex items-start gap-3">
                <Button
                  onClick={() =>
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }
                  variant="outline"
                >
                  Top
                </Button>
                <Button
                  onClick={() =>
                    (window.location.href = `/admin/edit-verse-explanation/${encodeURIComponent(bookName)}/${chapter}/${verseNumber}`)
                  }
                >
                  <Edit2 className="w-4 h-4 mr-2" /> Edit
                </Button>
              </div>
            </div>
          </div>

          {/* Theological Explanation */}
          <article className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <Lightbulb className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">
                  Theological Explanation
                </h2>
              </div>

              <div className="prose prose-stone dark:prose-invert max-w-none text-base text-foreground/90 leading-7 space-y-4 prose-p:my-0 prose-headings:scroll-mt-4">
                {exegesis?.explanationText
                  ?.split("\n")
                  .map((p: string, i: number) => (
                    <p key={i}>{p}</p>
                  ))}
              </div>

              <div className="mt-8">
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                  Application
                </h3>
                <div className="p-5 rounded-lg bg-primary/5 border border-primary/10 text-base italic text-foreground/80 leading-7">
                  {exegesis?.applicationText || "No application provided."}
                </div>
              </div>
            </div>
          </article>

          {/* Word Studies */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card rounded-xl border p-4">
              <h3 className="text-sm font-semibold mb-3 uppercase tracking-wide">
                Strong's Word Studies
              </h3>
              <div className="space-y-3">
                {wordStudies && wordStudies.length > 0 ? (
                  wordStudies.map((ws: any, i: number) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-md border bg-background"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="font-semibold">{ws.surfaceText}</div>
                        <Badge
                          variant="outline"
                          className="text-[10px] font-mono"
                        >
                          {ws.strongsId}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground leading-relaxed">
                        {ws.customDefinition || "—"}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground italic">
                    No word studies.
                  </div>
                )}
              </div>
            </div>

            <div className="bg-card rounded-xl border p-4">
              <h3 className="text-sm font-semibold mb-3 uppercase tracking-wide">Cross References</h3>
              <div className="space-y-3">
                {crossReferences && crossReferences.length > 0 ? (
                  crossReferences.map((cr: any, i: number) => (
                    <div key={i} className="p-3.5 rounded-md border bg-muted/10">
                      <div className="text-xs font-semibold text-primary mb-1">
                        {cr.bookName} {cr.chapter}:{cr.verseNumber}
                      </div>
                      <div className="text-sm italic text-foreground/70 leading-relaxed">
                        {cr.referenceText}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                        {cr.commentary}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground italic">
                    No cross references.
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Practical Apps & Takeaways */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card rounded-xl border p-4">
              <h3 className="text-sm font-semibold mb-3 uppercase tracking-wide">
                Practical Applications
              </h3>
              <ol className="list-decimal list-inside space-y-2.5 text-sm text-foreground/90 leading-relaxed">
                {practicalApps && practicalApps.length > 0 ? (
                  practicalApps.map((pa: any, i: number) => (
                    <li key={i}>{pa.applicationText}</li>
                  ))
                ) : (
                  <li className="italic text-muted-foreground">
                    No applications listed.
                  </li>
                )}
              </ol>
            </div>

            <div className="bg-primary/5 rounded-xl border p-4">
              <h3 className="text-sm font-semibold mb-3 uppercase tracking-wide">
                Final Thoughts & Takeaways
              </h3>
              <div className="text-sm text-foreground/80 italic leading-relaxed mb-4">
                {studyMetadata?.finalThoughts || "—"}
              </div>
              <ol className="list-decimal list-inside space-y-2.5 text-sm text-foreground/90 leading-relaxed">
                {(
                  item.takeaways ||
                  (studyMetadata?.takeaways as string[]) ||
                  []
                ).length > 0 ? (
                  (
                    item.takeaways ||
                    (studyMetadata?.takeaways as string[]) ||
                    []
                  ).map((t: string, i: number) => <li key={i}>{t}</li>)
                ) : (
                  <>
                    <li>Remember God’s faithfulness and give thanks.</li>
                    <li>Call upon the LORD with dependence and prayer.</li>
                    <li>Make God’s deeds known through faithful witness.</li>
                  </>
                )}
              </ol>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
