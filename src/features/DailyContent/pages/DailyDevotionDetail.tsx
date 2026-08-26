// DailyDevotionDetail — read-only detail view for a daily devotion
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft, Calendar, BookOpen, Edit3, Tag,
  MessageSquare, Lightbulb, Layers, BookMarked,
  Clock, CheckCircle, XCircle, Heart, GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// ── Section label ──
function SectionLabel({ children, icon: Icon }: { children: React.ReactNode; icon?: any }) {
  return (
    <div className="flex items-center gap-1.5 mb-2">
      {Icon && <Icon className="w-3.5 h-3.5 text-primary" />}
      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{children}</h3>
    </div>
  );
}

// ── Text block ──
function TextBlock({ label, value, icon }: { label: string; value?: string | null; icon?: any }) {
  if (!value?.trim()) return null;
  return (
    <div className="py-3 border-b border-border/30 last:border-0">
      <SectionLabel icon={icon}>{label}</SectionLabel>
      <p className="text-sm leading-relaxed text-foreground whitespace-pre-line">{value}</p>
    </div>
  );
}

// ── List block ──
function ListBlock({ label, value, icon }: { label: string; value?: string | null; icon?: any }) {
  const items = parseList(value);
  if (items.length === 0) return null;
  return (
    <div className="py-3 border-b border-border/30 last:border-0">
      <SectionLabel icon={icon}>{label}</SectionLabel>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-foreground">
            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
            <span className="leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Word Studies ──
function WordStudiesBlock({ value }: { value?: string | null }) {
  const studies = parseWordStudies(value);
  if (studies.length === 0) return null;
  return (
    <div className="py-3 border-b border-border/30 last:border-0">
      <SectionLabel icon={GraduationCap}>Strong's Concordance Word Studies</SectionLabel>
      <div className="space-y-3">
        {studies.map((s, i) => (
          <div key={i} className="rounded-lg bg-muted/30 p-3 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-foreground">{s.word}</span>
              {s.strongs && <span className="text-xs font-mono text-primary/70 bg-primary/5 px-1.5 py-0.5 rounded">{s.strongs}</span>}
            </div>
            {s.definition && <p className="text-xs text-muted-foreground leading-relaxed">{s.definition}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Helpers ──
const parseList = (val: any): string[] => {
  if (!val) return [];
  if (Array.isArray(val)) {
    if (val.length > 0 && typeof val[0] === "object" && val[0] !== null) {
      return val.map((item: any) => {
        if (item.word && item.definition) return `${item.word} — ${item.definition}`;
        return JSON.stringify(item);
      });
    }
    return val.map(String);
  }
  const str = String(val);
  try {
    const p = JSON.parse(str);
    if (Array.isArray(p)) {
      if (p.length > 0 && typeof p[0] === "object" && p[0] !== null) {
        return p.map((item: any) => {
          if (item.word && item.definition) return `${item.word} — ${item.definition}`;
          return JSON.stringify(item);
        });
      }
      return p.map(String);
    }
  } catch { /* not JSON */ }
  return str.split("\n").map(s => s.trim()).filter(Boolean);
};

const parseWordStudies = (val: any): Array<{ word: string; strongs?: string; definition?: string }> => {
  if (!val) return [];
  if (Array.isArray(val)) {
    return val.map((item: any) => ({
      word: item.word || "",
      strongs: item.strongs || item.Strongs || "",
      definition: item.definition || "",
    }));
  }
  const str = String(val);
  try {
    const p = JSON.parse(str);
    if (Array.isArray(p)) {
      return p.map((item: any) => ({
        word: item.word || "",
        strongs: item.strongs || item.Strongs || "",
        definition: item.definition || "",
      }));
    }
  } catch { /* not JSON */ }
  return str.split("\n").map(s => s.trim()).filter(Boolean).map(line => {
    const parts = line.split("|").map(p => p.trim());
    return { word: parts[0] || "", strongs: parts[1] || "", definition: parts[2] || "" };
  });
};

const fmtDate = (d: string | null) => {
  if (!d) return null;
  try { return new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }); }
  catch { return d; }
};

// ── Main page ──
export default function DailyDevotionDetail() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const devotionParam = params.get("devotion");
  let devotion: any = null;
  try { devotion = devotionParam ? JSON.parse(devotionParam) : null; } catch { /* invalid */ }

  if (!devotion) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center bg-background gap-4 text-center px-6">
        <Heart className="w-12 h-12 text-muted-foreground/40" />
        <h2 className="text-lg font-bold">Devotion not found</h2>
        <p className="text-sm text-muted-foreground">No devotion data was provided.</p>
        <Button variant="outline" onClick={() => navigate(-1)}>Go back</Button>
      </div>
    );
  }

  const reference = devotion.bookName
    ? `${devotion.bookName} ${devotion.chapter || ""}:${devotion.verseNumber || ""}`
    : null;

  return (
    <div className="min-h-full bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-3 px-4 sm:px-6 py-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold truncate">{devotion.title || "Daily Devotion"}</h1>
            <p className="text-xs text-muted-foreground">{fmtDate(devotion.displayDate)}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate(`/add-daily-devotion`, { state: { devotion } })}>
            <Edit3 className="w-3.5 h-3.5 mr-1.5" /> Edit
          </Button>
        </div>
      </header>

      <div className="px-4 sm:px-6 py-6 max-w-3xl mx-auto space-y-6">
        {/* Title + status */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">{devotion.title}</h2>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={devotion.isPublished ? "default" : "secondary"}>
              {devotion.isPublished ? <><CheckCircle className="w-3 h-3 mr-1" /> Published</> : <><XCircle className="w-3 h-3 mr-1" /> Draft</>}
            </Badge>
            {reference && <Badge variant="outline" className="text-xs">{reference}</Badge>}
            {devotion.bibleVersion && <Badge variant="outline" className="text-xs">{devotion.bibleVersion}</Badge>}
          </div>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {fmtDate(devotion.displayDate)}</span>
          {devotion.createdOn && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Created {fmtDate(devotion.createdOn)}</span>}
          {devotion.updatedOn && <span>Updated {fmtDate(devotion.updatedOn)}</span>}
        </div>

        <div className="h-px bg-border/40" />

        {/* Content */}
        <div className="py-4">
          <SectionLabel icon={BookOpen}>Content</SectionLabel>
          <p className="text-sm leading-relaxed text-foreground whitespace-pre-line">{devotion.content}</p>
        </div>

        {/* Content sections */}
        <div className="space-y-1">
          <TextBlock label="Explanation" value={devotion.explanation} icon={Lightbulb} />
          <TextBlock label="Application" value={devotion.application} icon={Tag} />
          <TextBlock label="Introduction" value={devotion.verseIntroduction} icon={BookMarked} />
          <TextBlock label="Learn More" value={devotion.learnMore} icon={Layers} />
        </div>

        {/* Background */}
        {(devotion.backgroundAuthor || devotion.backgroundBook || devotion.backgroundContext) && (
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-foreground mb-2">Background</h3>
            <TextBlock label="Author" value={devotion.backgroundAuthor} />
            <TextBlock label="Book" value={devotion.backgroundBook} />
            <TextBlock label="Context" value={devotion.backgroundContext} />
          </div>
        )}

        {/* Word Studies */}
        <WordStudiesBlock value={devotion.wordStudies} />

        {/* Lists */}
        <div className="space-y-1">
          <ListBlock label="Practical Applications" value={devotion.practicalApplications} icon={Lightbulb} />
          <ListBlock label="Key Themes" value={devotion.keyThemes} icon={Tag} />
          <ListBlock label="Cross References" value={devotion.crossReferences} icon={Layers} />
          <TextBlock label="Final Thoughts" value={devotion.finalThoughts} />
          <ListBlock label="Takeaways" value={devotion.takeaways} icon={BookMarked} />
        </div>
      </div>
    </div>
  );
}
