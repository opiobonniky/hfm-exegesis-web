import { useEffect, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Check, Link2, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Combobox } from "@/components/ui/combobox";
import { BIBLE_BOOKS } from "@/data/staticData";
import type { useStudyTools } from "../hooks/useStudyTools";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Model = ReturnType<typeof useStudyTools>["data"] & ReturnType<typeof useStudyTools>["actions"];

interface StudyResourceEditorProps {
  model: Model;
  onBack: () => void;
}

export default function StudyResourceEditor({ model, onBack }: StudyResourceEditorProps) {
  const {
    verseBook, handleBookChange, verseChapter, handleChapterChange, verseNum, setVerseNum,
    verseChapList, verseNumList, verseText, verseTextLoading, currentResource, resourcesLoading, resourceSaving,
    loadResource, saveResource, wordStudies, setWordStudies, commentaries, setCommentaries,
    crossRefs, setCrossRefs, dictTerms, setDictTerms, topics, setTopics,
  } = model;
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("reference");
  const tabOrder = ["reference", "words", "crossRefs", "commentaries", "dictionary", "topics"];

  useEffect(() => {
    if (verseBook && verseChapter && verseNum) loadResource(verseBook, verseChapter, verseNum);
  }, [loadResource, verseBook, verseChapter, verseNum]);

  const addWord = () => setWordStudies([...wordStudies, { word: "", transliteration: "", meaning: "", strongs: "" } as any]);
  const addCrossRef = () => setCrossRefs([...crossRefs, { ref: "", text: "" }]);
  const addCommentary = () => setCommentaries([...commentaries, { author: "", title: "", text: "" }]);
  const addDictionary = () => setDictTerms([...dictTerms, { term: "", pronunciation: "", definition: "", description: "" }]);
  const addTopic = () => setTopics([...topics, { name: "" }]);

  const handleSave = async () => {
    setSaved(await saveResource());
    window.setTimeout(() => setSaved(false), 2500);
  };

  const handleContinue = async () => {
    const didSave = await saveResource();
    if (!didSave) return;
    const nextTab = tabOrder[tabOrder.indexOf(activeTab) + 1];
    if (nextTab) setActiveTab(nextTab);
  };

  const handlePrevious = () => {
    const previousTab = tabOrder[tabOrder.indexOf(activeTab) - 1];
    if (previousTab) setActiveTab(previousTab);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-5 w-5" /></Button>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary">Admin study tools</p>
            <h1 className="text-2xl font-black">Add Verse Study Resources</h1>
            <p className="text-sm text-muted-foreground">Attach Strong&apos;s studies, cross-references, and research notes to a verse.</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={resourceSaving || !verseBook || !verseChapter || !verseNum} className="gap-2">
          {resourceSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saved ? "Saved" : currentResource?.id ? "Update resources" : "Save resources"}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5">
        <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto rounded-xl border bg-card p-1">
          <TabsTrigger value="reference" className="shrink-0 gap-1.5"><BookOpen className="h-4 w-4" />Reference</TabsTrigger>
          <TabsTrigger value="words" className="shrink-0">Words <TabCount count={wordStudies.length} /></TabsTrigger>
          <TabsTrigger value="crossRefs" className="shrink-0">Cross references <TabCount count={crossRefs.length} /></TabsTrigger>
          <TabsTrigger value="commentaries" className="shrink-0">Commentaries <TabCount count={commentaries.length} /></TabsTrigger>
          <TabsTrigger value="dictionary" className="shrink-0">Dictionary <TabCount count={dictTerms.length} /></TabsTrigger>
          <TabsTrigger value="topics" className="shrink-0">Topics <TabCount count={topics.length} /></TabsTrigger>
        </TabsList>

        <TabsContent value="reference">
          <section className="rounded-2xl border bg-card p-4 sm:p-6 space-y-4">
            <div><div className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-primary" /><h2 className="font-semibold">Verse reference</h2></div><p className="mt-1 text-sm text-muted-foreground">Choose the verse that these study resources explain.</p></div>
            <div className="grid gap-3 sm:grid-cols-3">
              <Combobox options={BIBLE_BOOKS.map((book) => ({ value: book, label: book }))} value={verseBook} onChange={(v) => v && handleBookChange(v)} placeholder="Select book" width="w-full" />
              <Combobox options={verseChapList.map((chapter) => ({ value: String(chapter), label: `Chapter ${chapter}` }))} value={verseChapter ? String(verseChapter) : ""} onChange={(v) => v && handleChapterChange(Number(v))} placeholder="Select chapter" disabled={!verseBook} width="w-full" />
              <Combobox options={verseNumList.map((verse) => ({ value: String(verse), label: `Verse ${verse}` }))} value={verseNum ? String(verseNum) : ""} onChange={(v) => v && setVerseNum(Number(v))} placeholder="Select verse" disabled={!verseChapter} width="w-full" />
            </div>
            {(verseTextLoading || verseText) && (
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-primary">Selected verse</p>
                {verseTextLoading ? (
                  <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
                ) : (
                  <p className="font-serif text-base italic leading-relaxed text-foreground/90">
                    “{verseText}”
                  </p>
                )}
              </div>
            )}
            {resourcesLoading && <p className="text-xs text-muted-foreground">Loading existing resources...</p>}
          </section>
          <TabNavigation onPrevious={handlePrevious} onContinue={handleContinue} isSaving={resourceSaving} isFirst />
        </TabsContent>
        <TabsContent value="words"><ResourceSection title="Strong&apos;s word studies" description="Use the Strong&apos;s ID stored on VerseWordStudyEntry and add the contextual explanation." onAdd={addWord} addLabel="Add word study">{wordStudies.map((item: any, index) => <div key={index} className="grid gap-2 rounded-xl border p-3 sm:grid-cols-[140px_1fr_1fr_auto]"><Input placeholder="H3068" aria-label="Strong's ID, for example H3068" value={item.strongs || ""} onChange={(e) => setWordStudies(wordStudies.map((x: any, i) => i === index ? { ...x, strongs: e.target.value } : x))} /><Input placeholder="יְהוָה (YHWH)" aria-label="Original word, for example YHWH" value={item.word} onChange={(e) => setWordStudies(wordStudies.map((x: any, i) => i === index ? { ...x, word: e.target.value } : x))} /><Textarea placeholder="Explain this word in this verse..." aria-label="Contextual word explanation" value={item.meaning} onChange={(e) => setWordStudies(wordStudies.map((x: any, i) => i === index ? { ...x, meaning: e.target.value } : x))} /><Button variant="ghost" size="icon" onClick={() => setWordStudies(wordStudies.filter((_, i) => i !== index))}><Trash2 className="h-4 w-4 text-destructive" /></Button></div>)}</ResourceSection><TabNavigation onPrevious={handlePrevious} onContinue={handleContinue} isSaving={resourceSaving} /></TabsContent>
        <TabsContent value="crossRefs"><ResourceSection title="Cross references" description="Connect this verse to related passages and explain the relationship." onAdd={addCrossRef} addLabel="Add cross reference">{crossRefs.map((item, index) => <div key={index} className="grid gap-2 rounded-xl border p-3 sm:grid-cols-[220px_1fr_auto]"><Input placeholder="Psalm 105:1" aria-label="Cross-reference, for example Psalm 105:1" value={item.ref} onChange={(e) => setCrossRefs(crossRefs.map((x, i) => i === index ? { ...x, ref: e.target.value } : x))} /><Textarea placeholder="Explain how this passage is related..." aria-label="Cross-reference explanation" value={item.text} onChange={(e) => setCrossRefs(crossRefs.map((x, i) => i === index ? { ...x, text: e.target.value } : x))} /><Button variant="ghost" size="icon" onClick={() => setCrossRefs(crossRefs.filter((_, i) => i !== index))}><Trash2 className="h-4 w-4 text-destructive" /></Button></div>)}</ResourceSection><TabNavigation onPrevious={handlePrevious} onContinue={handleContinue} isSaving={resourceSaving} /></TabsContent>
        <TabsContent value="commentaries"><ResourceSection title="Commentaries" onAdd={addCommentary} addLabel="Add commentary">{commentaries.map((item, index) => <div key={index} className="grid gap-2 rounded-xl border p-3 sm:grid-cols-[1fr_1fr_auto]"><Input placeholder="Author" value={item.author} onChange={(e) => setCommentaries(commentaries.map((x, i) => i === index ? { ...x, author: e.target.value } : x))} /><Input placeholder="Title" value={item.title} onChange={(e) => setCommentaries(commentaries.map((x, i) => i === index ? { ...x, title: e.target.value } : x))} /><Button variant="ghost" size="icon" aria-label="Remove commentary" onClick={() => setCommentaries(commentaries.filter((_, i) => i !== index))}><Trash2 className="h-4 w-4 text-destructive" /></Button><Textarea className="sm:col-span-3" placeholder="Commentary" value={item.text} onChange={(e) => setCommentaries(commentaries.map((x, i) => i === index ? { ...x, text: e.target.value } : x))} /></div>)}</ResourceSection><TabNavigation onPrevious={handlePrevious} onContinue={handleContinue} isSaving={resourceSaving} /></TabsContent>
        <TabsContent value="dictionary"><ResourceSection title="Dictionary terms" onAdd={addDictionary} addLabel="Add term">{dictTerms.map((item, index) => <div key={index} className="grid gap-2 rounded-xl border p-3 sm:grid-cols-[1fr_1fr_auto]"><Input placeholder="Term" value={item.term} onChange={(e) => setDictTerms(dictTerms.map((x, i) => i === index ? { ...x, term: e.target.value } : x))} /><Input placeholder="Pronunciation" value={item.pronunciation} onChange={(e) => setDictTerms(dictTerms.map((x, i) => i === index ? { ...x, pronunciation: e.target.value } : x))} /><Button variant="ghost" size="icon" aria-label="Remove dictionary term" onClick={() => setDictTerms(dictTerms.filter((_, i) => i !== index))}><Trash2 className="h-4 w-4 text-destructive" /></Button><Input placeholder="Definition" value={item.definition} onChange={(e) => setDictTerms(dictTerms.map((x, i) => i === index ? { ...x, definition: e.target.value } : x))} /><Textarea className="sm:col-span-2" placeholder="Description" value={item.description} onChange={(e) => setDictTerms(dictTerms.map((x, i) => i === index ? { ...x, description: e.target.value } : x))} /></div>)}</ResourceSection><TabNavigation onPrevious={handlePrevious} onContinue={handleContinue} isSaving={resourceSaving} /></TabsContent>
        <TabsContent value="topics"><ResourceSection title="Related topics" onAdd={addTopic} addLabel="Add topic"><div className="flex flex-wrap gap-2">{topics.map((item, index) => <div key={index} className="flex items-center gap-1 rounded-full border px-2 py-1"><Input className="h-7 w-36 border-0 bg-transparent p-1" placeholder="Topic" value={item.name} onChange={(e) => setTopics(topics.map((x, i) => i === index ? { ...x, name: e.target.value } : x))} /><Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setTopics(topics.filter((_, i) => i !== index))}><Trash2 className="h-3 w-3 text-destructive" /></Button></div>)}</div></ResourceSection><TabNavigation onPrevious={handlePrevious} onContinue={handleContinue} isSaving={resourceSaving} isLast /></TabsContent>
      </Tabs>
    </div>
  );
}

