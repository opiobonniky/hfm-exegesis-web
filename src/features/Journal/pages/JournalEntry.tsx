import { useNavigate } from "react-router-dom";
import { BookOpen, Lightbulb, Pencil, Heart, Star, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useJournalEntryPage } from "../hooks/useJournalEntryPage";
import { JournalEntryHeader } from "../components/JournalEntryHeader";
import { FormCard } from "../components/FormCard";
import { ScriptureLink } from "../components/ScriptureLink";
import { AdditionalSection } from "../components/AdditionalSection";
import { TemplatesDialog } from "../components/TemplatesDialog";

const CATEGORIES = [
  { value: "general", key: "categoryGeneral" }, { value: "study", key: "categoryStudy" },
  { value: "prayer", key: "categoryPrayer" }, { value: "gratitude", key: "categoryGratitude" },
  { value: "reflection", key: "categoryReflection" }, { value: "application", key: "categoryApplication" },
];

const MOODS = [
  { value: "happy", key: "moodHappy", emoji: "😊" }, { value: "grateful", key: "moodGrateful", emoji: "🙏" },
  { value: "peaceful", key: "moodPeaceful", emoji: "🕊️" }, { value: "thoughtful", key: "moodThoughtful", emoji: "🤔" },
  { value: "motivated", key: "moodMotivated", emoji: "💪" }, { value: "hopeful", key: "moodHopeful", emoji: "🌟" },
  { value: "challenged", key: "moodChallenged", emoji: "🧗" }, { value: "blessed", key: "moodBlessed", emoji: "✨" },
];

const MOOD_MAP = Object.fromEntries(MOODS.map((m) => [m.value, m]));
const getCategoryLabel = (t: any, v: string) => { const c = CATEGORIES.find((x) => x.value === v); return c ? (t.journal as any)?.[c.key] || v : v; };
const getMoodLabel = (t: any, v: string) => { const m = MOODS.find((x) => x.value === v); return m ? (t.journal as any)?.[m.key] || v : v; };

export default function JournalEntryPage() {
  const p = useJournalEntryPage();
  const { t, isRtl, navigate, entry, setEntry, loading, saving, handleSave, testament, setTestament, books, chapters, verses, verseText, templates, showTemplates, setShowTemplates, handleApplyTemplate, applyTemplate, updateField } = p;

  const wordCount = entry.content.trim() ? entry.content.trim().split(/\s+/).length : 0;
  const inputCls = "rounded-xl border-border dark:border-stone-800 bg-card dark:bg-stone-900 text-sm text-foreground dark:text-stone-200";
  const taCls = inputCls + " min-h-[100px]";
  const labelCls = "text-xs font-medium text-foreground/80 dark:text-muted-foreground/50";

  return (
    <div className="min-h-screen bg-amber-50/30 dark:bg-stone-950" dir={isRtl ? "rtl" : "ltr"}>
      <JournalEntryHeader navigate={navigate} t={t} saving={saving} handleSave={handleSave} setShowTemplates={setShowTemplates} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="grid gap-6 md:grid-cols-3">
          {/* Left Column */}
          <div className="md:col-span-2 space-y-6">
            <FormCard title={t.journal?.journalEntry || "Journal Entry"} icon={BookOpen}>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className={labelCls}>{t.journal?.titleOptional || "Title (optional)"}</Label>
                  <Input placeholder={t.journal?.titlePlaceholder || "Give your entry a title..."} value={entry.title} onChange={(e) => updateField("title", e.target.value)} className={inputCls} />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className={labelCls}>{t.journal?.whatOnMind || "What's on your mind?"}</Label>
                    <span className="text-[11px] text-muted-foreground/70"><FileText className="w-3 h-3 inline mr-1" />{wordCount} {wordCount === 1 ? "word" : "words"}</span>
                  </div>
                  <Textarea placeholder={t.journal?.contentPlaceholder || "Write your thoughts, feelings, or reflections..."} value={entry.content} onChange={(e) => updateField("content", e.target.value)}
                    className={taCls + " min-h-[200px]"} style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className={labelCls}>{t.journal?.promptCategory || "Category"}</Label>
                    <Select value={entry.category} onValueChange={(v) => updateField("category", v)}>
                      <SelectTrigger className="rounded-xl border-border dark:border-stone-800 bg-card dark:bg-stone-900 text-sm h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{getCategoryLabel(t, c.value)}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className={labelCls}>{t.journal?.howFeeling || "How are you feeling?"}</Label>
                    <Select value={entry.mood} onValueChange={(v) => updateField("mood", v)}>
                      <SelectTrigger className="rounded-xl border-border dark:border-stone-800 bg-card dark:bg-stone-900 text-sm h-9">
                        <SelectValue placeholder={t.journal?.selectMood || "Select mood"}>
                          {entry.mood && MOOD_MAP[entry.mood] ? <span>{MOOD_MAP[entry.mood].emoji} {getMoodLabel(t, entry.mood)}</span> : t.journal?.selectMood || "Select mood"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>{MOODS.map((m) => <SelectItem key={m.value} value={m.value}><span className="flex items-center gap-2"><span className="text-lg">{m.emoji}</span><span>{getMoodLabel(t, m.value)}</span></span></SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </FormCard>

            <FormCard title={t.journal?.whatILearned || "What I Learned"} icon={Lightbulb} subtitle={t.journal?.learnSubtitle || "Insights & revelations from this reading"}>
              <Textarea placeholder={t.journal?.learnPlaceholder || "Key insights or revelations from your reading..."} value={entry.learnings} onChange={(e) => updateField("learnings", e.target.value)}
                className={taCls} style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }} />
            </FormCard>

            <FormCard title={t.journal?.howIllApply || "How I'll Apply"} icon={Pencil} subtitle={t.journal?.applySubtitle || "Practical steps to live out this truth"}>
              <Textarea placeholder={t.journal?.applyPlaceholder || "How will this change your life or actions?"} value={entry.application} onChange={(e) => updateField("application", e.target.value)}
                className={taCls} style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }} />
            </FormCard>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormCard title={t.journal?.gratitude || "Gratitude"} icon={Heart} subtitle={t.journal?.gratitudeSubtitle || "Counting blessings and gifts"}>
                <Textarea placeholder={t.journal?.gratPlaceholder || "List your gratitude..."} value={entry.gratitude} onChange={(e) => updateField("gratitude", e.target.value)}
                  className={taCls + " min-h-[120px]"} style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }} />
              </FormCard>
              <FormCard title={t.journal?.prayers || "Prayers"} icon={Star} subtitle={t.journal?.prayerSubtitle || "Conversations with the Father"}>
                <Textarea placeholder={t.journal?.prayerPlaceholder || "Prayers and requests..."} value={entry.prayers} onChange={(e) => updateField("prayers", e.target.value)}
                  className={taCls + " min-h-[120px]"} style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }} />
              </FormCard>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <ScriptureLink t={t} testament={testament} setTestament={setTestament} entry={entry} setEntry={setEntry}
              books={books} chapters={chapters} verses={verses} verseText={verseText} updateField={updateField} navigate={navigate} />
            <AdditionalSection entry={entry} updateField={updateField} t={t} />
          </div>
        </div>
      </div>

      <TemplatesDialog open={showTemplates} onOpenChange={setShowTemplates} templates={templates} t={t}
        handleApplyTemplate={handleApplyTemplate} applyTemplate={applyTemplate} />
    </div>
  );
}
