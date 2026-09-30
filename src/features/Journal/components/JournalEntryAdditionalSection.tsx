import { Tag } from "lucide-react";
import type { ChangeEventHandler } from "react";
import type { Translations } from "@/components/languages/type";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { FormCard } from "./FormCard";
import { tt } from '@/components/languages/hardcodedTranslate';

interface JournalEntryAdditionalSectionProps {
  t: Translations;
  tags: string;
  isFavorite: boolean;
  isPublished: boolean;
  onTagsChange: ChangeEventHandler<HTMLInputElement>;
  onFavoriteChange: (isFavorite: boolean) => void;
  onPublishedChange: (isPublished: boolean) => void;
}

export function JournalEntryAdditionalSection({
  t,
  tags,
  isFavorite,
  isPublished,
  onTagsChange,
  onFavoriteChange,
  onPublishedChange,
}: JournalEntryAdditionalSectionProps) {
  return (
    <FormCard title={t.journal.additional || tt("Additional")} icon={Tag}>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-foreground/80 dark:text-muted-foreground/50">
            {t.journal.tags || tt("Tags")}
          </Label>
          <Input
            placeholder={t.journal.tagsPlaceholder || tt("comma, separated, tags")}
            value={tags}
            onChange={onTagsChange}
            className="rounded-xl border-border dark:border-stone-800 bg-card dark:bg-stone-900 text-sm text-foreground dark:text-stone-200"
          />
        </div>
        <div className="flex items-center justify-between pt-1">
          <Label className="text-xs font-medium text-foreground/80 dark:text-muted-foreground/50">
            {t.journal.addToFavorites || tt("Add to favorites")}
          </Label>
          <Switch
            checked={isFavorite}
            onCheckedChange={onFavoriteChange}
            className="data-[state=checked]:bg-stone-800 dark:data-[state=checked]:bg-stone-200"
          />
        </div>
        <div className="flex items-center justify-between pt-1">
          <div>
            <Label className="text-xs font-medium text-foreground/80 dark:text-muted-foreground/50">
              {t.journal.privacy || tt("Privacy")}
            </Label>
            <p className="text-[10px] text-muted-foreground/60 dark:text-muted-foreground/50 mt-0.5">
              {isPublished
                ? t.journal.publicDesc || tt("Visible in Community")
                : t.journal.privateDesc || tt("Only you can see this")}
            </p>
          </div>
          <Switch
            checked={isPublished}
            onCheckedChange={onPublishedChange}
            className="data-[state=checked]:bg-emerald-600 dark:data-[state=checked]:bg-emerald-500"
          />
        </div>
      </div>
    </FormCard>
  );
}
