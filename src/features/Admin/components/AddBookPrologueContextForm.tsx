// AddBookPrologueContextForm — step 2: author, audience, dates, background, lessons.
import { Globe2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { AddBookPrologueModel } from "../types";

interface Props {
  model: AddBookPrologueModel;
}

export function AddBookPrologueContextForm({ model: h }: Props) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sky-600">
        <Globe2 className="h-4 w-4" />
        <span className="text-sm font-medium">Historical & contextual info</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Author</Label>
          <Input
            placeholder="e.g. Moses"
            value={h.form.author}
            onChange={(e) => h.updateField("author", e.target.value)}
            className="border-border bg-background text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Chapters</Label>
          <Input
            type="number"
            min="1"
            value={h.form.chapters}
            onChange={(e) => h.updateField("chapters", e.target.value)}
            className="border-border bg-background text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">Author detail</Label>
        <Textarea
          placeholder="Background about the author..."
          value={h.form.authorDetail}
          onChange={(e) => h.updateField("authorDetail", e.target.value)}
          rows={3}
          className="border-border bg-background text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Audience</Label>
          <Input
            placeholder="e.g. Israel, All believers"
            value={h.form.audience}
            onChange={(e) => h.updateField("audience", e.target.value)}
            className="border-border bg-background text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Date written</Label>
          <Input
            placeholder="e.g. ~1446 BC"
            value={h.form.dateWritten}
            onChange={(e) => h.updateField("dateWritten", e.target.value)}
            className="border-border bg-background text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">Location written</Label>
        <Input
          placeholder="e.g. Sinai Wilderness"
          value={h.form.locationWritten}
          onChange={(e) => h.updateField("locationWritten", e.target.value)}
          className="border-border bg-background text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">Background</Label>
        <Textarea
          placeholder="Historical and cultural context..."
          value={h.form.background}
          onChange={(e) => h.updateField("background", e.target.value)}
          rows={4}
          className="border-border bg-background text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">Lessons</Label>
        <Textarea
          placeholder="Key lessons from this book..."
          value={h.form.lessons}
          onChange={(e) => h.updateField("lessons", e.target.value)}
          rows={3}
          className="border-border bg-background text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">Christ connection</Label>
        <Textarea
          placeholder="How this book points to Jesus..."
          value={h.form.christConnection}
          onChange={(e) => h.updateField("christConnection", e.target.value)}
          rows={3}
          className="border-border bg-background text-foreground placeholder:text-muted-foreground"
        />
      </div>
    </div>
  );
}
