// DailyExegesisDetail — read-only detail view for a daily exegesis
import { useNavigate, useSearchParams } from "react-router-dom";
import { Sparkles, BookOpen, MessageSquare, Lightbulb, Layers, Tag, BookMarked } from "lucide-react";
import {
  DailyContentDetailHeader,
  DailyContentDetailEmpty,
  DailyContentDetailMeta,
  TextBlock,
  TagsBlock,
} from "../components";
import { fmtDate } from "../helpers/contentDetailHelpers";

export default function DailyExegesisDetail() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const exegesisParam = params.get("exegesis");
  let exegesis: any = null;
  try { exegesis = exegesisParam ? JSON.parse(exegesisParam) : null; } catch { /* invalid */ }

  if (!exegesis) {
    return (
      <DailyContentDetailEmpty
        icon={Sparkles}
        title="Exegesis not found"
        message="No exegesis data was provided."
        onBack={() => navigate(-1)}
      />
    );
  }

  return (
    <div className="min-h-full bg-background">
      <DailyContentDetailHeader
        title={exegesis.title || "Daily Exegesis"}
        subtitle={fmtDate(exegesis.displayDate)}
        onBack={() => navigate(-1)}
        onEdit={() => navigate(`/add-daily-exegesis`, { state: { exegesis } })}
      />

      <div className="px-4 sm:px-6 py-6 max-w-3xl mx-auto space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">{exegesis.title}</h2>
          <DailyContentDetailMeta
            isPublished={exegesis.isPublished}
            reference={exegesis.passageReference}
            displayDate={exegesis.displayDate}
            createdOn={exegesis.createdOn}
          />
        </div>

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
