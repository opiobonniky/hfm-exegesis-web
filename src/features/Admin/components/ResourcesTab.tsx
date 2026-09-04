"use client";

import { useState } from "react";
import {
  Plus, X, BookOpen, MessageSquare,
  Link, BookText, Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { useStudyTools } from "../hooks/useStudyTools";

type StudyToolsState = ReturnType<typeof useStudyTools>;

interface ResourcesTabProps {
  state: StudyToolsState;
}

export default function ResourcesTab({ state }: ResourcesTabProps) {
  const {
    resourcesLoading,
    wordStudies, setWordStudies, commentaries, setCommentaries,
    crossRefs, setCrossRefs, dictTerms, setDictTerms,
    topics, setTopics,
  } = state;

  const [activeSection, setActiveSection] = useState<"commentaries" | "crossRefs" | "wordStudies" | "dictionary" | "topics">("commentaries");

  const SECTIONS = [
    { key: "commentaries" as const, label: "Commentaries", icon: MessageSquare, count: commentaries.length },
    { key: "crossRefs" as const, label: "Cross References", icon: Link, count: crossRefs.length },
    { key: "wordStudies" as const, label: "Word Studies", icon: BookOpen, count: wordStudies.length },
    { key: "dictionary" as const, label: "Dictionary", icon: BookText, count: dictTerms.length },
    { key: "topics" as const, label: "Topics", icon: Tag, count: topics.length },
  ];

  if (resourcesLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-xl bg-[hsl(var(--skeleton))] animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.key}
              onClick={() => setActiveSection(s.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeSection === s.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <Icon className="w-3 h-3" />
              {s.label}
              <span className="ml-1 px-1.5 py-0.5 rounded-md bg-background/20 text-[10px]">
                {s.count}
              </span>
            </button>
          );
        })}
      </div>
      {activeSection === "commentaries" && (
        <CommentarySection items={commentaries} setItems={setCommentaries} />
      )}
      {activeSection === "crossRefs" && (
        <CrossRefSection items={crossRefs} setItems={setCrossRefs} />
      )}
      {activeSection === "wordStudies" && (
        <WordStudySection items={wordStudies} setItems={setWordStudies} />
      )}
      {activeSection === "dictionary" && (
        <DictionarySection items={dictTerms} setItems={setDictTerms} />
      )}
      {activeSection === "topics" && (
        <TopicSection items={topics} setItems={setTopics} />
      )}
    </div>
  );
}

// ── Sub-sections ──

function CommentarySection({ items, setItems }: { items: any[]; setItems: (v: any[]) => void }) {
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [form, setForm] = useState({ author: "", title: "", text: "" });

  const addOrUpdate = () => {
    if (!form.author.trim() || !form.text.trim()) return;
    const updated = [...items];
    if (editIdx !== null) updated[editIdx] = { ...form };
    else updated.push({ ...form });
    setItems(updated);
    setForm({ author: "", title: "", text: "" });
    setEditIdx(null);
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Input placeholder="Author" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} className="h-9 text-sm" />
        <Input placeholder="Title (optional)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="h-9 text-sm" />
        <Textarea placeholder="Commentary text..." value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} rows={3} className="text-sm" />
        <div className="flex gap-2">
          <Button size="sm" onClick={addOrUpdate} className="h-8 text-xs gap-1">
            <Plus className="w-3 h-3" /> {editIdx !== null ? "Update" : "Add"}
          </Button>
          {editIdx !== null && (
            <Button size="sm" variant="ghost" onClick={() => { setEditIdx(null); setForm({ author: "", title: "", text: "" }); }} className="h-8 text-xs">
              <X className="w-3 h-3 mr-1" /> Cancel
            </Button>
          )}
        </div>
      </div>
      {items.map((item, i) => (
        <div key={i} className="p-3 rounded-lg border border-border bg-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold">{item.author}</p>
              {item.title && <p className="text-xs text-muted-foreground">{item.title}</p>}
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.text}</p>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setEditIdx(i); setForm(item); }}>
                <span className="text-xs">✏️</span>
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setItems(items.filter((_, j) => j !== i))}>
                <X className="w-3 h-3 text-destructive" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function CrossRefSection({ items, setItems }: { items: any[]; setItems: (v: any[]) => void }) {
  const [form, setForm] = useState({ ref: "", text: "" });

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input placeholder="Reference (e.g. John 3:16)" value={form.ref} onChange={(e) => setForm({ ...form, ref: e.target.value })} className="h-9 text-sm flex-1" />
        <Input placeholder="Text" value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} className="h-9 text-sm flex-1" />
        <Button size="sm" onClick={() => { if (form.ref.trim()) { setItems([...items, { ...form }]); setForm({ ref: "", text: "" }); } }} className="h-9 text-xs gap-1">
          <Plus className="w-3 h-3" /> Add
        </Button>
      </div>
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2 p-2 rounded-lg border border-border bg-card">
          <span className="text-xs font-semibold text-primary min-w-[80px]">{item.ref}</span>
          <span className="text-xs text-muted-foreground flex-1 truncate">{item.text}</span>
          <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setItems(items.filter((_, j) => j !== i))}>
            <X className="w-3 h-3 text-destructive" />
          </Button>
        </div>
      ))}
    </div>
  );
}

