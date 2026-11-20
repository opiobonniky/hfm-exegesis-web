// StructuredContentSection — word studies, practical applications, key themes,
// cross references, final thoughts, takeaways
import {
  ListChecks,
  Sparkles,
  BookMarked,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { CrossReferencePicker } from "./CrossReferencePicker";
import { WordStudyEditor } from './WordStudyEditor';
import { parseStudies, serializeStudies, parseTakeaways } from '../helpers/editorContent';
import { TakeawayEditor } from './TakeawayEditor';
import { tt } from '@/components/languages/hardcodedTranslate';

interface Field {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  hint?: string;
  rows?: number;
}
interface Props {
  wordStudies: string;
  setWordStudies: (v: string) => void;
  practicalApplications: string;
  setPracticalApplications: (v: string) => void;
  keyThemes: string;
  setKeyThemes: (v: string) => void;
  crossReferences: string;
  setCrossReferences: (v: string) => void;
  finalThoughts: string;
  setFinalThoughts: (v: string) => void;
  takeaways: string;
  setTakeaways: (v: string) => void;
  bibleVersion: string;
  isRtl: boolean;
  requireRichRows?: boolean;
  revealRowErrors?: boolean;
  takeawayErrors?: string[];
}

export function StructuredContentSection(p: Props) {
  const fields: Field[] = [
    {
      label: tt("Practical Applications"),
      icon: <ListChecks className="h-4 w-4 text-green-500" />,
      value: p.practicalApplications,
      onChange: p.setPracticalApplications,
      placeholder: tt("Respond promptly when God's direction is confirmed."),
      hint: tt("One application per line"),
      rows: 7,
    },
    {
      label: tt("Key Themes"),
      icon: <Sparkles className="h-4 w-4 text-amber-500" />,
      value: p.keyThemes,
      onChange: p.setKeyThemes,
      placeholder: tt("Immediate obedience"),
      hint: tt("One theme per line"),
      rows: 5,
    },
    {
      label: tt("Final Thoughts"),
      icon: <BookMarked className="h-4 w-4 text-rose-500" />,
      value: p.finalThoughts,
      onChange: p.setFinalThoughts,
      placeholder: tt("Summarize the enduring truth of this verse..."),
      rows: 4,
    },
  ];
  const [applications, themes, finalThoughts] = fields;
  const renderField = (f: Field) => (
    <label className="block space-y-2">
      <span className="flex items-center gap-2 text-sm font-medium">
        {f.icon} {f.label}
        {f.hint && <span className="text-xs text-muted-foreground">{f.hint}</span>}
      </span>
      <Textarea
        value={f.value}
        onChange={(e) => f.onChange(e.target.value)}
        placeholder={f.placeholder}
        rows={f.rows || 4}
        className="resize-none"
      />
    </label>
  );
  return (
    <div className="space-y-5" dir={p.isRtl ? "rtl" : "ltr"}>
      <WordStudyEditor value={parseStudies(p.wordStudies)} requireAll={p.requireRichRows} rejectEmpty
        revealErrors={p.revealRowErrors} onChange={rows => p.setWordStudies(serializeStudies(rows))} />
      {renderField(applications)}
      <section className="space-y-4">
        <h3 className="text-base font-semibold">{tt("Insights and Cross References")}</h3>
        {renderField(themes)}
        <CrossReferencePicker
          value={p.crossReferences}
          onChange={p.setCrossReferences}
          bibleVersion={p.bibleVersion}
          isRtl={p.isRtl}
          showCommentary
          requireAll={p.requireRichRows}
          rejectEmpty
          revealErrors={p.revealRowErrors}
        />
      </section>
      {renderField(finalThoughts)}
      <TakeawayEditor value={parseTakeaways(p.takeaways)} errors={p.takeawayErrors} onChange={items => p.setTakeaways(JSON.stringify(items))} />
    </div>
  );
}
