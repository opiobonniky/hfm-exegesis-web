import { Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { FormCard } from "./FormCard";
import type { JournalEntryFormData } from "../types";
import { tt } from '@/components/languages/hardcodedTranslate';

interface Props {
  entry: JournalEntryFormData;
  updateField: (k: string, v: any) => void;
  t: any;
}

export function AdditionalSection({ entry, updateField, t }: Props) {
  return (
    <FormCard title={t.journal?.additional || tt("Additional")} icon={Tag}>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-foreground/80 dark:text-muted-foreground/50">{t.journal?.tags || tt("Tags")}</Label>
          <Input placeholder={t.journal?.tagsPlaceholder || tt("comma, separated, tags")} value={entry.tags} onChange={(e) => updateField("tags", e.target.value)}
            className="rounded-xl border-border dark:border-stone-800 bg-card dark:bg-stone-900 text-sm text-foreground dark:text-stone-200" />
        </div>
        <div className="flex items-center justify-between pt-1">
          <Label className="text-xs font-medium text-foreground/80 dark:text-muted-foreground/50">{t.journal?.addToFavorites || tt("Add to favorites")}</Label>
          <Switch checked={entry.isFavorite} onCheckedChange={(v) => updateField("isFavorite", v)} className="data-[state=checked]:bg-stone-800 dark:data-[state=checked]:bg-stone-200" />
        </div>
        <div className="flex items-center justify-between pt-1">
          <div>
            <Label className="text-xs font-medium text-foreground/80 dark:text-muted-foreground/50">{t.journal?.privacy || tt("Privacy")}</Label>
            <p className="text-[10px] text-muted-foreground/60 dark:text-muted-foreground/50 mt-0.5">
              {entry.isPublished ? (t.journal?.publicDesc || tt("Visible in Community")) : (t.journal?.privateDesc || tt("Only you can see this"))}
            </p>
          </div>
          <Switch checked={entry.isPublished} onCheckedChange={(v) => updateField("isPublished", v)} className="data-[state=checked]:bg-emerald-600 dark:data-[state=checked]:bg-emerald-500" />
        </div>
      </div>
    </FormCard>
  );
}
