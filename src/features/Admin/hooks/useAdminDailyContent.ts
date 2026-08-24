// useAdminDailyContent — all state, effects, and logic for AdminDailyContent page
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/components/languages/languageProvider";
import { sendPostRequest } from "@/services/api";
import { setActiveVersion, getVerseText } from "@/utilities/bibleUtils";
import type { DailyItem } from "../types";
import type { ContentType } from "../constants";

const CHAPTER_COUNTS: Record<string, number> = {
  Genesis:50,Exodus:40,Leviticus:27,Numbers:36,Deuteronomy:34,Joshua:24,Judges:21,Ruth:4,"1 Samuel":31,"2 Samuel":24,"1 Kings":22,"2 Kings":25,"1 Chronicles":29,"2 Chronicles":36,Ezra:10,Nehemiah:13,Esther:10,Job:42,Psalms:150,Proverbs:31,Ecclesiastes:12,"Song of Solomon":8,Isaiah:66,Jeremiah:52,Lamentations:5,Ezekiel:48,Daniel:12,Hosea:14,Joel:3,Amos:9,Obadiah:1,Jonah:4,Micah:7,Nahum:3,Habakkuk:3,Zephaniah:3,Haggai:2,Zechariah:14,Malachi:4,Matthew:28,Mark:16,Luke:24,John:21,Acts:28,Romans:16,"1 Corinthians":16,"2 Corinthians":13,Galatians:6,Ephesians:6,Philippians:4,Colossians:4,"1 Thessalonians":5,"2 Thessalonians":3,"1 Timothy":6,"2 Timothy":4,Titus:3,Philemon:1,Hebrews:13,James:5,"1 Peter":5,"2 Peter":3,"1 John":5,"2 John":1,"3 John":1,Jude:1,Revelation:22,
};
export function useAdminDailyContent() {
  const { t, isRtl } = useLanguage();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("verses");
  const [content, setContent] = useState<DailyItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchDate, setSearchDate] = useState("");
  // Form state
  const [formMode, setFormMode] = useState<ContentType | null>(null);
  const [editItem, setEditItem] = useState<DailyItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formBook, setFormBook] = useState("");
  const [formChapter, setFormChapter] = useState("");
  const [formVerse, setFormVerse] = useState("");
  const [formReflection, setFormReflection] = useState("");
  const [formExplanation, setFormExplanation] = useState("");
  const [formLearnMore, setFormLearnMore] = useState("");
  const [formPassageRef, setFormPassageRef] = useState("");
  const [formIntro, setFormIntro] = useState("");
  const [formContextSummary, setFormContextSummary] = useState("");
  const [formTeachingBody, setFormTeachingBody] = useState("");
  const [formApplication, setFormApplication] = useState("");
  const [formPrayer, setFormPrayer] = useState("");
  const [formTags, setFormTags] = useState("");
  const [formDate, setFormDate] = useState<Date>(() => { const d = new Date(); d.setHours(8, 0, 0, 0); return d; });
  const [formTime, setFormTime] = useState("08:00");
  const [formPublished, setFormPublished] = useState(true);
  const [formVerseText, setFormVerseText] = useState("");
  const [formVerseLoading, setFormVerseLoading] = useState(false);
  const [verseVersion, setVerseVersion] = useState("BSB");
  const [conflictDialog, setConflictDialog] = useState<{ open: boolean; data: any; payload: Record<string, any> | null }>({ open: false, data: null, payload: null });
  const [deleteTarget, setDeleteTarget] = useState<DailyItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  // Derived
  const formChapters = formBook ? (CHAPTER_COUNTS[formBook] ? Array.from({ length: CHAPTER_COUNTS[formBook] }, (_, i) => i + 1) : []) : [];
  const formMaxVerses = formBook && formChapter ? 31 : 0;
  // Sync time
  useEffect(() => {
    setFormTime(`${String(formDate.getHours()).padStart(2, "0")}:${String(formDate.getMinutes()).padStart(2, "0")}`);
  }, [formDate]);
  const handleTimeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const time = e.target.value; setFormTime(time);
    if (!time) return;
    const [h, m] = time.split(":").map(Number);
    if (isNaN(h) || isNaN(m)) return;
    const nd = new Date(formDate); nd.setHours(h, m, 0, 0); setFormDate(nd);
  // Auto-fetch verse text
    if (!formBook || !formChapter || !formVerse) { setFormVerseText(""); return; }
    setFormVerseLoading(true);
    setActiveVersion(verseVersion).then(() => {
      setFormVerseText(getVerseText(formBook, Number(formChapter), Number(formVerse)) || "Verse text not found.");
      setFormVerseLoading(false);
    });
  }, [formBook, formChapter, formVerse, verseVersion]);
  const getAction = useCallback((type: ContentType, action: string) => {
    if (type === "verse" && action === "get-all") return "get-all-daily-verses";
    const prefix = type === "verse" ? "daily-verse" : type === "devotion" ? "daily-devotion" : "daily-exegesis";
    return `${action}-${prefix}`;
  }, []);
  // Load content
  const loadContent = useCallback(async (type: ContentType, p: number) => {
    setLoading(true);
    try {
      const res = await sendPostRequest("admin", getAction(type, "get-all"), {
        page: p, size: 12,
        ...(searchDate ? { startDate: searchDate, endDate: searchDate } : { smartDefault: false }),
      });
      if (res?.returnCode === 200 && res?.returnData) {
        setContent(res.returnData.content || []);
        setTotal(res.returnData.totalElements || 0);
      }
    } catch { toast({ title: "Failed to load content", variant: "destructive" }); }
    finally { setLoading(false); }
  }, [searchDate, getAction, toast]);
    const typeMap: Record<string, ContentType> = { verses: "verse", devotions: "devotion", exegesis: "exegesis" };
    loadContent(typeMap[activeTab] || "verse", page);
  }, [activeTab, page, loadContent]);
  // Open/close form
  const openForm = useCallback((type: ContentType, item?: DailyItem) => {
    setFormMode(type); setEditItem(item || null);
    setFormTitle(item?.title || ""); setFormContent(item?.content || "");
    setFormBook(item?.bookName || ""); setFormChapter(item?.chapter?.toString() || "");
    setFormVerse(item?.verseNumber?.toString() || ""); setFormReflection(item?.reflection || "");
    setFormExplanation(item?.explanation || ""); setFormLearnMore(item?.learnMore || "");
    setFormPassageRef(item?.passageReference || ""); setFormIntro(item?.introduction || "");
    setFormContextSummary(item?.contextSummary || ""); setFormTeachingBody(item?.teachingBody || "");
    setFormApplication(item?.application || ""); setFormPrayer(item?.prayer || "");
    setFormTags(item?.tags || "");
    setFormDate(item?.displayDate ? new Date(item.displayDate) : (() => { const d = new Date(); d.setHours(8, 0, 0, 0); return d; })());
    setFormPublished(item?.isPublished ?? true);
  const closeForm = useCallback(() => { setFormMode(null); setEditItem(null); }, []);
  // Save
  const handleSave = useCallback(async () => {
    setSaving(true);
      const type = formMode!;
      const action = getAction(type, "add");
      const payload: Record<string, any> = { isPublished: formPublished, displayDate: formDate.toISOString().split("T")[0] };
      if (editItem?.id) payload.id = editItem.id;
      if (type === "verse") { payload.bookName = formBook; payload.chapter = Number(formChapter); payload.verseNumber = Number(formVerse); payload.explanation = formExplanation; payload.reflection = formReflection || null; payload.learnMore = formLearnMore || null; }
      else if (type === "devotion") { payload.title = formTitle; payload.content = formContent; payload.bookName = formBook || null; payload.chapter = formChapter ? Number(formChapter) : null; payload.verseNumber = formVerse ? Number(formVerse) : null; payload.displayTime = formDate.toISOString(); }
      else { payload.title = formTitle; payload.passageReference = formPassageRef; payload.introduction = formIntro || null; payload.contextSummary = formContextSummary || null; payload.teachingBody = formTeachingBody; payload.application = formApplication || null; payload.prayer = formPrayer || null; payload.tags = formTags || null; }
      const res = await sendPostRequest("admin", action, payload);
      if (res?.returnCode === 200) { toast({ title: "Saved successfully" }); closeForm(); loadContent(type, 0); }
      else if (res?.returnCode === 409) { setSaving(false); setConflictDialog({ open: true, data: res.returnData || {}, payload }); return; }
      else { toast({ title: "Save failed", description: res?.returnMessage, variant: "destructive" }); }
    } catch { toast({ title: "Error saving", variant: "destructive" }); }
    finally { setSaving(false); }
  }, [formMode, formBook, formChapter, formVerse, formExplanation, formReflection, formLearnMore, formTitle, formContent, formPassageRef, formIntro, formContextSummary, formTeachingBody, formApplication, formPrayer, formTags, formDate, formPublished, editItem, getAction, toast, closeForm, loadContent]);
  // Delete
  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
      const type: ContentType = activeTab === "verses" ? "verse" : activeTab === "devotions" ? "devotion" : "exegesis";
      const action = getAction(type, "delete");
      const idKey = type === "verse" ? "verseId" : type === "devotion" ? "devotionId" : "exegesisId";
      const res = await sendPostRequest("admin", action, { [idKey]: deleteTarget.id });
      if (res?.returnCode === 200) { toast({ title: "Deleted" }); setDeleteTarget(null); loadContent(type, page); }
      else { toast({ title: "Delete failed", variant: "destructive" }); }
    } catch { toast({ title: "Error deleting", variant: "destructive" }); }
    finally { setDeleting(false); }
  }, [deleteTarget, activeTab, getAction, toast, loadContent, page]);
  const typeLabel = activeTab === "verses" ? "Verse" : activeTab === "devotions" ? "Devotion" : "Exegesis";
  return {
    t, isRtl, activeTab, setActiveTab, content, total, page, setPage, loading, searchDate, setSearchDate,
    formMode, editItem, saving, formTitle, setFormTitle, formContent, setFormContent,
    formBook, setFormBook, formChapter, setFormChapter, formVerse, setFormVerse,
    formReflection, setFormReflection, formExplanation, setFormExplanation,
    formLearnMore, setFormLearnMore, formPassageRef, setFormPassageRef,
    formIntro, setFormIntro, formContextSummary, setFormContextSummary,
    formTeachingBody, setFormTeachingBody, formApplication, setFormApplication,
    formPrayer, setFormPrayer, formTags, setFormTags,
    formDate, setFormDate, formTime, handleTimeChange, formPublished, setFormPublished,
    formVerseText, formVerseLoading, verseVersion, setVerseVersion,
    formChapters, formMaxVerses, typeLabel,
    conflictDialog, setConflictDialog, deleteTarget, setDeleteTarget, deleting,
    openForm, closeForm, handleSave, confirmDelete,
    calendarModifiers: { sunday: (d: Date) => d.getDay() === 0, special: (d: Date) => d.getDate() === 1, today: (d: Date) => d.toDateString() === new Date().toDateString() },
    calendarModifiersClassNames: { sunday: "text-red-600 dark:text-red-400 font-medium", special: "after:content-['★'] after:text-yellow-500 after:absolute after:bottom-0.5 after:right-0.5 after:text-[9px]", today: "bg-accent text-accent-foreground font-bold rounded-full" },
  };
}
