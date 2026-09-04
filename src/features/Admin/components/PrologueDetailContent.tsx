// PrologueDetailContent — renders all prologue fields as beautiful sections
"use client";

import {
  ScrollText, User, MapPin, Calendar, BookOpen, Target,
  MessageCircle, Lightbulb, Users, BookMarked, Quote, Church,
  Sparkles, GraduationCap, Landmark, Layers,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BookPrologueDetail } from "../hooks/useBookPrologueDetail";

export function PrologueDetailContent({ item }: { item: BookPrologueDetail }) {
  const p = item;
  return (
    <>
      {/* Title card */}
      <Card className="shadow-sm">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
              <ScrollText className="w-7 h-7" />
            </div>
            <div className="min-w-0">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                {p.title || p.bookName}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {p.author && (
                  <Badge variant="outline" className="gap-1.5 text-xs">
                    <User className="w-3 h-3" /> {p.author}
                  </Badge>
                )}
                {p.chapters != null && (
                  <Badge variant="secondary" className="gap-1.5 text-xs">
                    <BookOpen className="w-3 h-3" /> {p.chapters} chapters
                  </Badge>
                )}
                {p.audience && (
                  <Badge variant="outline" className="text-xs">{p.audience}</Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Narrative long-form sections in a nicely spaced flow */}
      {p.authorDetail && (
        <LongTextCard
          icon={<User className="w-4 h-4" />}
          title="About the Author"
          accent="sky"
        >
          {p.authorDetail}
        </LongTextCard>
      )}

      {p.summary && (
        <LongTextCard
          icon={<MessageCircle className="w-4 h-4" />}
          title="Summary"
          accent="indigo"
        >
          {p.summary}
        </LongTextCard>
      )}

      {p.purpose && (
        <LongTextCard
          icon={<Target className="w-4 h-4" />}
          title="Purpose"
          accent="emerald"
        >
          {p.purpose}
        </LongTextCard>
      )}

      {p.keyTheme && (
        <LongTextCard
          icon={<Sparkles className="w-4 h-4" />}
          title="Key Theme"
          accent="amber"
        >
          {p.keyTheme}
        </LongTextCard>
      )}

      {p.background && (
        <LongTextCard
          icon={<Landmark className="w-4 h-4" />}
          title="Historical Background"
          accent="violet"
        >
          {p.background}
        </LongTextCard>
      )}

      {p.lessons && (
        <LongTextCard
          icon={<GraduationCap className="w-4 h-4" />}
          title="Key Lessons"
          accent="teal"
        >
          {p.lessons}
        </LongTextCard>
      )}

      {p.christConnection && (
        <LongTextCard
          icon={<Church className="w-4 h-4" />}
          title="Christ Connection"
          accent="rose"
        >
          {p.christConnection}
        </LongTextCard>
      )}

      {/* Applications — numbered list */}
      {p.applications && p.applications.length > 0 && (
        <PrologueApplications applications={p.applications} />
      )}

      {/* Key Scripture — decorative quote cards */}
      {p.keyScripture && p.keyScripture.length > 0 && (
        <PrologueKeyScripture scriptures={p.keyScripture} />
      )}

      {/* Main Themes */}
      {p.mainThemes && p.mainThemes.length > 0 && (
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              <Layers className="w-4 h-4" /> Main Themes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {p.mainThemes.map((t, i) => (
                <Badge key={i} variant="secondary" className="px-3 py-1 text-xs">
                  {t}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key People */}
      {p.keyPeople && p.keyPeople.length > 0 && (
        <PrologueBadgeList
          icon={<Users className="w-4 h-4" />}
          title="Key People"
          items={p.keyPeople}
          variant="outline"
        />
      )}

      {/* Key Verses */}
      {p.keyVerses && p.keyVerses.length > 0 && (
        <PrologueBadgeList
          icon={<BookMarked className="w-4 h-4" />}
          title="Key Verses"
          items={p.keyVerses}
          variant="outline"
        />
      )}

      {/* Structure — timeline */}
      {p.structure && p.structure.length > 0 && (
        <PrologueStructure structure={p.structure} />
      )}
    </>
  );
}

/* ─── Section card with colored accent bar for long text ─── */
function LongTextCard({
  icon,
  title,
  accent,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  accent: "sky" | "indigo" | "emerald" | "amber" | "violet" | "teal" | "rose";
  children: string;
}) {
  const accentMap: Record<string, string> = {
    sky: "border-l-sky-500",
    indigo: "border-l-indigo-500",
    emerald: "border-l-emerald-500",
    amber: "border-l-amber-500",
    violet: "border-l-violet-500",
    teal: "border-l-teal-500",
    rose: "border-l-rose-500",
  };
  const iconMap: Record<string, string> = {
    sky: "bg-sky-500/10 text-sky-600",
    indigo: "bg-indigo-500/10 text-indigo-600",
    emerald: "bg-emerald-500/10 text-emerald-600",
    amber: "bg-amber-500/10 text-amber-600",
    violet: "bg-violet-500/10 text-violet-600",
    teal: "bg-teal-500/10 text-teal-600",
    rose: "bg-rose-500/10 text-rose-600",
  };
  return (
    <Card className={`overflow-hidden border-l-4 ${accentMap[accent]} shadow-sm`}>
      <CardHeader className="flex-row items-center gap-2 space-y-0 pb-2">
        <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${iconMap[accent]}`}>
          {icon}
        </span>
        <CardTitle className="text-sm font-semibold text-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/80">
          {children}
        </p>
      </CardContent>
    </Card>
  );
}

function PrologueApplications({ applications }: { applications: string[] }) {
  return (
    <Card className="shadow-sm overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-emerald-500/10 to-transparent pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          <Lightbulb className="w-4 h-4" /> Key Applications for Today
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {applications.map((app, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-foreground/80">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white mt-0.5">
                <span className="text-[11px] font-bold">{i + 1}</span>
              </span>
              <span className="leading-relaxed">{app}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function PrologueKeyScripture({
  scriptures,
}: {
  scriptures: Array<{ reference: string; text: string }>;
}) {
  return (
    <Card className="shadow-sm overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-sky-500/10 to-transparent pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          <Quote className="w-4 h-4" /> Key Scripture
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {scriptures.map((s, i) => (
          <figure
            key={i}
            className="relative rounded-xl border border-border/60 bg-gradient-to-br from-sky-500/[0.06] to-transparent p-4 pl-8"
          >
            <span className="absolute left-3 top-3 text-2xl leading-none text-sky-400/60 select-none">
              &ldquo;
            </span>
            <blockquote className="pl-1 text-sm italic leading-relaxed text-foreground/85">
              {s.text}
            </blockquote>
            <figcaption className="mt-2 pl-1 text-xs font-bold text-sky-600">
              — {s.reference}
            </figcaption>
          </figure>
        ))}
      </CardContent>
    </Card>
  );
}

function PrologueBadgeList({
  icon,
  title,
  items,
  variant,
}: {
  icon: React.ReactNode;
  title: string;
  items: string[];
  variant: "default" | "secondary" | "outline";
}) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {icon} {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {items.map((item, i) => (
            <Badge key={i} variant={variant} className="px-3 py-1 text-xs">
              {item}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function PrologueStructure({
  structure,
}: {
  structure: Array<{ range: string; title: string }>;
}) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          <BookOpen className="w-4 h-4" /> Chapter Structure
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-3 max-h-72 overflow-y-auto pl-2">
          {structure.map((s, i) => (
            <div key={i} className="relative flex items-start gap-3">
              <span className="absolute -left-2 top-4 h-3 w-3 rounded-full border-2 border-primary bg-background" />
              <span className="flex w-14 shrink-0 items-center justify-center rounded-lg bg-primary/10 px-1 py-1.5 text-center text-xs font-bold text-primary">
                {s.range}
              </span>
              <span className="pt-1.5 text-sm text-foreground/80">{s.title}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
