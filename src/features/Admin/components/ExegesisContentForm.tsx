// ExegesisContentForm — exegesis-specific form fields for AdminDailyContent
import { BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  formTitle: string; setFormTitle: (v: string) => void;
  formPassageRef: string; setFormPassageRef: (v: string) => void;
  formIntro: string; setFormIntro: (v: string) => void;
  formContextSummary: string; setFormContextSummary: (v: string) => void;
  formTeachingBody: string; setFormTeachingBody: (v: string) => void;
  formApplication: string; setFormApplication: (v: string) => void;
  formPrayer: string; setFormPrayer: (v: string) => void;
  formTags: string; setFormTags: (v: string) => void;
}
export function ExegesisContentForm({
  formTitle, setFormTitle, formPassageRef, setFormPassageRef,
  formIntro, setFormIntro, formContextSummary, setFormContextSummary,
  formTeachingBody, setFormTeachingBody, formApplication, setFormApplication,
  formPrayer, setFormPrayer, formTags, setFormTags,
}: Props) {
  return (
    <Card className="border-border/40 shadow-sm">
      <CardHeader className="bg-gradient-to-r from-primary/[0.03] to-background pb-4">
        <CardTitle className="text-base flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-primary" /> Exegesis Content
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-5">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Title *</Label>
          <Input value={formTitle} onChange={e => setFormTitle(e.target.value)}
            placeholder="Exegesis title" className="h-9 text-sm" />
        </div>
          <Label className="text-xs font-semibold">Passage Reference *</Label>
          <Input value={formPassageRef} onChange={e => setFormPassageRef(e.target.value)}
            placeholder="e.g. John 3:16" className="h-9 text-sm font-mono" />
          <Label className="text-xs font-semibold">Introduction</Label>
          <Textarea value={formIntro} onChange={e => setFormIntro(e.target.value)}
            placeholder="Brief introduction..." rows={3} className="resize-none text-sm leading-relaxed" />
          <Label className="text-xs font-semibold">Context Summary</Label>
          <Textarea value={formContextSummary} onChange={e => setFormContextSummary(e.target.value)}
            placeholder="Historical and literary context..." rows={3} className="resize-none text-sm leading-relaxed" />
          <Label className="text-xs font-semibold">Teaching Body *</Label>
          <Textarea value={formTeachingBody} onChange={e => setFormTeachingBody(e.target.value)}
            placeholder="The main teaching content..." rows={8} className="resize-none text-sm leading-relaxed" />
          <Label className="text-xs font-semibold">Application</Label>
          <Textarea value={formApplication} onChange={e => setFormApplication(e.target.value)}
            placeholder="How to apply this..." rows={3} className="resize-none text-sm leading-relaxed" />
          <Label className="text-xs font-semibold">Prayer</Label>
          <Textarea value={formPrayer} onChange={e => setFormPrayer(e.target.value)}
            placeholder="Suggested prayer..." rows={3} className="resize-none text-sm leading-relaxed" />
          <Label className="text-xs font-semibold">Tags</Label>
          <Input value={formTags} onChange={e => setFormTags(e.target.value)}
            placeholder="faith, grace, salvation (comma-separated)" className="h-9 text-sm" />
      </CardContent>
    </Card>
  );
}
