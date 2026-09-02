import { BookOpen, FileText } from "lucide-react";
import type { ChangeEventHandler } from "react";
import type { Translations } from "@/components/languages/type";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CATEGORIES, MOODS, MOOD_MAP, getCategoryLabel, getMoodLabel } from "../constants";
import { FormCard } from "./FormCard";

const ENTRY_CATEGORIES = CATEGORIES.filter((category) => category.value !== "all");
const INPUT_CLASS_NAME = "rounded-xl border-border dark:border-stone-800 bg-card dark:bg-stone-900 text-sm text-foreground dark:text-stone-200";
const LABEL_CLASS_NAME = "text-xs font-medium text-foreground/80 dark:text-muted-foreground/50";
const SELECT_CLASS_NAME = "rounded-xl border-border dark:border-stone-800 bg-card dark:bg-stone-900 text-sm h-9";
const SERIF_STYLE = { fontFamily: "'Georgia', 'Times New Roman', serif" };

interface JournalEntryTitleFieldProps {
  t: Translations;
  title: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
}

export function JournalEntryTitleField({ t, title, onChange }: JournalEntryTitleFieldProps) {
  return (
    <div className="space-y-1.5">
      <div className={LABEL_CLASS_NAME}>{t.journal.titleOptional || "Title (optional)"}</div>
      <Input
        placeholder={t.journal.titlePlaceholder || "Give your entry a title..."}
        value={title}
        onChange={onChange}
        className={INPUT_CLASS_NAME}
      />
    </div>
  );
}

interface JournalEntryContentFieldProps {
  t: Translations;
  content: string;
  wordCount: number;
  onChange: ChangeEventHandler<HTMLTextAreaElement>;
}

export function JournalEntryContentField({
  t,
  content,
  wordCount,
  onChange,
}: JournalEntryContentFieldProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className={LABEL_CLASS_NAME}>{t.journal.whatOnMind || "What's on your mind?"}</div>
        <div className="text-[11px] text-muted-foreground/70">
          <FileText className="w-3 h-3 inline mr-1" />
          {wordCount} {wordCount === 1 ? t.journal.word || "word" : t.journal.words || "words"}
        </div>
      </div>
      <Textarea
        placeholder={t.journal.contentPlaceholder || "Write your thoughts, feelings, or reflections..."}
        value={content}
        onChange={onChange}
        className={`${INPUT_CLASS_NAME} min-h-[200px]`}
        style={SERIF_STYLE}
      />
    </div>
  );
}

interface JournalEntryCategoryFieldProps {
  t: Translations;
  category: string;
  onValueChange: (category: string) => void;
}

export function JournalEntryCategoryField({
  t,
  category,
  onValueChange,
}: JournalEntryCategoryFieldProps) {
  return (
    <div className="space-y-1.5">
      <div className={LABEL_CLASS_NAME}>{t.journal.promptCategory || "Category"}</div>
      <Select value={category} onValueChange={onValueChange}>
        <SelectTrigger className={SELECT_CLASS_NAME}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ENTRY_CATEGORIES.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {getCategoryLabel(t, item.value)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

interface JournalEntryMoodFieldProps {
  t: Translations;
  mood: string;
  onValueChange: (mood: string) => void;
}

export function JournalEntryMoodField({
  t,
  mood,
  onValueChange,
}: JournalEntryMoodFieldProps) {
  const selectedMood = MOOD_MAP[mood];

  return (
    <div className="space-y-1.5">
      <div className={LABEL_CLASS_NAME}>{t.journal.howFeeling || "How are you feeling?"}</div>
      <Select value={mood} onValueChange={onValueChange}>
        <SelectTrigger className={SELECT_CLASS_NAME}>
          <SelectValue placeholder={t.journal.selectMood || "Select mood"}>
            {selectedMood
              ? `${selectedMood.emoji} ${getMoodLabel(t, mood)}`
              : t.journal.selectMood || "Select mood"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {MOODS.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              <span className="flex items-center gap-2">
                <span className="text-lg">{item.emoji}</span>
                <span>{getMoodLabel(t, item.value)}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

interface JournalEntryCoreFormProps {
  t: Translations;
  title: string;
  content: string;
  category: string;
  mood: string;
  wordCount: number;
  onTitleChange: ChangeEventHandler<HTMLInputElement>;
  onContentChange: ChangeEventHandler<HTMLTextAreaElement>;
  onCategoryChange: (category: string) => void;
  onMoodChange: (mood: string) => void;
}

export function JournalEntryCoreForm({
  t,
  title,
  content,
  category,
  mood,
  wordCount,
  onTitleChange,
  onContentChange,
  onCategoryChange,
  onMoodChange,
}: JournalEntryCoreFormProps) {
  return (
    <FormCard title={t.journal.journalEntry || "Journal Entry"} icon={BookOpen}>
      <div className="space-y-4">
        <JournalEntryTitleField t={t} title={title} onChange={onTitleChange} />
        <JournalEntryContentField
          t={t}
          content={content}
          wordCount={wordCount}
          onChange={onContentChange}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <JournalEntryCategoryField
            t={t}
            category={category}
            onValueChange={onCategoryChange}
          />
          <JournalEntryMoodField t={t} mood={mood} onValueChange={onMoodChange} />
        </div>
      </div>
    </FormCard>
  );
}
