// BackgroundSection — Author, Book, Context background textareas
import { User, BookOpen, MapPin } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  backgroundAuthor: string; setBackgroundAuthor: (v: string) => void;
  backgroundBook: string; setBackgroundBook: (v: string) => void;
  backgroundContext: string; setBackgroundContext: (v: string) => void;
  isRtl: boolean;
}

export function BackgroundSection(p: Props) {
  const fields = [
    { label: "Background — Author", icon: <User className="h-4 w-4 text-purple-500" />, value: p.backgroundAuthor, onChange: p.setBackgroundAuthor, placeholder: "Who wrote the book and why does that matter?" },
    { label: "Background — Book", icon: <BookOpen className="h-4 w-4 text-indigo-500" />, value: p.backgroundBook, onChange: p.setBackgroundBook, placeholder: "Summarize the book and its major purpose..." },
    { label: "Background — Context", icon: <MapPin className="h-4 w-4 text-orange-500" />, value: p.backgroundContext, onChange: p.setBackgroundContext, placeholder: "Describe the immediate historical and literary context..." },
  ];

  return (
    <div className="space-y-5" dir={p.isRtl ? "rtl" : "ltr"}>
      {fields.map((f) => (
        <div key={f.label} className="space-y-2">
          <Label className="flex items-center gap-2">
            {f.icon} {f.label}
          </Label>
          <Textarea
            value={f.value}
            onChange={(e) => f.onChange(e.target.value)}
            placeholder={f.placeholder}
            rows={4}
            className="resize-none"
          />
        </div>
      ))}
    </div>
  );
}
