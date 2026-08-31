// BookPrologueDetail — full detail view showing all prologue fields
"use client";

import {
  ArrowLeft, Loader2, ScrollText, User, MapPin, Calendar,
  BookOpen, Target, MessageCircle, Lightbulb, Users, BookMarked,
  Quote, Church,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBookPrologueDetail } from "../hooks/useBookPrologueDetail";

export default function BookPrologueDetail() {
  const h = useBookPrologueDetail();

  if (h.loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!h.item) return null;

  const p = h.item;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-3xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => h.navigate("/admin/book-prologues")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold flex items-center gap-2">
                  <ScrollText className="w-5 h-5 text-primary" /> {p.bookName}
                </h1>
                <p className="text-xs text-muted-foreground">{p.title || p.bookName}</p>
              </div>
            </div>
            <Badge variant={p.isPublished !== false ? "default" : "secondary"}>
              {p.isPublished !== false ? "Published" : "Draft"}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
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
          <Section icon={<User className="w-4 h-4" />} title="About the Author">
            <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">{p.authorDetail}</p>
          </Section>
        )}

        {/* Summary */}
        {p.summary && (
          <Section icon={<MessageCircle className="w-4 h-4" />} title="Summary">
            <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">{p.summary}</p>
          </Section>
        )}

        {/* Key Theme */}
        {p.keyTheme && (
          <Section icon={<Target className="w-4 h-4" />} title="Key Theme">
            <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">{p.keyTheme}</p>
          </Section>
        )}

        {/* Purpose */}
        {p.purpose && (
          <Section icon={<Lightbulb className="w-4 h-4" />} title="Purpose">
            <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">{p.purpose}</p>
          </Section>
        )}

        {/* Background */}
        {p.background && (
          <Section icon={<BookOpen className="w-4 h-4" />} title="Historical Background">
            <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">{p.background}</p>
          </Section>
        )}

        {/* Lessons */}
        {p.lessons && (
          <Section icon={<Lightbulb className="w-4 h-4" />} title="Key Lessons">
            <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">{p.lessons}</p>
          </Section>
        )}

        {/* Christ Connection */}
        {p.christConnection && (
          <Section icon={<Church className="w-4 h-4" />} title="Christ Connection">
            <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">{p.christConnection}</p>
          </Section>
        )}

        {/* Applications */}
        {p.applications && p.applications.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Lightbulb className="w-4 h-4" /> Key Applications for Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {p.applications.map((app, i) => (
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
        )}

        {/* Key Scripture */}
        {p.keyScripture && p.keyScripture.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Quote className="w-4 h-4" /> Key Scripture
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {p.keyScripture.map((s, i) => (
                <div key={i} className="p-3 rounded-lg bg-muted/30 border border-border/50">
                  <p className="text-sm italic text-foreground/80 mb-1">"{s.text}"</p>
                  <p className="text-xs font-medium text-primary">{s.reference}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Main Themes */}
        {p.mainThemes && p.mainThemes.length > 0 && (
          <Section icon={<Tag className="w-4 h-4" />} title="Main Themes">
            <div className="flex flex-wrap gap-2">
              {p.mainThemes.map((t, i) => (
                <Badge key={i} variant="secondary" className="text-xs">{t}</Badge>
              ))}
            </div>
          </Section>
        )}

        {/* Key People */}
        {p.keyPeople && p.keyPeople.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4" /> Key People
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {p.keyPeople.map((person, i) => (
                  <Badge key={i} variant="outline" className="text-xs">{person}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Key Verses */}
        {p.keyVerses && p.keyVerses.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <BookMarked className="w-4 h-4" /> Key Verses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {p.keyVerses.map((v, i) => (
                  <Badge key={i} variant="outline" className="text-xs">{v}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Structure */}
        {p.structure && p.structure.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> Chapter Structure
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {p.structure.map((s, i) => (
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
        )}

        {/* Context info */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
              {p.dateWritten && (
                <div>
                  <p className="font-semibold mb-1">Date Written</p>
                  <p>{p.dateWritten}</p>
                </div>
              )}
              {p.locationWritten && (
                <div>
                  <p className="font-semibold mb-1">Location</p>
                  <p>{p.locationWritten}</p>
                </div>
              )}
              {p.createdBy && (
                <div>
                  <p className="font-semibold mb-1">Created By</p>
                  <p>{p.createdBy}</p>
                </div>
              )}
              {p.createdOn && (
                <div>
                  <p className="font-semibold mb-1">Created</p>
                  <p>{new Date(p.createdOn).toLocaleString()}</p>
                </div>
              )}
              {p.updatedOn && (
                <div>
                  <p className="font-semibold mb-1">Updated</p>
                  <p>{new Date(p.updatedOn).toLocaleString()}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-2 pb-8">
          <Button variant="outline" onClick={() => h.navigate("/admin/book-prologues")} className="gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Back to Prologues
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Shared helper ──────────────────────────────────────────────────────────

function Section({
  icon, title, children,
}: {
  icon: React.ReactNode; title: string; children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          {icon} {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}


