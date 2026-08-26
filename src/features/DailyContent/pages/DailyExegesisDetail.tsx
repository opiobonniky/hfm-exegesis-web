// DailyExegesisDetail — read-only detail view for a daily exegesis
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft, Calendar, BookOpen, Edit3, Tag,
  MessageSquare, Lightbulb, Layers, BookMarked,
  Clock, CheckCircle, XCircle, Sparkles,
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

// ── Helpers ──
const fmtDate = (d: string | null) => {
  if (!d) return null;
  try { return new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }); }
  catch { return d; }
};

const parseTags = (val: any): string[] => {
  if (!val) return [];
  if (Array.isArray(val)) return val.map(String);
  return String(val).split(",").map(t => t.trim()).filter(Boolean);
};

// ── Main page ──
export default function DailyExegesisDetail() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const exegesisParam = params.get("exegesis");
  let exegesis: any = null;
  try { exegesis = exegesisParam ? JSON.parse(exegesisParam) : null; } catch { /* invalid */ }

  if (!exegesis) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center bg-background gap-4 text-center px-6">
        <Sparkles className="w-12 h-12 text-muted-foreground/40" />
        <h2 className="text-lg font-bold">Exegesis not found</h2>
        <p className="text-sm text-muted-foreground">No exegesis data was provided.</p>
        <Button variant="outline" onClick={() => navigate(-1)}>Go back</Button>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-3 px-4 sm:px-6 py-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 h-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold truncate">{exegesis.title || "Daily Exegesis"}</h1>
            <p className="text-xs text-muted-foreground">{fmtDate(exegesis.displayDate)}</p>
          </div>
        </div>
      </header>

      <div className="px-4 sm:px-6 py-6 max-w-3xl mx-auto space-y-5">
        {/* Title + status */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">{exegesis.title}</h2>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={exegesis.isPublished ? "default" : "secondary"}>
              {exegesis.isPublished ? <><CheckCircle className="w-3 h-3 mr-1" /> Published</> : <><XCircle className="w-3 h-3 mr-1" /> Draft</>}
            </Badge>
            {exegesis.passageReference && <Badge variant="outline" className="text-xs font-mono">{exegesis.passageReference}</Badge>}
          </div>
        </div>

        <div className="h-px bg-border" />

        {/* Passage */}
        <Card>
          <CardContent className="p-5 space-y-4">
            <DetailSection label="Passage Reference" value={exegesis.passageReference} icon={BookOpen} />
          </CardContent>
        </Card>

        {/* Teaching Body */}
        <Card>
          <CardContent className="p-5 space-y-4">
            <h3 className="text-sm font-bold text-primary">Teaching</h3>
            <DetailSection label="Teaching Body" value={exegesis.teachingBody} icon={MessageSquare} />
          </CardContent>
        </Card>

        {/* Introduction & Context */}
        <Card>
          <CardContent className="p-5 space-y-4">
            <h3 className="text-sm font-bold text-primary">Introduction & Context</h3>
            <DetailSection label="Introduction" value={exegesis.introduction} icon={Lightbulb} />
            <DetailSection label="Context Summary" value={exegesis.contextSummary} icon={Layers} />
          </CardContent>
        </Card>

        {/* Application & Prayer */}
        <Card>
          <CardContent className="p-5 space-y-4">
            <h3 className="text-sm font-bold text-primary">Application & Prayer</h3>
            <DetailSection label="Application" value={exegesis.application} icon={Tag} />
            <DetailSection label="Prayer" value={exegesis.prayer} icon={BookMarked} />
          </CardContent>
        </Card>

        {/* Tags */}
        {exegesis.tags && (
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 flex-wrap">
                <Tag className="w-3.5 h-3.5 text-primary" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tags</h3>
              </div>
              <div className="flex items-center gap-2 flex-wrap mt-2">
                {parseTags(exegesis.tags).map((tag, i) => (
                  <Badge key={i} variant="outline" className="text-xs">{tag}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Audit */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
          <span><Clock className="w-3 h-3 inline mr-1" />Created {fmtDate(exegesis.createdOn) || "—"}</span>
        </div>
      </div>
    </div>
  );
}
