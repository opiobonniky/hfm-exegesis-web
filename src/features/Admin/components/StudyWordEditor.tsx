import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, BookOpen, CheckCircle2, Languages, Link2, Save, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { Combobox } from '@/components/ui/combobox';
import { useToast } from '@/hooks/use-toast';
import { BIBLE_BOOKS } from '@/data/staticData';
import { getChaptersForBook, getVersesCountForChapter } from '@/utilities/bibleUtils';
import { wordStudyApi } from '../services/studyToolsApi';
import type { WordEntry } from '../types';
import { tt } from '@/components/languages/hardcodedTranslate';
import { StudyWordPassageFields } from './StudyWordPassageFields';

const emptyWord = {
  strongsId: '', originalWord: '', transliteration: '', pronunciation: '', shortDefinition: '',
  fullDefinition: '', partOfSpeech: '', grammaticalCase: '', gender: '', number: '',
  crossReferences: '', adminExplanation: '',
};
type WordForm = typeof emptyWord;
type Attachment = { id: string | number; bookName: string; chapter: number; verse: number;
  translation: string; surfaceText: string | null; adminExplanation: string | null };
const emptyAttachment = { bookName: 'Genesis', chapter: 1, verse: 1, translation: 'Berean', surfaceText: '', adminExplanation: '' };

