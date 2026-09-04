import { Tag, Target, Trash2, ChevronUp, ChevronDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ReturnType } from "react";
import { useAddExplanation } from "../hooks/useAddExplanation";
import { CharCount } from "./CharCount";

type Model = ReturnType<typeof useAddExplanation>;

interface Props {
  model: Model;
}

const BACKGROUND_MAX = 10000;

export function AddExplanationStudyForm({ model: h }: Props) {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 text-sky-600">
        <Target className="h-4 w-4" />
        <span className="text-sm font-medium">Study context</span>
      </div>

      <div className="space-y-4 rounded-2xl border border-border bg-muted/30 p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Verse introduction</Label>
            <CharCount value={h.form.studyMetadata.introduction} max={BACKGROUND_MAX} />
          </div>
          <Textarea
            placeholder="Brief introduction to the verse..."
            value={h.form.studyMetadata.introduction}
            onChange={(e) => h.updateNested("studyMetadata", "introduction", e.target.value)}
            rows={5}
            maxLength={BACKGROUND_MAX}
            className="border-border bg-background text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-4 border-t border-border pt-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Background — Author</Label>
              <CharCount value={h.form.studyMetadata.backgroundAuthor} max={BACKGROUND_MAX} />
            </div>
            <Textarea
              value={h.form.studyMetadata.backgroundAuthor}
              onChange={(e) => h.updateNested("studyMetadata", "backgroundAuthor", e.target.value)}
              placeholder="Author background and attribution..."
              rows={5}
              maxLength={BACKGROUND_MAX}
              className="border-border bg-background text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Background — Book</Label>
              <CharCount value={h.form.studyMetadata.backgroundBook} max={BACKGROUND_MAX} />
            </div>
            <Textarea
              value={h.form.studyMetadata.backgroundBook}
              onChange={(e) => h.updateNested("studyMetadata", "backgroundBook", e.target.value)}
              placeholder="The book and its place in Scripture..."
              rows={5}
              maxLength={BACKGROUND_MAX}
              className="border-border bg-background text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Background — Context</Label>
              <CharCount value={h.form.studyMetadata.backgroundContext} max={BACKGROUND_MAX} />
            </div>
            <Textarea
              value={h.form.studyMetadata.backgroundContext}
              onChange={(e) => h.updateNested("studyMetadata", "backgroundContext", e.target.value)}
              placeholder="Context of the verse within the passage..."
              rows={5}
              maxLength={BACKGROUND_MAX}
              className="border-border bg-background text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-muted/30 p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-foreground">
            <Tag className="h-4 w-4 text-sky-600" />
            <span className="font-semibold">Strong's word study</span>
          </div>
          <Button variant="outline" size="sm" className="gap-2" onClick={h.addWordStudy}>
            <Plus className="h-3 w-3" /> Add word
          </Button>
        </div>

        {h.form.wordStudies.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">No word studies added yet.</p>
        ) : (
          <div className="space-y-3">
            {h.form.wordStudies.map((ws, i) => (
              <div key={i} className="flex gap-2 items-start rounded-xl border border-border bg-background p-3">
                <div className="flex flex-col gap-1 pt-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:bg-muted" disabled={i === 0} onClick={() => { const next = [...h.form.wordStudies]; [next[i - 1], next[i]] = [next[i], next[i - 1]]; h.updateField("wordStudies", next); }}>
                    <ChevronUp className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:bg-muted" disabled={i === h.form.wordStudies.length - 1} onClick={() => { const next = [...h.form.wordStudies]; [next[i], next[i + 1]] = [next[i + 1], next[i]]; h.updateField("wordStudies", next); }}>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </div>

                <div className="grid flex-1 gap-2 xl:grid-cols-3">
                  <Input
                     placeholder="H3034"
                     value={ws.strongsId}
                     onChange={(e) => h.updateWordStudy(i, "strongsId", e.target.value)}
                     onBlur={async (e) => {
                       const val = String(e.target.value || "").trim();
                       if (!val) return;
                       try {
                         // Lazy check if Strong's entry exists and store a transient flag
                         const entry = await (await import('@/services/strongsApi')).getStrongsEntry(val);
                         const exists = !!entry;
                         // update a transient field by using a reserved customDefinition suffix marker
                         // (keeps changes client-only and non-invasive to model) — store existence in DOM via data-attribute
                         const el = e.target as HTMLInputElement;
                         if (exists) el.dataset.strongsExists = '1';
                         else el.dataset.strongsExists = '0';
                       } catch {
                         /* ignore network errors */
                       }
                     }}
                     className="border-border bg-background text-foreground placeholder:text-muted-foreground"
                  />
                  <Input placeholder="Surface text" value={ws.surfaceText} onChange={(e) => h.updateWordStudy(i, "surfaceText", e.target.value)} className="border-border bg-background text-foreground placeholder:text-muted-foreground" />
                  <div className="space-y-1 xl:col-span-3">
                    <Textarea placeholder="Definition and word study..." value={ws.customDefinition} onChange={(e) => h.updateWordStudy(i, "customDefinition", e.target.value)} rows={3} maxLength={BACKGROUND_MAX} className="w-full border-border bg-background text-foreground placeholder:text-muted-foreground" />
                    <div className="flex justify-end"><CharCount value={ws.customDefinition} max={BACKGROUND_MAX} /></div>
                  </div>
                </div>

                <Button variant="ghost" size="icon" className="mt-1 text-red-500 hover:bg-red-500/10" onClick={() => h.removeWordStudy(i)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
