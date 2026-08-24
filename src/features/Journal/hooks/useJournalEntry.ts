// useJournalEntry — all state for JournalEntry creation/editing page
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { sendPostRequest } from "@/services/api";

export function useJournalEntry(entryId?: string) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(!!entryId);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [bookName, setBookName] = useState("");
  const [chapter, setChapter] = useState("");
  const [verseNumber, setVerseNumber] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

  // Load existing entry if editing
  useState(() => {
    if (!entryId) return;
    sendPostRequest("journal", "get-by-id", { id: entryId }).then(res => {
      if (res?.returnCode === 200 && res?.returnData) {
        const e = res.returnData;
        setTitle(e.title || ""); setContent(e.content || ""); setMood(e.mood || "");
        setTags(e.tags || []); setBookName(e.bookName || "");
        setChapter(e.chapter?.toString() || ""); setVerseNumber(e.verseNumber?.toString() || "");
        setIsPrivate(e.isPrivate ?? false);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  });

  const handleSave = useCallback(async () => {
    if (!title.trim() || !content.trim()) { toast({ title: "Title and content required", variant: "destructive" }); return; }
    setSaving(true);
    try {
      const payload: any = { title, content, mood: mood || undefined, tags, isPrivate };
      if (bookName) payload.bookName = bookName;
      if (chapter) payload.chapter = Number(chapter);
      if (verseNumber) payload.verseNumber = Number(verseNumber);
      const action = entryId ? "update" : "create";
      if (entryId) payload.id = entryId;
      const res = await sendPostRequest("journal", action, payload);
      if (res?.returnCode === 200) { toast({ title: entryId ? "Updated" : "Created" }); navigate("/journal"); }
      else { toast({ title: "Save failed", variant: "destructive" }); }
    } catch { toast({ title: "Error saving", variant: "destructive" }); }
    finally { setSaving(false); }
  }, [title, content, mood, tags, bookName, chapter, verseNumber, isPrivate, entryId, toast, navigate]);

  return {
    loading, saving, title, setTitle, content, setContent, mood, setMood,
    tags, setTags, bookName, setBookName, chapter, setChapter,
    verseNumber, setVerseNumber, isPrivate, setIsPrivate, handleSave,
  };
}
