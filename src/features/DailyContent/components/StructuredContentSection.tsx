// StructuredContentSection — word studies, practical applications, key themes,
// cross references, final thoughts, takeaways
import {
  GraduationCap, ListChecks, Sparkles, Link2, BookMarked, Lightbulb,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
  wordStudies: string; setWordStudies: (v: string) => void;
  practicalApplications: string; setPracticalApplications: (v: string) => void;
  keyThemes: string; setKeyThemes: (v: string) => void;
  crossReferences: string; setCrossReferences: (v: string) => void;
  finalThoughts: string; setFinalThoughts: (v: string) => void;
  takeaways: string; setTakeaways: (v: string) => void;
  isRtl: boolean;
}

export function StructuredContentSection(p: Props) {
  const fields: Field[] = [
    {
      label: "Strong's Concordance Word Studies",
      icon: <GraduationCap className="h-4 w-4 text-teal-500" />,
      value: p.wordStudies, onChange: p.setWordStudies,
      placeholder: "Immediately | eutheōs — Strong's G2112 | Means at once or without delay.",
      hint: "One study per line: Word | Strong's ID | Definition",
      rows: 8,
    },
    {
      label: "Practical Applications",
      icon: <ListChecks className="h-4 w-4 text-green-500" />,
      value: p.practicalApplications, onChange: p.setPracticalApplications,
      placeholder: "Respond promptly when God's direction is confirmed.",
      hint: "One application per line",
      rows: 7,
    },
    {
      label: "Key Themes",
      icon: <Sparkles className="h-4 w-4 text-amber-500" />,
      value: p.keyThemes, onChange: p.setKeyThemes,
      placeholder: "Immediate obedience",
      hint: "One theme per line",
      rows: 5,
    },
    {
      label: "Cross References",
      icon: <Link2 className="h-4 w-4 text-sky-500" />,
      value: p.crossReferences, onChange: p.setCrossReferences,
      placeholder: "Acts 13:2–3 — The Spirit calls and sends.",
      hint: "One reference per line",
      rows: 6,
    },
    {
      label: "Final Thoughts",
      icon: <BookMarked className="h-4 w-4 text-rose-500" />,
      value: p.finalThoughts, onChange: p.setFinalThoughts,
      placeholder: "Summarize the enduring truth of this verse...",
      rows: 4,
    },
    {
      label: "Takeaways",
      icon: <Lightbulb className="h-4 w-4 text-violet-500" />,
      value: p.takeaways, onChange: p.setTakeaways,
      placeholder: "God expects prompt obedience to clear direction.",
      hint: "One takeaway per line",
    },
  ];
  return (
    <div className="space-y-5" dir={p.isRtl ? "rtl" : "ltr"}>
      {fields.map((f) => (
        <div key={f.label} className="space-y-2">
          <Label className="flex items-center gap-2">
            {f.icon} {f.label}
            {f.hint && <span className="text-xs text-muted-foreground">{f.hint}</span>}
          </Label>
          <Textarea
            value={f.value}
            onChange={(e) => f.onChange(e.target.value)}
            placeholder={f.placeholder}
            rows={f.rows || 4}
            className="resize-none"
          />
        </div>
      ))}
    </div>
  );
}
