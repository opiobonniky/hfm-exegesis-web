// DailyExegesisDetail — read-only detail view for a daily exegesis
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft, Calendar, BookOpen, Edit3, Tag,
  MessageSquare, Lightbulb, Layers, BookMarked,
  Clock, CheckCircle, XCircle, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TextBlock, TagsBlock } from "../components";
import { fmtDate } from "../helpers/contentDetailHelpers";

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
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-3 px-4 sm:px-6 py-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold truncate">{exegesis.title || "Daily Exegesis"}</h1>
            <p className="text-xs text-muted-foreground">{fmtDate(exegesis.displayDate)}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate(`/add-daily-exegesis`, { state: { exegesis } })}>
            <Edit3 className="w-3.5 h-3.5 mr-1.5" /> Edit
          </Button>
        </div>
      </header>

      <div className="px-4 sm:px-6 py-6 max-w-3xl mx-auto space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">{exegesis.title}</h2>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={exegesis.isPublished ? "default" : "secondary"}>
              {exegesis.isPublished ? <><CheckCircle className="w-3 h-3 mr-1" /> Published</> : <><XCircle className="w-3 h-3 mr-1" /> Draft</>}
            </Badge>
            {exegesis.passageReference && <Badge variant="outline" className="text-xs font-mono">{exegesis.passageReference}</Badge>}
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {fmtDate(exegesis.displayDate)}</span>
          {exegesis.createdOn && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Created {fmtDate(exegesis.createdOn)}</span>}
        </div>

        <div className="h-px bg-border/40" />

        <div className="space-y-1">
          <TextBlock label="Passage Reference" value={exegesis.passageReference} icon={BookOpen} />
          <TextBlock label="Teaching Body" value={exegesis.teachingBody} icon={MessageSquare} />
        </div>

        <div className="space-y-1">
          <TextBlock label="Introduction" value={exegesis.introduction} icon={Lightbulb} />
          <TextBlock label="Context Summary" value={exegesis.contextSummary} icon={Layers} />
        </div>

        <div className="space-y-1">
          <TextBlock label="Application" value={exegesis.application} icon={Tag} />
          <TextBlock label="Prayer" value={exegesis.prayer} icon={BookMarked} />
        </div>

        <TagsBlock tags={exegesis.tags} />
      </div>
    </div>
  );
}
