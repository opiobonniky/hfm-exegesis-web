// PrologueDetailContent — renders all prologue fields as sections
"use client";

import {
  ScrollText, User, MapPin, Calendar, BookOpen, Target,
  MessageCircle, Lightbulb, Users, BookMarked, Quote, Church,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DetailSection } from "./DetailSection";
import type { BookPrologueDetail } from "../hooks/useBookPrologueDetail";

export function PrologueDetailContent({ item }: { item: BookPrologueDetail }) {
  const p = item;
  return (
    <>
      {/* Title card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <ScrollText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{p.title || p.bookName}</h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {p.author && (
                  <Badge variant="outline" className="text-xs gap-1">
                    <User className="w-3 h-3" /> {p.author}
                  </Badge>
                )}
                {p.chapters && (
                  <Badge variant="secondary" className="text-xs gap-1">
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

      {/* Author detail */}
      {p.authorDetail && (
        <DetailSection icon={<User className="w-4 h-4" />} title="About the Author">
          <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">{p.authorDetail}</p>
        </DetailSection>
      )}

      {/* Summary */}
      {p.summary && (
        <DetailSection icon={<MessageCircle className="w-4 h-4" />} title="Summary">
          <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">{p.summary}</p>
        </DetailSection>
      )}

      {/* Key Theme */}
      {p.keyTheme && (
        <DetailSection icon={<Target className="w-4 h-4" />} title="Key Theme">
          <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">{p.keyTheme}</p>
        </DetailSection>
      )}

      {/* Purpose */}
      {p.purpose && (
        <DetailSection icon={<Lightbulb className="w-4 h-4" />} title="Purpose">
          <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">{p.purpose}</p>
        </DetailSection>
      )}

      {/* Background */}
      {p.background && (
        <DetailSection icon={<BookOpen className="w-4 h-4" />} title="Historical Background">
          <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">{p.background}</p>
        </DetailSection>
      )}

      {/* Lessons */}
      {p.lessons && (
        <DetailSection icon={<Lightbulb className="w-4 h-4" />} title="Key Lessons">
          <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">{p.lessons}</p>
        </DetailSection>
      )}

      {/* Christ Connection */}
      {p.christConnection && (
        <DetailSection icon={<Church className="w-4 h-4" />} title="Christ Connection">
          <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">{p.christConnection}</p>
        </DetailSection>
      )}

      {/* Applications */}
      {p.applications && p.applications.length > 0 && (
        <PrologueApplications applications={p.applications} />
      )}

      {/* Key Scripture */}
      {p.keyScripture && p.keyScripture.length > 0 && (
        <PrologueKeyScripture scriptures={p.keyScripture} />
      )}

      {/* Main Themes */}
      {p.mainThemes && p.mainThemes.length > 0 && (
        <DetailSection icon={<Tag className="w-4 h-4" />} title="Main Themes">
          <div className="flex flex-wrap gap-2">
            {p.mainThemes.map((t, i) => (
              <Badge key={i} variant="secondary" className="text-xs">{t}</Badge>
            ))}
          </div>
        </DetailSection>
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

      {/* Structure */}
      {p.structure && p.structure.length > 0 && (
        <PrologueStructure structure={p.structure} />
      )}
    </>
  );
}

/* ─── Sub-components ─── */

function Tag({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
      <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
    </svg>
  );
}

function PrologueApplications({ applications }: { applications: string[] }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Lightbulb className="w-4 h-4" /> Key Applications for Today
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {applications.map((app, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
              <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[10px] font-bold text-primary">{i + 1}</span>
              </span>
              {app}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function PrologueKeyScripture({ scriptures }: { scriptures: Array<{ reference: string; text: string }> }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Quote className="w-4 h-4" /> Key Scripture
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {scriptures.map((s, i) => (
          <div key={i} className="p-3 rounded-lg bg-muted/30 border border-border/50">
            <p className="text-sm italic text-foreground/80 mb-1">"{s.text}"</p>
            <p className="text-xs font-medium text-primary">{s.reference}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function PrologueBadgeList({
  icon, title, items, variant,
}: {
  icon: React.ReactNode;
  title: string;
  items: string[];
  variant: "default" | "secondary" | "outline";
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          {icon} {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {items.map((item, i) => (
            <Badge key={i} variant={variant} className="text-xs">{item}</Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function PrologueStructure({ structure }: { structure: Array<{ range: string; title: string }> }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <BookOpen className="w-4 h-4" /> Chapter Structure
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {structure.map((s, i) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded-lg border border-border/50 hover:bg-muted/30 text-sm">
              <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-primary">{s.range}</span>
              </span>
              <span className="text-foreground/80">{s.title}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