export function StudyWordEditor({ word, onClose, onSaved }: {
  word: WordEntry | null; onClose: () => void; onSaved: () => void;
}) {
  const { toast } = useToast();
  const [form, setForm] = useState<WordForm>(emptyWord);
  const [savedId, setSavedId] = useState('');
  const [busy, setBusy] = useState(false);
  const [linksLoading, setLinksLoading] = useState(false);
  const [links, setLinks] = useState<Attachment[]>([]);
  const [linkPage, setLinkPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [attachment, setAttachment] = useState(emptyAttachment);
  const [editingLink, setEditingLink] = useState<Attachment | null>(null);
  const [passageReady, setPassageReady] = useState(false);
  const generation = useRef(0);

  const report = (description: string) => toast({ title: tt('Error'), description, variant: 'destructive' });
  const loadLinks = async (id: string, page = 0, token = generation.current) => {
    setLinksLoading(true);
    try {
      const result = await wordStudyApi.attachments(id, page);
      if (token !== generation.current) return;
      if (result.returnCode !== 200) throw new Error(result.returnMessage || 'Could not load verse attachments');
      setLinks(previous => page ? [...previous, ...(result.returnData?.data || [])] : result.returnData?.data || []);
      setLinkPage(page); setHasNext(Boolean(result.returnData?.hasNext));
    } catch (error) {
      if (token === generation.current) report(error instanceof Error ? error.message : tt('Could not load verse attachments'));
    } finally { if (token === generation.current) setLinksLoading(false); }
  };

  useEffect(() => {
    const token = ++generation.current;
    setForm(Object.fromEntries(Object.keys(emptyWord).map(key => [key, word?.[key as keyof WordEntry] || ''])) as WordForm);
    setSavedId(word?.strongsId || ''); setLinks([]); setHasNext(false); setLinkPage(0);
    setAttachment(emptyAttachment); setEditingLink(null);
    if (word) void loadLinks(word.strongsId, 0, token);
    return () => { generation.current = token + 1; };
    // Each opening is an independent edit session. Avoid resetting typed text on re-renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [word?.strongsId]);

  const saveWord = async () => {
    if (!/^[GH]\d{1,5}$/i.test(form.strongsId.trim()) || !form.shortDefinition.trim()) {
      report(tt('Enter a valid Strong’s ID and a short definition')); return;
    }
    setBusy(true);
    try {
      const result = await wordStudyApi.update({ ...form, strongsId: form.strongsId.trim().toUpperCase(),
        language: form.strongsId.trim().toUpperCase().startsWith('H') ? 'hebrew' : 'greek' });
      if (result.returnCode !== 200) throw new Error(result.returnMessage || 'Could not save word');
      const id = result.returnData.strongsId;
      setSavedId(id); setForm(previous => ({ ...previous, strongsId: id }));
      onSaved(); toast({ title: tt('Saved'), description: tt('Dictionary entry updated. You can now attach it to a verse.') });
      await loadLinks(id);
    } catch (error) { report(error instanceof Error ? error.message : tt('Could not save word')); }
    finally { setBusy(false); }
  };

  const saveLink = async () => {
    if (!passageReady || !attachment.surfaceText.trim()) {
      report(tt('Load a verse and choose its word or phrase before saving.')); return;
    }
    setBusy(true);
    try {
      // Editing changes only wording; the passage key stays fixed. To move a
      // link, remove it and attach the word to the new passage explicitly.
      const result = await wordStudyApi.saveAttachment({ ...attachment, strongsId: savedId });
      if (result.returnCode !== 200) throw new Error(result.returnMessage || 'Could not save verse attachment');
      setAttachment(emptyAttachment); setEditingLink(null); await loadLinks(savedId); onSaved();
      toast({ title: tt('Saved'), description: tt('Verse attachment saved') });
    } catch (error) { report(error instanceof Error ? error.message : tt('Could not save verse attachment')); }
    finally { setBusy(false); }
  };

  const removeLink = async (link: Attachment) => {
    if (!window.confirm(tt('Remove this verse attachment? The dictionary entry will remain.'))) return;
    setBusy(true);
    try {
      const result = await wordStudyApi.removeAttachment(link.id);
      if (result.returnCode !== 200) throw new Error(result.returnMessage || 'Could not remove attachment');
      if (editingLink?.id === link.id) { setEditingLink(null); setAttachment(emptyAttachment); }
      await loadLinks(savedId); onSaved();
    } catch (error) { report(error instanceof Error ? error.message : tt('Could not remove attachment')); }
    finally { setBusy(false); }
  };

  const deleteWord = async () => {
    if (!window.confirm(tt('Delete this unused dictionary entry? Words linked to Scripture or studies cannot be deleted here.'))) return;
    setBusy(true);
    try {
      const result = await wordStudyApi.delete(savedId);
      if (result.returnCode !== 200) throw new Error(result.returnMessage || 'Could not delete word');
      onSaved(); onClose();
    } catch (error) { report(error instanceof Error ? error.message : tt('Could not delete word')); }
    finally { setBusy(false); }
  };

  const update = (key: keyof WordForm, value: string) => setForm(previous => ({ ...previous, [key]: value }));
  const input = (key: keyof WordForm, label: string, placeholder: string, hint?: string, original = false) =>
    <Field label={label} hint={hint} required={['strongsId', 'shortDefinition'].includes(key)}>
      <Input value={form[key]} placeholder={tt(placeholder)} onChange={event => update(key, event.target.value)}
        disabled={key === 'strongsId' && Boolean(savedId)} maxLength={key === 'strongsId' ? 6 : 1000}
        autoComplete="off" spellCheck={false} dir={original ? 'auto' : undefined}
        className={original ? 'h-14 font-serif text-2xl' : 'h-11'} />
    </Field>;
  const grammar = (key: keyof WordForm, label: string, options: string[]) => <Field label={label}>
    <Combobox value={form[key]} width="w-full" placeholder={tt(`Select ${label.toLowerCase()}`)} searchPlaceholder={tt(`Search ${label.toLowerCase()}...`)}
      options={[...new Set([...(form[key] ? [form[key]] : []), ...options])].map(value => ({ value, label: tt(value) }))}
      onChange={value => update(key, value)} disabled={busy} />
  </Field>;

  return <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:py-8">
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        <Button variant="outline" size="icon" disabled={busy} onClick={onClose} aria-label={tt('Back to word studies')}><ArrowLeft className="h-4 w-4" /></Button>
        <div><p className="text-xs font-semibold uppercase tracking-wider text-primary">{tt('Strong’s Word Studies')}</p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{tt(savedId ? 'Edit Strong’s word' : 'Add Strong’s word')}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{tt('Build a clear dictionary entry, then show how the word is used in a Bible passage.')}</p>
        </div>
      </div>
      <span className="rounded-full border bg-card px-3 py-1 text-xs font-medium">{savedId || tt('New dictionary entry')}</span>
    </header>
    <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
      {tt('Save only reviewed content. Changes are visible to readers immediately. General definitions and verse-specific notes are separate.')}
    </div>
    <fieldset disabled={busy} className="min-w-0 space-y-6">
      <form onSubmit={event => { event.preventDefault(); void saveWord(); }} className="space-y-6">
        <Section icon={<Languages className="h-5 w-5" />} title="Word identity" description="Use the original-language word and a verified Strong’s ID. H identifies Hebrew; G identifies Greek.">
          <div className="grid gap-5 md:grid-cols-3">
            {input('strongsId', 'Strong’s ID', 'e.g. H7225 or G3056', savedId ? 'The ID cannot be changed after saving.' : 'Copy the ID from a trusted concordance.')}
            <div className="md:col-span-2">{input('originalWord', 'Original word', 'e.g. רֵאשִׁית or λόγος', 'Enter the Hebrew or Greek spelling, including marks where available.', true)}</div>
            {input('transliteration', 'Transliteration', 'e.g. reshith or logos', 'Write the original word using Latin letters.')}
            {input('pronunciation', 'Pronunciation', 'e.g. ray-sheeth', 'A simple guide to saying the word.')}
            <div className="rounded-lg bg-muted/50 p-4 text-sm"><p className="font-medium">{tt('Original language')}</p><p className="mt-1 text-muted-foreground">{/^H/i.test(form.strongsId) ? tt('Hebrew') : /^G/i.test(form.strongsId) ? tt('Greek') : tt('Set automatically from the Strong’s ID.')}</p></div>
          </div>
        </Section>
        <Section icon={<BookOpen className="h-5 w-5" />} title="Definition and study notes" description="Describe the word’s general meaning here. Save notes about a specific passage in the verse section below.">
          <div className="space-y-5">
            <Field label="Short definition" required hint="A brief meaning that readers can scan on a word card.">
              <Textarea value={form.shortDefinition} placeholder={tt('e.g. Beginning; the first or chief part of something.')} maxLength={1000} rows={2} className="min-h-[80px] resize-y" onChange={event => update('shortDefinition', event.target.value)} required />
            </Field>
            <Field label="Full definition" hint="Explain the range of meanings in clear paragraphs. Keep quotations distinct from your own explanation.">
              <Textarea value={form.fullDefinition} placeholder={tt('Explain the word’s meaning, common uses, and important distinctions...')} maxLength={30000} rows={7} className="min-h-[180px] resize-y leading-relaxed" onChange={event => update('fullDefinition', event.target.value)} />
            </Field>
            <Field label="General study note" hint="Optional editorial guidance about the word, not an explanation of just one verse.">
              <Textarea value={form.adminExplanation} placeholder={tt('Add a helpful study note, a translation caution, or a distinction readers should understand...')} maxLength={30000} rows={4} className="min-h-[120px] resize-y leading-relaxed" onChange={event => update('adminExplanation', event.target.value)} />
            </Field>
            <CrossReferenceFields value={form.crossReferences} onChange={value => update('crossReferences', value)} disabled={busy} />
          </div>
        </Section>
        <Section icon={<Languages className="h-5 w-5" />} title="Grammar" description="Optional. Select only details confirmed by your source; leave unknown details blank.">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {grammar('partOfSpeech', 'Part of speech', ['noun', 'verb', 'adjective', 'adverb', 'pronoun', 'preposition', 'conjunction', 'article', 'particle', 'interjection'])}
            {grammar('grammaticalCase', 'Grammatical case', ['nominative', 'genitive', 'dative', 'accusative', 'vocative'])}
            {grammar('gender', 'Gender', ['masculine', 'feminine', 'neuter', 'common'])}
            {grammar('number', 'Number', ['singular', 'plural', 'dual'])}
          </div>
        </Section>
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground">{tt(savedId ? 'Save definition changes before editing verse links.' : 'Save the dictionary entry to unlock verse links.')}</p>
          <Button type="submit" className="gap-2"><Save className="h-4 w-4" />{tt(busy ? 'Saving...' : 'Save dictionary entry')}</Button>
        </div>
      </form>
      <Section icon={<Link2 className="h-5 w-5" />} title="Verse links" description="Choose a passage and explain what this word means there. A word can be linked to more than one verse.">
        {!savedId ? <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">{tt('Save the word above first. Then choose the book, chapter and verse here.')}</div> : <div className="space-y-6">
          <div className="flex items-center gap-2 text-sm text-primary"><CheckCircle2 className="h-4 w-4" />{tt('Dictionary entry saved')} · {savedId}</div>
          <div className="space-y-5 rounded-xl border bg-muted/20 p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-semibold">{tt(editingLink ? 'Edit verse note' : 'Link to a Bible verse')}</h3><span className="rounded-full border bg-background px-3 py-1 text-xs">{attachment.translation}</span></div>
            <StudyWordPassageFields value={attachment} busy={busy} locked={Boolean(editingLink)} onReady={setPassageReady}
              onChange={patch => setAttachment(previous => ({ ...previous, ...patch }))} />
            {editingLink && <p className="text-xs text-muted-foreground">{tt('To change the passage, remove this link and create a new one.')}</p>}
            <Field label="Meaning in this verse" hint="Explain the word in this passage. This does not replace its general definition."><Textarea placeholder={tt('Explain how this word is used in the selected verse and why it matters...')} rows={5} className="min-h-[140px] resize-y leading-relaxed" value={attachment.adminExplanation} maxLength={30000} onChange={event => setAttachment({ ...attachment, adminExplanation: event.target.value })} /></Field>
            <div className="flex flex-wrap gap-2"><Button disabled={!passageReady || !attachment.surfaceText.trim()} onClick={saveLink} className="gap-2"><Link2 className="h-4 w-4" />{tt('Save verse attachment')}</Button>{editingLink && <Button variant="outline" onClick={() => { setEditingLink(null); setAttachment(emptyAttachment); }}>{tt('Cancel edit')}</Button>}</div>
          </div>
          <div className="space-y-3"><h3 className="font-semibold">{tt('Saved verse links')}</h3>
            <p className="text-sm text-muted-foreground">{tt('Links created here can be edited below. Notes written in Verse Explanations remain on that page.')}</p>
            {!linksLoading && links.length === 0 && <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">{tt('No direct verse links yet. Add the first passage above.')}</p>}
            {links.map(link => <article key={String(link.id)} className="flex flex-wrap items-start justify-between gap-4 rounded-xl border p-4">
              <div className="min-w-0 flex-1"><p className="font-semibold">{link.bookName} {link.chapter}:{link.verse} <span className="text-xs font-normal text-muted-foreground">· {link.translation}</span></p><p className="mt-2 text-sm font-medium">{link.surfaceText}</p><p className="mt-1 whitespace-pre-wrap break-words text-sm text-muted-foreground">{link.adminExplanation}</p></div>
              <div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => { setEditingLink(link); setAttachment({ bookName: link.bookName, chapter: Number(link.chapter), verse: Number(link.verse), translation: link.translation, surfaceText: link.surfaceText || '', adminExplanation: link.adminExplanation || '' }); document.getElementById('verse-links')?.scrollIntoView({ behavior: 'smooth' }); }}>{tt('Edit attachment')}</Button><Button variant="ghost" size="sm" onClick={() => removeLink(link)} aria-label={`${tt('Remove attachment')} ${link.bookName} ${link.chapter}:${link.verse}`}><Trash2 className="h-4 w-4 text-destructive" /></Button></div>
            </article>)}
            {linksLoading && <p role="status">{tt('Loading...')}</p>}
            {hasNext && <Button variant="outline" disabled={linksLoading} onClick={() => loadLinks(savedId, linkPage + 1)}>{tt('Show more')}</Button>}
          </div>
        </div>}
      </Section>
      {savedId && <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-destructive/20 p-4"><p className="text-sm text-muted-foreground">{tt('Only unused entries can be deleted. Linked Scripture words are protected.')}</p><Button variant="outline" className="text-destructive" onClick={deleteWord}>{tt('Delete unused dictionary entry')}</Button></div>}
    </fieldset>
  </main>;
}

function Field({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: ReactNode }) {
  return <label className="block space-y-2"><span className="text-sm font-semibold">{tt(label)}{required && <span className="text-destructive"> *</span>}</span>{children}{hint && <span className="block text-xs leading-relaxed text-muted-foreground">{tt(hint)}</span>}</label>;
}

function Section({ title, description, icon, children }: { title: string; description: string; icon: ReactNode; children: ReactNode }) {
  return <section id={title === 'Verse links' ? 'verse-links' : undefined} className="scroll-mt-6 overflow-hidden rounded-2xl border bg-card shadow-sm">
    <div className="flex items-start gap-3 border-b bg-muted/20 p-5 sm:px-6"><span className="rounded-lg bg-primary/10 p-2 text-primary">{icon}</span><div><h2 className="font-semibold">{tt(title)}</h2><p className="mt-1 text-sm leading-relaxed text-muted-foreground">{tt(description)}</p></div></div>
    <div className="p-5 sm:p-6">{children}</div>
  </section>;
}

function splitReferences(value: string) {
  return [...new Set(value.split(/[;,]/).map(reference => reference.trim()).filter(Boolean))];
}

type Passage = { bookName: string; chapter: number; verse: number };
function PassagePicker({ value, onChange, disabled }: { value: Passage; onChange: (value: Passage) => void; disabled: boolean }) {
  return <div className="grid gap-4 sm:grid-cols-3">
    <Field label="Book"><Combobox width="w-full" options={BIBLE_BOOKS.map(book => ({ value: book, label: tt(book) }))} value={value.bookName} disabled={disabled} onChange={book => book && onChange({ bookName: book, chapter: 1, verse: 1 })} placeholder={tt('Select a book')} searchPlaceholder={tt('Search books...')} /></Field>
    <Field label="Chapter"><Combobox width="w-full" options={(value.bookName ? getChaptersForBook(value.bookName) : []).map(chapter => ({ value: String(chapter), label: `${tt('Chapter')} ${chapter}` }))} value={value.chapter ? String(value.chapter) : ''} disabled={disabled || !value.bookName} onChange={chapter => chapter && onChange({ ...value, chapter: Number(chapter), verse: 1 })} placeholder={tt('Select a chapter')} searchPlaceholder={tt('Search chapters...')} /></Field>
    <Field label="Verse"><Combobox width="w-full" options={Array.from({ length: value.bookName && value.chapter ? getVersesCountForChapter(value.bookName, value.chapter) : 0 }, (_, index) => ({ value: String(index + 1), label: `${tt('Verse')} ${index + 1}` }))} value={value.verse ? String(value.verse) : ''} disabled={disabled || !value.chapter} onChange={verse => verse && onChange({ ...value, verse: Number(verse) })} placeholder={tt('Select a verse')} searchPlaceholder={tt('Search verses...')} /></Field>
  </div>;
}

type ReferenceRow = { id: number; passage: Passage; legacy?: string };
function CrossReferenceFields({ value, onChange, disabled }: { value: string; onChange: (value: string) => void; disabled: boolean }) {
  const nextId = useRef(0);
  const lastValue = useRef('');
  const [rows, setRows] = useState<ReferenceRow[]>([]);
  useEffect(() => {
    if (value === lastValue.current) return;
    lastValue.current = value;
    setRows(splitReferences(value).map(reference => {
      const match = reference.match(/^(.+) (\d+):(\d+)$/);
      const passage = match ? { bookName: match[1], chapter: Number(match[2]), verse: Number(match[3]) } : null;
      return { id: ++nextId.current, passage: passage || { bookName: '', chapter: 0, verse: 0 }, legacy: passage ? undefined : reference };
    }));
  }, [value]);
  const commit = (next: ReferenceRow[]) => {
    setRows(next);
    const references = next.flatMap(row => row.legacy ? [row.legacy] : row.passage.bookName && row.passage.chapter && row.passage.verse ? [`${row.passage.bookName} ${row.passage.chapter}:${row.passage.verse}`] : []);
    const serialized = [...new Set(references)].join('; ');
    lastValue.current = serialized; onChange(serialized);
  };
  return <div className="space-y-4 rounded-xl border bg-muted/20 p-4">
    <div><h3 className="text-sm font-semibold">{tt('Cross references')}</h3><p className="mt-1 text-xs text-muted-foreground">{tt('Add a row for each related verse. Select its book, chapter and verse. All rows are saved with the dictionary entry.')}</p></div>
    {rows.map((row, index) => <div key={row.id} role="group" aria-label={`${tt('Cross reference')} ${index + 1}`} className="space-y-3 rounded-lg border bg-background p-4">
      <div className="flex items-center justify-between"><p className="text-sm font-medium">{tt('Cross reference')} {index + 1}</p><Button type="button" variant="ghost" size="sm" aria-label={`${tt('Remove cross reference')} ${index + 1}`} disabled={disabled} onClick={() => commit(rows.filter(item => item.id !== row.id))}><Trash2 className="h-4 w-4 text-destructive" /></Button></div>
      {row.legacy ? <p className="text-sm">{row.legacy}</p> : <PassagePicker value={row.passage} disabled={disabled} onChange={passage => commit(rows.map(item => item.id === row.id ? { ...item, passage } : item))} />}
    </div>)}
    <Button type="button" variant="outline" disabled={disabled} onClick={() => commit([...rows, { id: ++nextId.current, passage: { bookName: '', chapter: 0, verse: 0 } }])}>{tt('Add cross reference')}</Button>
    {!rows.length && <p className="text-xs text-muted-foreground">{tt('No cross references added yet.')}</p>}
  </div>;
}