function WordStudySection({ items, setItems }: { items: any[]; setItems: (v: any[]) => void }) {
  const [form, setForm] = useState({ word: "", transliteration: "", meaning: "" });

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <Input placeholder="Word" value={form.word} onChange={(e) => setForm({ ...form, word: e.target.value })} className="h-9 text-sm" />
        <Input placeholder="Transliteration" value={form.transliteration} onChange={(e) => setForm({ ...form, transliteration: e.target.value })} className="h-9 text-sm" />
        <Input placeholder="Meaning" value={form.meaning} onChange={(e) => setForm({ ...form, meaning: e.target.value })} className="h-9 text-sm" />
      </div>
      <Button size="sm" onClick={() => { if (form.word.trim()) { setItems([...items, { ...form }]); setForm({ word: "", transliteration: "", meaning: "" }); } }} className="h-8 text-xs gap-1">
        <Plus className="w-3 h-3" /> Add Word Study
      </Button>
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-3 p-2 rounded-lg border border-border bg-card">
          <span className="text-sm font-semibold">{item.word}</span>
          <span className="text-xs text-muted-foreground italic">{item.transliteration}</span>
          <span className="text-xs text-muted-foreground flex-1">{item.meaning}</span>
          <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setItems(items.filter((_, j) => j !== i))}>
            <X className="w-3 h-3 text-destructive" />
          </Button>
        </div>
      ))}
    </div>
  );
}

function DictionarySection({ items, setItems }: { items: any[]; setItems: (v: any[]) => void }) {
  const [form, setForm] = useState({ term: "", pronunciation: "", definition: "", description: "" });

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <Input placeholder="Term" value={form.term} onChange={(e) => setForm({ ...form, term: e.target.value })} className="h-9 text-sm" />
        <Input placeholder="Pronunciation" value={form.pronunciation} onChange={(e) => setForm({ ...form, pronunciation: e.target.value })} className="h-9 text-sm" />
      </div>
      <Input placeholder="Definition" value={form.definition} onChange={(e) => setForm({ ...form, definition: e.target.value })} className="h-9 text-sm" />
      <Textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="text-sm" />
      <Button size="sm" onClick={() => { if (form.term.trim()) { setItems([...items, { ...form }]); setForm({ term: "", pronunciation: "", definition: "", description: "" }); } }} className="h-8 text-xs gap-1">
        <Plus className="w-3 h-3" /> Add Term
      </Button>
      {items.map((item, i) => (
        <div key={i} className="p-2 rounded-lg border border-border bg-card">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">{item.term}</span>
            <span className="text-xs text-muted-foreground italic">{item.pronunciation}</span>
            <Button variant="ghost" size="icon" className="h-5 w-5 ml-auto" onClick={() => setItems(items.filter((_, j) => j !== i))}>
              <X className="w-3 h-3 text-destructive" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{item.definition}</p>
        </div>
      ))}
    </div>
  );
}

function TopicSection({ items, setItems }: { items: any[]; setItems: (v: any[]) => void }) {
  const [form, setForm] = useState("");

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input placeholder="Topic name" value={form} onChange={(e) => setForm(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && form.trim()) { setItems([...items, { name: form }]); setForm(""); } }} className="h-9 text-sm" />
        <Button size="sm" onClick={() => { if (form.trim()) { setItems([...items, { name: form }]); setForm(""); } }} className="h-9 text-xs gap-1">
          <Plus className="w-3 h-3" /> Add
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted text-xs font-medium">
            {item.name}
            <button onClick={() => setItems(items.filter((_, j) => j !== i))} className="text-destructive hover:text-destructive/80">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
