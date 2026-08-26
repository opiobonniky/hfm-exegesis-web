import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/components/languages/languageProvider";
import { sendPostRequest } from "@/services/api";
import { getBooksByTestament, getChaptersForBook, getVersesCountForChapter } from "@/utilities/bibleUtils";
import { getVerseText } from "@/utilities/bibleUtils";

const getTestamentForBook = (book: string): "Old" | "New" =>
  getBooksByTestament("Old").includes(book) ? "Old" : "New";

interface JournalEntryData { id: string; title: string; content: string; mood: string; tags: string; bookName: string; chapter: string; verseNumber: string; isPrivate: boolean; prayers: string; application: string; learnings: string; }
const DEFAULT_ENTRY: JournalEntryData = { id: "", title: "", content: "", mood: "neutral", tags: "", bookName: "", chapter: "", verseNumber: "", isPrivate: true, prayers: "", application: "", learnings: "" };
export function useJournalEntryPage() {
  const navigate = useNavigate();
  const { entryId } = useParams<{ entryId: string }>();
  const [searchParams] = useSearchParams();
  const { t, isRtl } = useLanguage();
  const { toast } = useToast();
  const isEditing = !!entryId && entryId !== "new";
  const isNewEntry = entryId === "new" || !entryId;
  const [testament, setTestament] = useState<string>("");
  const [entry, setEntry] = useState<JournalEntryData>(() => {
    if (isNewEntry) {
      const book = searchParams.get("book"); const chapter = searchParams.get("chapter"); const verse = searchParams.get("verse");
      const promptText = searchParams.get("promptText"); const title = searchParams.get("title");
      const reflection = searchParams.get("reflection"); const prayer = searchParams.get("prayer");
      const application = searchParams.get("application"); const tags = searchParams.get("tags"); const source = searchParams.get("source");
      const content = source === "daily-exegesis" && reflection ? reflection : (promptText || "");
      return { ...DEFAULT_ENTRY, title: title || "", bookName: book || "", chapter: chapter || "", verseNumber: verse || "", content, prayers: prayer || "", application: application || "", tags: tags || "" };
    }
    return DEFAULT_ENTRY;
  });
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [books, setBooks] = useState<string[]>([]);
  const [chapters, setChapters] = useState<number[]>([]);
  const [verses, setVerses] = useState<number[]>([]);
  const [verseText, setVerseText] = useState("");
  const [templates, setTemplates] = useState<{ id: number; name: string; prompts: string[] }[]>([]);
  const allBooks = useMemo(() => getBooksByTestament("Old").concat(getBooksByTestament("New")), []);
  useEffect(() => { if (isEditing) fetchEntry(); }, [entryId]);
  useEffect(() => { setBooks(testament ? getBooksByTestament(testament as "Old" | "New") : allBooks); }, [testament, allBooks]);
  useEffect(() => { if (entry.bookName) { setChapters(getChaptersForBook(entry.bookName)); setTestament(getTestamentForBook(entry.bookName)); } }, [entry.bookName]);
  useEffect(() => { if (entry.bookName && entry.chapter) { const v = getVersesCountForChapter(entry.bookName, parseInt(entry.chapter)); setVerses(Array.from({ length: v }, (_, i) => i + 1)); } }, [entry.bookName, entry.chapter]);
  useEffect(() => { if (entry.bookName && entry.chapter && entry.verseNumber) { setVerseText(getVerseText(entry.bookName, parseInt(entry.chapter), parseInt(entry.verseNumber)) || ""); } else { setVerseText(""); } }, [entry.bookName, entry.chapter, entry.verseNumber]);
  useEffect(() => {
    if (isNewEntry && searchParams.get("source") === "daily-exegesis" && searchParams.get("date")) {
      sendPostRequest("bible", "get-exegesis-by-date", { date: searchParams.get("date") }).then((res) => {
        if (res.returnCode === 200 && res.returnData) {
          const d = res.returnData;
          setEntry((prev) => ({ ...prev, title: d.title || prev.title, content: [d.introduction, d.contextSummary, d.teachingBody].filter(Boolean).join("\n\n") || prev.content, prayers: d.prayer || prev.prayers, application: d.application || prev.application, learnings: d.contextSummary || d.introduction || prev.learnings, tags: d.tags || prev.tags }));
        }
      }).catch(() => {});
    }
  }, [searchParams]);
  useEffect(() => { if (isNewEntry) fetchTemplates(); }, [isNewEntry]);
  const fetchEntry = useCallback(async () => {
    setLoading(true);
    try {
      const res = await sendPostRequest("journal", "get-entry", { id: entryId });
      if (res?.returnCode === 200 && res.returnData) setEntry(res.returnData);
    } catch {} finally { setLoading(false); }
  }, [entryId]);
  const fetchTemplates = useCallback(async () => {
    try { const res = await sendPostRequest("journal", "templates/get-all", { isActive: true }); if (res.returnCode === 200 && res.returnData) setTemplates(res.returnData); } catch {}
  }, []);
  const handleSave = useCallback(async () => {
    if (!entry.title.trim() && !entry.content.trim()) { toast({ title: "Title or content required", variant: "destructive" }); return; }
    setSaving(true);
    try {
      const payload = { ...entry, id: isEditing ? entryId : undefined };
      const res = await sendPostRequest("journal", isEditing ? "update-entry" : "create-entry", payload);
      if (res?.returnCode === 200) { toast({ title: isEditing ? "Updated" : "Created" }); navigate("/journal"); }
      else { toast({ title: res?.returnMessage || "Failed", variant: "destructive" }); }
    } catch { toast({ title: "Error", variant: "destructive" }); }
    finally { setSaving(false); }
  }, [entry, isEditing, entryId, toast, navigate]);
  const updateEntry = useCallback((field: keyof JournalEntryData, value: any) => setEntry((prev) => ({ ...prev, [field]: value })), []);
  return {
    t, isRtl, navigate, isEditing, isNewEntry, entry, setEntry, updateEntry,
    loading, saving, handleSave, testament, setTestament,
    books, chapters, verses, verseText, templates, showTemplates, setShowTemplates,
  };
}
