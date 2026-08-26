// RichContentSection — explanation, application, verse introduction, learn more
import { Lightbulb, BookOpen, MessageSquare, Bookmark } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface FieldProps {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  rows?: number;
  required?: boolean;
  hint?: string;
  isRtl?: boolean;
}
function Field({ label, icon, value, onChange, placeholder, rows = 4, required, hint, isRtl }: FieldProps) {
  return (
    <div className="space-y-2" dir={isRtl ? "rtl" : "ltr"}>
      <Label className="flex items-center gap-2">
        {icon}
        {label} {required && <span className="text-destructive">*</span>}
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </Label>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="resize-none"
        required={required}
      />
    </div>
  );
}

interface Props {
  explanation: string; setExplanation: (v: string) => void;
  application: string; setApplication: (v: string) => void;
  verseIntroduction: string; setVerseIntroduction: (v: string) => void;
  learnMore: string; setLearnMore: (v: string) => void;
  t: any; isRtl: boolean;
}

/** Required content fields (explanation, application, verse introduction) */
export function RequiredContentFields(p: Props) {
  return (
    <div className="space-y-5">
      <Field
        label={p.t.dailyVerse.explanation}
        icon={<Lightbulb className="h-4 w-4 text-accent" />}
        value={p.explanation}
        onChange={p.setExplanation}
        placeholder={p.t.dailyVerse.explanationPlaceholder}
        rows={5}
        required
        isRtl={p.isRtl}
      />
      <Field
        label="Application"
        icon={<MessageSquare className="h-4 w-4 text-emerald-500" />}
        value={p.application}
        onChange={p.setApplication}
        placeholder="How should believers respond to this verse?"
        rows={4}
        required
        isRtl={p.isRtl}
      />
      <Field
        label="Verse Introduction"
        icon={<BookOpen className="h-4 w-4 text-blue-500" />}
        value={p.verseIntroduction}
        onChange={p.setVerseIntroduction}
        placeholder="Introduce the verse and its central purpose..."
        required
        isRtl={p.isRtl}
      />
      <Field
        label={p.t.dailyVerse.learnMore}
        icon={<Bookmark className="h-4 w-4 text-muted-foreground" />}
        value={p.learnMore}
        onChange={p.setLearnMore}
        placeholder={p.t.dailyVerse.learnMorePlaceholder}
        rows={4}
        isRtl={p.isRtl}
      />
    </div>
  );
}