function TabCount({ count }: { count: number }) {
  return <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px]">{count}</span>;
}

function TabNavigation({
  onPrevious,
  onContinue,
  isSaving,
  isFirst = false,
  isLast = false,
}: {
  onPrevious: () => void;
  onContinue: () => void;
  isSaving: boolean;
  isFirst?: boolean;
  isLast?: boolean;
}) {
  return (
    <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl border bg-card p-3">
      <Button variant="ghost" onClick={onPrevious} disabled={isFirst} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Previous
      </Button>
      <p className="hidden text-xs text-muted-foreground sm:block">
        {isLast ? "Save your final changes when ready." : "Your changes are saved before continuing."}
      </p>
      <Button onClick={onContinue} disabled={isSaving} className="gap-2">
        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : isLast ? <Check className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
        {isSaving ? "Saving..." : isLast ? "Save changes" : "Continue & save"}
      </Button>
    </div>
  );
}

function ResourceSection({ title, description, onAdd, addLabel, children }: { title: string; description?: string; onAdd: () => void; addLabel: string; children: ReactNode }) {
  return <section className="rounded-2xl border bg-card p-4 sm:p-6 space-y-4">
    <div>
      <div><div className="flex items-center gap-2"><Link2 className="h-4 w-4 text-primary" /><h2 className="font-semibold">{title}</h2></div>{description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}</div>
    </div>
    {children}
    <div className="border-t pt-4">
      <Button variant="outline" size="sm" onClick={onAdd} className="w-fit gap-1">
        <Plus className="h-3 w-3" />{addLabel}
      </Button>
    </div>
  </section>;
}
