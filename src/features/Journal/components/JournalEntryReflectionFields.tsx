import { Heart, Lightbulb, Pencil, Star, type LucideIcon } from "lucide-react";
import type { ChangeEventHandler } from "react";
import type { Translations } from "@/components/languages/type";
import { Textarea } from "@/components/ui/textarea";
import { FormCard } from "./FormCard";

const TEXTAREA_CLASS_NAME = "rounded-xl border-border dark:border-stone-800 bg-card dark:bg-stone-900 text-sm text-foreground dark:text-stone-200 min-h-[100px]";
const SERIF_STYLE = { fontFamily: "'Georgia', 'Times New Roman', serif" };

interface JournalFormReflectionFieldProps {
  title: string;
  subtitle: string;
  placeholder: string;
  value: string;
  icon: LucideIcon;
  compact?: boolean;
  onChange: ChangeEventHandler<HTMLTextAreaElement>;
}

export function JournalFormReflectionField({
  title,
  subtitle,
  placeholder,
  value,
  icon,
  compact = false,
  onChange,
}: JournalFormReflectionFieldProps) {
  return (
    <FormCard title={title} icon={icon} subtitle={subtitle}>
      <Textarea
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={compact ? `${TEXTAREA_CLASS_NAME} min-h-[120px]` : TEXTAREA_CLASS_NAME}
        style={SERIF_STYLE}
      />
    </FormCard>
  );
}

interface JournalEntryReflectionFieldsProps {
  t: Translations;
  learnings: string;
  application: string;
  gratitude: string;
  prayers: string;
  onLearningsChange: ChangeEventHandler<HTMLTextAreaElement>;
  onApplicationChange: ChangeEventHandler<HTMLTextAreaElement>;
  onGratitudeChange: ChangeEventHandler<HTMLTextAreaElement>;
  onPrayersChange: ChangeEventHandler<HTMLTextAreaElement>;
}

export function JournalEntryReflectionFields({
  t,
  learnings,
  application,
  gratitude,
  prayers,
  onLearningsChange,
  onApplicationChange,
  onGratitudeChange,
  onPrayersChange,
}: JournalEntryReflectionFieldsProps) {
  return (
    <>
      <JournalFormReflectionField
        title={t.journal.whatILearned || "What I Learned"}
        subtitle={t.journal.learnSubtitle || "Insights & revelations from this reading"}
        placeholder={t.journal.learnPlaceholder || "Key insights or revelations from your reading..."}
        value={learnings}
        icon={Lightbulb}
        onChange={onLearningsChange}
      />
      <JournalFormReflectionField
        title={t.journal.howIllApply || "How I'll Apply"}
        subtitle={t.journal.applySubtitle || "Practical steps to live out this truth"}
        placeholder={t.journal.applyPlaceholder || "How will this change your life or actions?"}
        value={application}
        icon={Pencil}
        onChange={onApplicationChange}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <JournalFormReflectionField
          title={t.journal.gratitude || "Gratitude"}
          subtitle={t.journal.gratitudeSubtitle || "Counting blessings and gifts"}
          placeholder={t.journal.gratPlaceholder || "List your gratitude..."}
          value={gratitude}
          icon={Heart}
          compact
          onChange={onGratitudeChange}
        />
        <JournalFormReflectionField
          title={t.journal.prayers || "Prayers"}
          subtitle={t.journal.prayerSubtitle || "Conversations with the Father"}
          placeholder={t.journal.prayerPlaceholder || "Prayers and requests..."}
          value={prayers}
          icon={Star}
          compact
          onChange={onPrayersChange}
        />
      </div>
    </>
  );
}
