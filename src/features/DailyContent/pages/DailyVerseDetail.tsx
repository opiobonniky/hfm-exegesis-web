// DailyVerseDetail — read-only detail view for a daily verse (admin)
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft, Calendar, BookOpen, Edit3, Tag,
  MessageSquare, Lightbulb, Layers, BookMarked,
  Clock, CheckCircle, XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// ── Section block ──
function DetailSection({ label, value, icon: Icon }: { label: string; value?: string | null; icon?: any }) {
  if (!value) return null;
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5">
        {Icon && <Icon className="w-3.5 h-3.5 text-primary" />}
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</h3>
      </div>
      <p className="text-sm leading-relaxed text-foreground whitespace-pre-line">{value}</p>
    </div>
  );
}

// ── List block ──
function DetailList({ label, items, icon: Icon }: { label: string; items: string[]; icon?: any }) {
  if (items.length === 0) return null;
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        {Icon && <Icon className="w-3.5 h-3.5 text-primary" />}
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</h3>
      </div>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-foreground">
            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Helpers ──
const parseList = (val: any): string[] => {
  if (!val) return [];
  if (Array.isArray(val)) return val.map(String);
  try { const p = JSON.parse(val); return Array.isArray(p) ? p.map(String) : []; } catch { return []; }
};

const fmtDate = (d: string | null) => {
  if (!d) return null;
  try { return new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }); }
  catch { return d; }
};

// ── Main page ──
export default function DailyVerseDetail() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const verseParam = params.get("verse");
  let verse: any = null;
  try { verse = verseParam ? JSON.parse(verseParam) : null; } catch { /* invalid */ }

  if (!verse) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center bg-background gap-4 text-center px-6">
        <BookOpen className="w-12 h-12 text-muted-foreground/40" />
        <h2 className="text-lg font-bold">Verse not found</h2>
        <p className="text-sm text-muted-foreground">No verse data was provided.</p>
        <Button variant="outline" onClick={() => navigate(-1)}>Go back</Button>
      </div>
    );
  }

  const reference = `${verse.bookName || ""} ${verse.chapter || ""}:${verse.verseNumber || ""}`;

  return (
    <div className="min-h-full bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-3 px-4 sm:px-6 py-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold truncate">Daily Verse Detail</h1>
            <p className="text-xs text-muted-foreground">{reference}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate(`/add-daily-verse?id=${verse.id || ""}`)}>
            <Edit3 className="w-3.5 h-3.5 mr-1.5" /> Edit
          </Button>
        </div>
      </header>

      <div className="px-4 sm:px-6 py-6 max-w-3xl mx-auto space-y-5">
        {/* Title + status */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">{reference}</h2>
          <Badge variant={verse.isPublished ? "default" : "secondary"}>
            {verse.isPublished ? <><CheckCircle className="w-3 h-3 mr-1" /> Published</> : <><XCircle className="w-3 h-3 mr-1" /> Draft</>}
          </Badge>
        </div>

        <div className="h-px bg-border" />

        {/* Core fields */}
        <Card>
          <CardContent className="p-5 space-y-4">
            <DetailSection label="Display Date" value={fmtDate(verse.displayDate)} icon={Calendar} />
            <DetailSection label="Bible Version" value={verse.bibleVersion} icon={BookOpen} />
            <DetailSection label="Verse Text" value={verse.reflection} icon={MessageSquare} />
            <DetailSection label="Explanation" value={verse.explanation} icon={Lightbulb} />
            <DetailSection label="Application" value={verse.application} icon={Tag} />
            <DetailSection label="Verse Introduction" value={verse.verseIntroduction} icon={BookMarked} />
          </CardContent>
        </Card>

        {/* Background */}
        <Card>
          <CardContent className="p-5 space-y-4">
            <h3 className="text-sm font-bold text-primary">Background</h3>
            <DetailSection label="Author" value={verse.backgroundAuthor} />
            <DetailSection label="Book" value={verse.backgroundBook} />
            <DetailSection label="Context" value={verse.backgroundContext} />
            <DetailSection label="Word Studies" value={verse.wordStudies} />
          </CardContent>
        </Card>

        {/* Lists */}
        <Card>
          <CardContent className="p-5 space-y-5">
            <DetailList label="Practical Applications" items={parseList(verse.practicalApplications)} icon={Lightbulb} />
            <DetailList label="Key Themes" items={parseList(verse.keyThemes)} icon={Tag} />
            <DetailList label="Cross References" items={parseList(verse.crossReferences)} icon={Layers} />
            <DetailSection label="Final Thoughts" value={verse.finalThoughts} />
            <DetailList label="Takeaways" items={parseList(verse.takeaways)} icon={BookMarked} />
            <DetailSection label="Learn More" value={verse.learnMore} />
          </CardContent>
        </Card>

        {/* Audit */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
          <span><Clock className="w-3 h-3 inline mr-1" />Created {fmtDate(verse.createdOn) || "—"}</span>
          {verse.updatedOn && <span>Updated {fmtDate(verse.updatedOn)}</span>}
        </div>
      </div>
    </div>
  );
}
