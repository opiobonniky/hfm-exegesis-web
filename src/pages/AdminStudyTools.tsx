import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BookText,
  Search,
  Loader2,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  BookOpen,
  Languages,
  Globe,
  FileText,
  Hash,
  Sparkles,
  HelpCircle,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Combobox } from "@/components/ui/combobox";

import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/components/languages/languageProvider";
import { Skeleton } from "@/components/ui/skeleton";
import { sendPostRequest } from "@/services/api";
import { bibleApi } from "@/services/bibleApi";
import { getChaptersForBook, getVersesCountForChapter, getVerseText } from "@/utilities/bibleUtils";
import { BIBLE_VERSIONS, getVersionById } from "@/assets/bibleVersion/json/bibleVersions";
import { BIBLE_BOOKS, getLangColor, getLangLetter, getLangScript } from "@/data/staticData";
import type { StrongsWordEntry } from "@/data/staticData";
import WordCard from "@/components/WordCard";
import WordDetailSheet from "@/components/WordDetailSheet";

// ── Types ──

type WordEntry = StrongsWordEntry;

interface WordStudyItem {
  word: string;
  transliteration: string;
  meaning: string;
}

interface CommentaryItem {
  author: string;
  title: string;
  text: string;
}

interface CrossReferenceItem {
  ref: string;
  text: string;
}

interface DictionaryTermItem {
  term: string;
  pronunciation: string;
  definition: string;
  description: string;
}

interface TopicItem {
  name: string;
}

interface VerseResource {
  id: number;
  bookName: string;
  chapter: number;
  verseStart: number;
  verseEnd: number | null;
  commentaries: CommentaryItem[];
  crossReferences: CrossReferenceItem[];
  wordStudies: WordStudyItem[];
  dictionaryTerms: DictionaryTermItem[];
  interlinearWords: string[];
  relatedTopics: TopicItem[];
  createdOn?: string;
}

const LANGUAGES = ["greek", "hebrew", "aramaic"];

// ── Component ──

export default function AdminStudyTools() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState("words");

  // ── Word entries state ──
  const [words, setWords] = useState<WordEntry[]>([]);
  const [wordsLoading, setWordsLoading] = useState(false);
  const [wordSearch, setWordSearch] = useState("");
  const [wordSearchPerformed, setWordSearchPerformed] = useState(false);
  const [editWord, setEditWord] = useState<WordEntry | null>(null);
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // ── Verse resources state ──
  const [currentResource, setCurrentResource] = useState<VerseResource | null>(null);
  const [resourcesLoading, setResourcesLoading] = useState(false);
  // ── Shared verse selector state (syncs across tabs) ──
  const [verseBook, setVerseBook] = useState("");
  const [verseChapter, setVerseChapter] = useState(0);
  const [verseNum, setVerseNum] = useState(0);
  const [verseSearched, setVerseSearched] = useState(false);
  const [verseTranslation, setVerseTranslation] = useState("BSB");
  // ── Words-tab-specific translation (independent from Resources tab) ──
  const [wordsTranslation, setWordsTranslation] = useState("BSB");
  const [verseChapList, setVerseChapList] = useState<number[]>([]);
  const [verseNumList, setVerseNumList] = useState<number[]>([]);
  const [resSearched, setResSearched] = useState(false);

  // ── Translation list, verse preview ──
  const [translations, setTranslations] = useState<{ value: string; label: string }[]>([]);
  const [versePreview, setVersePreview] = useState<string | null>(null);

  // Word studies CRUD
  const [wordStudies, setWordStudies] = useState<WordStudyItem[]>([]);
  const [wsSheetOpen, setWsSheetOpen] = useState(false);
  const [wsEditIdx, setWsEditIdx] = useState<number | null>(null);
  const [wsForm, setWsForm] = useState({ word: "", transliteration: "", meaning: "" });

  // Commentary CRUD
  const [commentaries, setCommentaries] = useState<CommentaryItem[]>([]);
  const [commSheetOpen, setCommSheetOpen] = useState(false);
  const [commEditIdx, setCommEditIdx] = useState<number | null>(null);
  const [commForm, setCommForm] = useState({ author: "", title: "", text: "" });

  // Cross-reference CRUD
  const [crossRefs, setCrossRefs] = useState<CrossReferenceItem[]>([]);
  const [xrefSheetOpen, setXrefSheetOpen] = useState(false);
  const [xrefEditIdx, setXrefEditIdx] = useState<number | null>(null);
  const [xrefForm, setXrefForm] = useState({ ref: "", text: "" });
  // Cross-reference verse selector
  const [xrefRefBook, setXrefRefBook] = useState("John");
  const [xrefRefChap, setXrefRefChap] = useState(1);
  const [xrefRefVer, setXrefRefVer] = useState(1);
  const [xrefRefChapList, setXrefRefChapList] = useState<number[]>([]);
  const [xrefRefVerList, setXrefRefVerList] = useState<number[]>([]);
  const [xrefRefPreview, setXrefRefPreview] = useState<string | null>(null);

  // Dictionary terms CRUD
  const [dictTerms, setDictTerms] = useState<DictionaryTermItem[]>([]);
  const [dictSheetOpen, setDictSheetOpen] = useState(false);
  const [dictEditIdx, setDictEditIdx] = useState<number | null>(null);
  const [dictForm, setDictForm] = useState({ term: "", pronunciation: "", definition: "", description: "" });

  // Topics CRUD
  const [topics, setTopics] = useState<TopicItem[]>([]);
  const [topicSheetOpen, setTopicSheetOpen] = useState(false);
  const [topicEditIdx, setTopicEditIdx] = useState<number | null>(null);
  const [topicForm, setTopicForm] = useState({ name: "" });

  // Resource saving
  const [resourceSaving, setResourceSaving] = useState(false);
  const [resourceSaveSuccess, setResourceSaveSuccess] = useState(false);

  // ── Words-tab-specific state (verse text, Strong's words, loading) ──
  const [wordVerseText, setWordVerseText] = useState<string | null>(null);
  const [wordVerseWords, setWordVerseWords] = useState<WordEntry[]>([]);
  const [wordVerseLoading, setWordVerseLoading] = useState(false);
  const [wordVerseTotal, setWordVerseTotal] = useState(0);
  const [wordVersePage, setWordVersePage] = useState(0);
  const [wordVerseHasNext, setWordVerseHasNext] = useState(false);
  const [wordVersePageSize, setWordVersePageSize] = useState(50);

  // ── Sync all verse references state ──
  const [syncingAllRefs, setSyncingAllRefs] = useState(false);
  const [confirmSyncOpen, setConfirmSyncOpen] = useState(false);
  const confirmSyncActionRef = useRef<(() => Promise<void>) | null>(null);
  const [confirmSyncLabel, setConfirmSyncLabel] = useState("");
  const [confirmSyncDesc, setConfirmSyncDesc] = useState("");

  // ── Word detail side panel ──
  const [detailWord, setDetailWord] = useState<WordEntry | null>(null);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);

  // ── Edit word form ──
  const [wordForm, setWordForm] = useState({
    originalWord: "",
    transliteration: "",
    shortDefinition: "",
    fullDefinition: "",
    language: "greek",
    partOfSpeech: "",
    adminExplanation: "",
  });

  // ── Edit sheet verse selector (separate from main verse selector) ──
  const [editVerseBook, setEditVerseBook] = useState("");
  const [editVerseChapter, setEditVerseChapter] = useState(0);
  const [editVerseNum, setEditVerseNum] = useState(0);
  const [editChapList, setEditChapList] = useState<number[]>([]);
  const [editVerList, setEditVerList] = useState<number[]>([]);
  const [editVersePreview, setEditVersePreview] = useState<string | null>(null);
  const [editVerseTranslation, setEditVerseTranslation] = useState("BSB");
  // Persist edit sheet's translation choice across re-opens
  const lastEditTranslationRef = useRef<string | null>(null);

  // =============== LOAD WORDS ===============

  const loadWords = useCallback(async (search = "") => {
    setWordsLoading(true);
    try {
      const res = await sendPostRequest("strongs", "admin/list-entries", {
        page: 0,
        pageSize: 100,
        search: search || undefined,
      });
      if (res.returnCode === 200 && res.returnData) {
        const rd = res.returnData as any;
        setWords(rd.data || []);
      }
    } catch (e) {
      console.error("Failed to load words:", e);
    } finally {
      setWordsLoading(false);
    }
  }, []);

  // =============== LOAD WORDS FOR VERSE ===============

  const loadWordsForVerse = useCallback(async (book: string, chapter: number, verse: number, page = 0, append = false) => {
    setWordVerseLoading(true);
    try {
      // Fetch paginated unique Strong's entries
      const res = await sendPostRequest("strongs", "admin/get-verse-unique-words", {
        bookName: book,
        chapter,
        verse,
        translation: wordsTranslation,
        page,
        pageSize: wordVersePageSize,
      });
      if (res.returnCode === 200 && res.returnData) {
        const rd = res.returnData as any;
        const newData = rd.data || [];
        setWordVerseWords((prev) => (append ? [...prev, ...newData] : newData));
        setWordVerseTotal(rd.total ?? newData.length);
        setWordVerseHasNext(!!rd.hasNext);
        setWordVersePage(page);
      } else {
        console.warn("Verse words API returned:", res.returnCode, res.returnMessage);
        if (res.returnCode !== 200) {
          toast({ title: "Failed to load verse words", description: res.returnMessage || "Unknown error", variant: "destructive" });
        }
        setWordVerseWords([]);
        setWordVerseTotal(0);
        setWordVerseHasNext(false);
      }
    } catch (e) {
      console.error("Verse words API error:", e);
      toast({ title: "Error loading verse words", description: (e as Error).message || "Request failed", variant: "destructive" });
      setWordVerseWords([]);
      setWordVerseTotal(0);
      setWordVerseHasNext(false);
    } finally {
      setWordVerseLoading(false);
    }
  }, [wordsTranslation, wordVersePageSize]);

  // =============== LOAD RESOURCES ===============

  const loadResource = useCallback(async (book: string, chapter: number, verse: number) => {
    setResourcesLoading(true);
    setResSearched(true);
    try {
      const res = await sendPostRequest("verse-resources", "get", {
        bookName: book,
        chapter,
        verseNumber: verse,
      });
      if (res.returnCode === 200 && res.returnData) {
        const rd = res.returnData as any;
        const resource: VerseResource = {
          id: rd.id,
          bookName: rd.bookName,
          chapter: rd.chapter,
          verseStart: rd.verseStart,
          verseEnd: rd.verseEnd,
          commentaries: Array.isArray(rd.commentaries) ? rd.commentaries : [],
          crossReferences: Array.isArray(rd.crossReferences) ? rd.crossReferences : [],
          wordStudies: Array.isArray(rd.wordStudies) ? rd.wordStudies : [],
          dictionaryTerms: Array.isArray(rd.dictionaryTerms) ? rd.dictionaryTerms : [],
          interlinearWords: Array.isArray(rd.interlinearWords) ? rd.interlinearWords : [],
          relatedTopics: Array.isArray(rd.relatedTopics) ? rd.relatedTopics : [],
        };
        setCurrentResource(resource);
        setWordStudies(resource.wordStudies);
        setCommentaries(resource.commentaries);
        setCrossRefs(resource.crossReferences);
        setDictTerms(resource.dictionaryTerms);
        setTopics(resource.relatedTopics);
      } else {
        // No resource found — create empty resource for this verse
        setCurrentResource(null);
        setWordStudies([]);
        setCommentaries([]);
        setCrossRefs([]);
        setDictTerms([]);
        setTopics([]);
      }
    } catch (e) {
      console.error("Failed to load resources:", e);
      setCurrentResource(null);
    } finally {
      setResourcesLoading(false);
    }
  }, []);

  // =============== SAVE RESOURCE ===============

  const saveResource = useCallback(async () => {
    setResourceSaving(true);
    setResourceSaveSuccess(false);
    try {
      const payload: any = {
        bookName: verseBook,
        chapter: verseChapter,
        verseStart: verseNum,
        verseEnd: null,
        translation: verseTranslation,
        wordStudies,
        commentaries,
        crossReferences: crossRefs,
        dictionaryTerms: dictTerms,
        relatedTopics: topics,
        interlinearWords: [],
      };
      if (currentResource?.id) {
        payload.id = currentResource.id;
      }
      const res = await sendPostRequest("verse-resources", "upsert", payload);
      if (res.returnCode === 200) {
        toast({ title: "Verse resources saved successfully" });
        setResourceSaveSuccess(true);
        loadResource(verseBook, verseChapter, verseNum);
      } else {
        toast({ title: "Failed to save", description: res.returnMessage, variant: "destructive" });
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setResourceSaving(false);
    }
  }, [verseBook, verseChapter, verseNum, wordStudies, commentaries, crossRefs, dictTerms, topics, currentResource, toast, loadResource]);

  // =============== DELETE RESOURCE ===============

  const deleteResource = useCallback(async () => {
    if (!currentResource?.id) return;
    if (!confirm("Delete this resource for " + verseBook + " " + verseChapter + ":" + verseNum + "?")) return;
    try {
      const res = await sendPostRequest("verse-resources", "delete", { id: currentResource.id });
      if (res.returnCode === 200) {
        toast({ title: "Resource deleted" });
        setCurrentResource(null);
        setWordStudies([]);
        setCommentaries([]);
        setCrossRefs([]);
        setDictTerms([]);
        setTopics([]);
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  }, [currentResource, verseBook, verseChapter, verseNum, toast]);

  // ── Debounce refs to avoid race conditions on rapid selection changes ──
  const wordLoadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resourceLoadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load resource when switching to resources tab or when selection changes
  useEffect(() => {
    // Clear any pending debounced load
    if (resourceLoadTimeoutRef.current) {
      clearTimeout(resourceLoadTimeoutRef.current);
    }

    if (activeTab === "resources" && verseBook) {
      setResSearched(true);  // Show loading immediately
      resourceLoadTimeoutRef.current = setTimeout(() => {
        loadResource(verseBook, verseChapter || 0, verseNum || 0);
      }, 300);
    }

    return () => {
      if (resourceLoadTimeoutRef.current) {
        clearTimeout(resourceLoadTimeoutRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, verseBook, verseChapter, verseNum]);

  // ── Load available translations on mount ──
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const apiTranslations = await bibleApi.getTranslations();
        const mapped = apiTranslations.map((t: any) => ({
          value: t.id,
          label: `${t.name} (${t.shortName || t.id})`,
        }));
        setTranslations(mapped);
        if (mapped.length > 0) {
          setVerseTranslation(mapped[0].value);
          setWordsTranslation(mapped[0].value);
        }
      } catch {
        // Fallback to locally bundled versions
        const local = BIBLE_VERSIONS.map((v) => ({
          value: v.id,
          label: `${v.name} (${v.abbreviation})`,
        }));
        setTranslations(local);
        if (local.length > 0) {
          setVerseTranslation(local[0].value);
          setWordsTranslation(local[0].value);
        }
      }
    };
    loadTranslations();
  }, []);

  // ── Update chapter & verse options when book changes (shared) ──
  useEffect(() => {
    if (!verseBook) {
      setVerseChapList([]);
      setVerseNumList([]);
      setVerseChapter(0);
      setVerseNum(0);
      setVersePreview(null);
      setResSearched(false);
      setCurrentResource(null);
      return;
    }
    const chs = getChaptersForBook(verseBook);
    setVerseChapList(chs);
    setVerseNumList([]);
    setVerseChapter(0);
    setVerseNum(0);
    setVersePreview(null);
    setResSearched(false);
    setCurrentResource(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verseBook]);

  // ── Update verse options when chapter changes (shared) ──
  useEffect(() => {
    if (verseBook && verseChapter && verseChapter > 0) {
      setVerseNum(1);
      setVersePreview(null);
      setResSearched(false);
      setCurrentResource(null);
      const vCount = getVersesCountForChapter(verseBook, verseChapter);
      setVerseNumList(Array.from({ length: vCount }, (_, i) => i + 1));
    } else {
      setVerseNumList([]);
      setVerseNum(0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verseBook, verseChapter]);

  // Helper: get verse text for a given translation
  const getTextForTranslation = useCallback(
    (book: string, ch: number, vs: number, translationId?: string) => {
      if (translationId) {
        return getVerseText(book, ch, vs, getVersionById(translationId).data);
      }
      return getVerseText(book, ch, vs);
    },
    [],
  );

  // Helper: parse a ref string like "John 3:16" into { book, chapter, verse }
  const parseRef = useCallback((ref: string) => {
    const match = ref.match(/^(.+?)\s+(\d+):(\d+)$/);
    if (match) {
      return {
        book: match[1],
        chapter: Number(match[2]),
        verse: Number(match[3]),
      };
    }
    return null;
  }, []);

  // ── Fetch verse text preview when verse changes (shared) ──
  useEffect(() => {
    if (verseBook && verseChapter > 0 && verseNum > 0) {
      const text = getTextForTranslation(verseBook, verseChapter, verseNum, verseTranslation);
      setVersePreview(text);
    } else {
      setVersePreview(null);
    }
  }, [verseBook, verseChapter, verseNum, verseTranslation, getTextForTranslation]);

  // ── Words tab: auto-load Strong's words when verse selection changes (debounced) ──
  useEffect(() => {
    // Clear any pending debounced load
    if (wordLoadTimeoutRef.current) {
      clearTimeout(wordLoadTimeoutRef.current);
    }

    if (!verseBook) {
      setVerseSearched(false);
      setWordVerseWords([]);
      setWordVerseTotal(0);
      setWordVerseText(null);
      setWordVersePage(0);
      setWordVerseHasNext(false);
      setWordVerseLoading(false);
      return;
    }

    // Show loading skeleton immediately — don't wait for the timeout
    setVerseSearched(true);
    setWordVerseLoading(true);

    // Debounce by 300ms so rapid selection changes only fire one request
    wordLoadTimeoutRef.current = setTimeout(() => {
      if (verseNum > 0) {
        // Verse-level: show verse text + unique words for this specific verse
        const text = getVerseText(verseBook, verseChapter, verseNum);
        setWordVerseText(text);
        loadWordsForVerse(verseBook, verseChapter, verseNum, 0, false);
      } else if (verseChapter > 0) {
        // Chapter-level: unique words across the whole chapter
        setWordVerseText(null);
        loadWordsForVerse(verseBook, verseChapter, 0, 0, false);
      } else {
        // Book-level: unique words across the whole book
        setWordVerseText(null);
        loadWordsForVerse(verseBook, 0, 0, 0, false);
      }
    }, 300);

    return () => {
      if (wordLoadTimeoutRef.current) {
        clearTimeout(wordLoadTimeoutRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verseBook, verseChapter, verseNum, wordsTranslation, wordVersePageSize]);


  // ── Edit sheet: update chapter list when book changes ──
  useEffect(() => {
    if (!editVerseBook) {
      setEditChapList([]);
      setEditVerList([]);
      setEditVerseChapter(0);
      setEditVerseNum(0);
      setEditVersePreview(null);
      return;
    }
    const chs = getChaptersForBook(editVerseBook);
    setEditChapList(chs);
    setEditVerList([]);
    setEditVerseChapter(0);
    setEditVerseNum(0);
    setEditVersePreview(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editVerseBook]);

  // ── Edit sheet: update verse list when chapter changes ──
  useEffect(() => {
    if (editVerseBook && editVerseChapter && editVerseChapter > 0) {
      setEditVerseNum(1);
      setEditVersePreview(null);
      const vCount = getVersesCountForChapter(editVerseBook, editVerseChapter);
      setEditVerList(Array.from({ length: vCount }, (_, i) => i + 1));
    } else {
      setEditVerList([]);
      setEditVerseNum(0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editVerseBook, editVerseChapter]);

  // ── Edit sheet: fetch verse preview when verse changes ──
  useEffect(() => {
    if (editVerseBook && editVerseChapter > 0 && editVerseNum > 0) {
      const text = getTextForTranslation(editVerseBook, editVerseChapter, editVerseNum, editVerseTranslation);
      setEditVersePreview(text);
    } else {
      setEditVersePreview(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editVerseBook, editVerseChapter, editVerseNum, editVerseTranslation]);

  // ── Cross-reference: update chapter list when book changes ──
  useEffect(() => {
    const chs = getChaptersForBook(xrefRefBook);
    setXrefRefChapList(chs);
    if (chs.length > 0) {
      setXrefRefChap(chs[0]);
      setXrefRefVer(1);
      const vCount = getVersesCountForChapter(xrefRefBook, chs[0]);
      setXrefRefVerList(Array.from({ length: vCount }, (_, i) => i + 1));
    } else {
      setXrefRefChapList([]);
      setXrefRefVerList([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xrefRefBook]);

  // ── Cross-reference: update verse list when chapter changes ──
  useEffect(() => {
    if (xrefRefBook && xrefRefChap) {
      setXrefRefVer(1);
      const vCount = getVersesCountForChapter(xrefRefBook, xrefRefChap);
      setXrefRefVerList(Array.from({ length: vCount }, (_, i) => i + 1));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xrefRefBook, xrefRefChap]);

  // ── Cross-reference: update ref preview when verse selected ──
  useEffect(() => {
    if (xrefRefBook && xrefRefChap && xrefRefVer) {
      const refStr = `${xrefRefBook} ${xrefRefChap}:${xrefRefVer}`;
      setXrefForm((p) => ({ ...p, ref: refStr }));
      const text = getVerseText(xrefRefBook, xrefRefChap, xrefRefVer);
      setXrefRefPreview(text);
    }
  }, [xrefRefBook, xrefRefChap, xrefRefVer]);

  // ── Cross-reference: parse existing ref when opening edit dialog ──
  const openXrefEdit = (idx: number, item: CrossReferenceItem) => {
    setXrefEditIdx(idx);
    setXrefForm(item);
    setXrefSheetOpen(true);
    // Parse existing ref to initialize verse selectors
    const match = item.ref.match(/^(.+?)\s+(\d+):(\d+)$/);
    if (match) {
      const book = match[1];
      const ch = Number(match[2]);
      const vs = Number(match[3]);
      if (BIBLE_BOOKS.includes(book as any)) {
        setXrefRefBook(book);
        setXrefRefChap(ch);
        setXrefRefVer(vs);
      }
    }
  };

  // =============== WORD SEARCH ===============

  // Auto-search when input >= 3 characters (debounced)
  useEffect(() => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }
    if (wordSearch.trim().length >= 3) {
      searchDebounceRef.current = setTimeout(() => {
        setWordSearchPerformed(true);
        loadWords(wordSearch);
      }, 350);
    }
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wordSearch]);

  const handleClearSearch = () => {
    setWordSearch("");
    setWordSearchPerformed(false);
    setWords([]);
    setWordsLoading(false);
  };

  // =============== EDIT WORD ===============

  const openEditWord = (word: WordEntry) => {
    setWordForm({
      originalWord: word.originalWord || "",
      transliteration: word.transliteration || "",
      shortDefinition: word.shortDefinition || "",
      fullDefinition: word.fullDefinition || "",
      language: word.language || "greek",
      partOfSpeech: word.partOfSpeech || "",
      adminExplanation: word.adminExplanation || "",
    });
    // Pre-fill verse selector from main verse selection so the user sees which verse context the word belongs to
    if (verseBook) {
      setEditVerseBook(verseBook);
      setEditVerseChapter(verseChapter);
      setEditVerseNum(verseNum);
      // Use persisted translation if available, otherwise fall back to main selector
      setEditVerseTranslation(lastEditTranslationRef.current || wordsTranslation);
    }
    setEditWord(word);
    setEditSheetOpen(true);
  };

  const openNewWord = () => {
    setWordForm({
      originalWord: "",
      transliteration: "",
      shortDefinition: "",
      fullDefinition: "",
      language: "greek",
      partOfSpeech: "",
      adminExplanation: "",
    });
    // Default to current verse selection
    if (verseBook) {
      setEditVerseBook(verseBook);
      setEditVerseChapter(verseChapter);
      setEditVerseNum(verseNum);
      setEditVerseTranslation(lastEditTranslationRef.current || wordsTranslation);
    } else {
      setEditVerseBook("");
      setEditVerseChapter(0);
      setEditVerseNum(0);
      setEditVerseTranslation(lastEditTranslationRef.current || "BSB");
    setEditWord(null);
    setEditSheetOpen(true);
  };

  const saveWord = async () => {
    if (!editWord?.strongsId) {
      toast({ title: "No word selected", variant: "destructive" });
      return;
    }
    if (!wordForm.shortDefinition.trim()) {
      toast({ title: "Definition is required", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const res = await sendPostRequest("strongs", "admin/update-entry", {
        strongsId: editWord.strongsId,
        originalWord: wordForm.originalWord || null,
        transliteration: wordForm.transliteration || null,
        shortDefinition: wordForm.shortDefinition,
        fullDefinition: wordForm.fullDefinition || null,
        partOfSpeech: wordForm.partOfSpeech || null,
        language: wordForm.language,
        adminExplanation: wordForm.adminExplanation || null,
      });
      if (res.returnCode === 200) {
        // Also save the verse-to-word association if a verse is selected
        if (editVerseBook && editVerseChapter > 0 && editVerseNum > 0) {
          try {
            await sendPostRequest("strongs", "admin/upsert-verse-word-study", {
              strongsId: editWord.strongsId,
              bookName: editVerseBook,
              chapter: editVerseChapter,
              verse: editVerseNum,
              translation: editVerseTranslation,
              adminExplanation: wordForm.adminExplanation || null,
            });
          } catch (e) {
            console.warn("Verse association save failed:", e);
            toast({ title: "Word updated, but verse association failed", variant: "destructive" });
          }
        }
        toast({ title: "Word entry updated successfully" });
        setEditSheetOpen(false);
        loadWords(wordSearch);
        // Re-load verse words if a verse is selected and we're on the Words tab
        if (verseBook && activeTab === "words") {
          loadWordsForVerse(verseBook, verseChapter, verseNum, 0, false);
        }
      } else {
        toast({
          title: "Failed to update",
          description: res.returnMessage,
          variant: "destructive",
        });
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // =============== RENDER WORD TAB ===============

  const openWordDetailSheet = (word: WordEntry) => {
    setDetailWord(word);
    setDetailSheetOpen(true);
  };

  const renderWordsTab = () => (
    <div className="space-y-5">
      {/* ── Verse Selector ── */}
      <div className="rounded-lg border border-border/50 bg-card p-4 space-y-3">
        <div className="flex items-center gap-2">
          <BookText className="w-4 h-4 text-primary" />
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Browse words by book, chapter, or verse
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-2 w-full">
          {/* Book */}
          <div className="flex-1 min-w-[140px]">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Book</label>
            <Combobox
              options={BIBLE_BOOKS.map((b) => ({ value: b, label: b }))}
              value={verseBook}
              onChange={(v) => { if (v) setVerseBook(v); }}
              placeholder="Select book"
              searchPlaceholder="Search books..."
              width="w-full"
            />
          </div>
          {/* Chapter */}
          <div className="flex-1 min-w-[100px]">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Chapter</label>
            <Combobox
              options={verseChapList.map((c) => ({ value: String(c), label: `Ch. ${c}` }))}
              value={String(verseChapter)}
              onChange={(v) => { if (v) setVerseChapter(Number(v)); }}
              placeholder="Select ch."
              searchPlaceholder="Find chapter..."
              disabled={verseChapList.length === 0}
              width="w-full"
            />
          </div>
          {/* Verse */}
          <div className="flex-1 min-w-[100px]">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Verse</label>
            <Combobox
              options={verseNumList.map((v) => ({ value: String(v), label: `V. ${v}` }))}
              value={String(verseNum)}
              onChange={(v) => { if (v) setVerseNum(Number(v)); }}
              placeholder="Select v."
              searchPlaceholder="Find verse..."
              disabled={verseNumList.length === 0}
              width="w-full"
            />
          </div>
          {/* Translation */}
          <div className="flex-1 min-w-[140px]">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Translation</label>              <Combobox
                options={translations}
                value={wordsTranslation}
                onChange={(v) => { if (v) setWordsTranslation(v); }}
                placeholder="Select"
                searchPlaceholder="Search..."
                width="w-full"
              />
            </div>
          </div>

        {/* Verse text display (shown when a verse is selected) */}
        {verseSearched && wordVerseText && (
          <div className="rounded-lg bg-muted/30 border border-border/30 p-3 mt-2">
            <div className="flex items-center gap-1.5 mb-2">
              <BookOpen className="w-3 h-3 text-muted-foreground" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                {verseBook} {verseChapter}:{verseNum}
              </span>
              <Badge variant="outline" className="text-[9px] font-mono">
                {wordsTranslation}
              </Badge>
            </div>
            <p className="text-sm leading-relaxed text-foreground/85">
              {wordVerseText.split(/(\s+)/).map((token, i) => {
                const clean = token.replace(/[^a-zA-Z]/g, "").toLowerCase();
                const matched = wordVerseWords.some(
                  (w) =>
                    w.transliteration?.toLowerCase() === clean ||
                    w.shortDefinition?.toLowerCase().includes(clean),
                );
                if (matched && token.trim()) {
                  return (
                    <span
                      key={i}
                      className="text-primary font-semibold underline decoration-primary/30 decoration-dotted underline-offset-2 cursor-help"
                      title="Has a word study entry"
                    >
                      {token}
                    </span>
                  );
                }
                return <span key={i}>{token}</span>;
              })}
            </p>
          </div>
        )}
      </div>

      {/* ── Search + add ── */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search words by original word, transliteration, or definition..."
            value={wordSearch}
            onChange={(e) => setWordSearch(e.target.value)}
            className="pl-9 pr-8 h-9 text-sm"
          />
          {wordSearch && (
            <button
              onClick={handleClearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

        </div>
        <Button
          size="sm"
          onClick={openNewWord}
          className="h-9 gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Word
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            confirmSyncActionRef.current = async () => {
              setSyncingAllRefs(true);
              try {
                const res = await sendPostRequest("strongs", "admin/sync-all-verse-references", {});
                if (res.returnCode === 200) {
                  const rd = res.returnData as any;
                  toast({
                    title: "All verse references synced",
                    description: `${rd.syncedCount} entries updated with ${rd.totalReferences} references`,
                  });
                  // Refresh the current view
                  loadWords(wordSearch);
                  if (verseBook) {
                    loadWordsForVerse(verseBook, verseChapter, verseNum, 0, false);
                  }
                } else {
                  toast({
                    title: "Sync failed",
                    description: res.returnMessage,
                    variant: "destructive",
                  });
                }
              } catch (e: any) {
                toast({
                  title: "Error",
                  description: e.message,
                  variant: "destructive",
                });
              } finally {
                setSyncingAllRefs(false);
              }
            };
            setConfirmSyncLabel("Sync all verse references?");
            setConfirmSyncDesc("This will scan all verse word studies and update the verseReferences field on every Strong's Dictionary entry. This operation is safe to run at any time.");
            setConfirmSyncOpen(true);
          }}
          disabled={syncingAllRefs}
          className="h-9 gap-1 text-xs"
        >
          {syncingAllRefs ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5" />
          )}
          {syncingAllRefs ? "Syncing..." : "Sync References"}
        </Button>
      </div>

      {/* ── Word list ── */}
      {wordsLoading || wordVerseLoading ? (
        <div className="space-y-3 py-4">
          {/* Stats bar skeleton */}
          <div className="flex items-center gap-3 rounded-lg bg-muted/20 border border-border/40 p-2.5">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-24 ml-auto" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-16" />
          </div>
          {/* Word card skeletons */}
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-xl border border-border/50 bg-card p-3"
            >
              <Skeleton className="w-9 h-9 rounded-lg shrink-0" />
              <div className="flex-1 min-w-0 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-2/3" />
                <div className="flex gap-2 pt-1">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
              </div>
              <Skeleton className="w-8 h-8 rounded-full shrink-0" />
            </div>
          ))}
        </div>
      ) : !verseSearched && !wordSearchPerformed ? (
        <div className="flex flex-col items-center py-16 text-center">
          <BookText className="w-12 h-12 text-muted-foreground/30 mb-3" />
          <p className="text-sm font-semibold text-muted-foreground">
            Select a book to get started
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1 max-w-sm">
            Pick a book above to see all its unique words, then refine by
            chapter and verse, or use the search bar to find a specific word.
          </p>
        </div>
      ) : verseSearched && !wordVerseLoading && wordVerseWords.length === 0 && !wordSearchPerformed ? (
        <div className="flex flex-col items-center py-16 text-center">
          <BookText className="w-12 h-12 text-muted-foreground/30 mb-3" />
          <p className="text-sm font-semibold text-muted-foreground">
            No word entries found
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1 max-w-sm">
            No Strong's word data is available for {verseBook} {verseChapter}:{verseNum} in {wordsTranslation}.
            Try a different translation or search for a word above.
          </p>
        </div>
      ) : wordSearchPerformed && words.length === 0 && wordVerseWords.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <Search className="w-12 h-12 text-muted-foreground/30 mb-3" />
          <p className="text-sm font-semibold text-muted-foreground">
            No words match your search
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1 max-w-sm">
            Try a different search term or select a verse and click "Load Words".
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Language distribution summary */}
          {wordVerseWords.length > 0 && (
            <>
              {/* Stats bar */}
              <div className="flex items-center gap-3 flex-wrap rounded-lg bg-muted/20 border border-border/40 p-2.5">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-bold text-foreground">
                    {verseNum > 0
                      ? `${verseBook} ${verseChapter}:${verseNum}`
                      : verseChapter > 0
                        ? `${verseBook} ${verseChapter}`
                        : verseBook}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <span className="tabular-nums font-semibold text-foreground">{wordVerseTotal || wordVerseWords.length}</span>
                  <span>unique {verseNum > 0 ? 'verse' : verseChapter > 0 ? 'chapter' : 'book'} words</span>
                </div>
                {(() => {
                  const greekCount = wordVerseWords.filter(w => w.language?.toLowerCase() === "greek").length;
                  const hebrewCount = wordVerseWords.filter(w => w.language?.toLowerCase() === "hebrew").length;
                  const aramaicCount = wordVerseWords.filter(w => w.language?.toLowerCase() === "aramaic").length;
                  return (
                    <div className="flex items-center gap-2 ml-auto">
                      {greekCount > 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px]">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#3b82f6" }} />
                          <span className="tabular-nums font-semibold">{greekCount}</span>
                          <span className="text-muted-foreground/60">Greek</span>
                        </span>
                      )}
                      {hebrewCount > 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px]">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#f59e0b" }} />
                          <span className="tabular-nums font-semibold">{hebrewCount}</span>
                          <span className="text-muted-foreground/60">Hebrew</span>
                        </span>
                      )}
                      {aramaicCount > 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px]">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#e11d48" }} />
                          <span className="tabular-nums font-semibold">{aramaicCount}</span>
                          <span className="text-muted-foreground/60">Aramaic</span>
                        </span>
                      )}
                    </div>
                  );
                })()}

                {/* Page size selector */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Page</span>
                  <Select
                    value={String(wordVersePageSize)}
                    onValueChange={(v) => {
                      const newSize = Number(v);
                      setWordVersePageSize(newSize);
                    }}
                  >
                    <SelectTrigger className="h-6 w-16 text-[10px] px-1.5 py-0 border-border/40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="25" className="text-xs">25</SelectItem>
                      <SelectItem value="50" className="text-xs">50</SelectItem>
                      <SelectItem value="100" className="text-xs">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Verse-specific word cards */}
              {wordVerseWords.map((word) => (
                <WordCard
                  key={word.strongsId}
                  word={word}
                  onClick={() => openWordDetailSheet(word)}
                  onEdit={() => openEditWord(word)}
                  showEditButton={true}
                  showGrammarCase={true}
                  showFullDefinition={true}
                />
              ))}

              {/* Load More button */}
              {wordVerseHasNext && (
                <div className="flex items-center justify-center pt-1 pb-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const nextPage = wordVersePage + 1;
                      loadWordsForVerse(verseBook, verseChapter, verseNum, nextPage, true);
                    }}
                    disabled={wordVerseLoading}
                    className="gap-1.5 text-xs h-8"
                  >
                    {wordVerseLoading ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <BookOpen className="w-3 h-3" />
                    )}
                    {wordVerseLoading
                      ? "Loading..."
                      : `Show more (${wordVerseWords.length} of ${wordVerseTotal} words)`}
                  </Button>
                </div>
              )}

              {/* Back to top — shown after loading at least 2 pages */}
              {wordVersePage > 0 && (
                <div className="flex items-center justify-center pb-1">
                  <button
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-border/40 hover:border-border/80 transition-all"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="shrink-0"
                    >
                      <polyline points="18 15 12 9 6 15" />
                    </svg>
                    Back to top
                  </button>
                </div>
              )}

              <div className="border-t border-border/30 my-2" />
            </>
          )}

          {/* Search results (only after user clicks Search) */}
          {wordSearchPerformed && words.length > 0 && (
            <>
              <div className="flex items-center gap-2 rounded-lg bg-muted/10 border border-border/30 p-2">
                <Search className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-bold text-foreground">Search Results</span>
                <span className="text-[10px] text-muted-foreground tabular-nums">
                  {words.length} word{words.length !== 1 ? "s" : ""} found
                </span>
                <button
                  onClick={handleClearSearch}
                  className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <X className="w-3 h-3" />
                  Clear
                </button>
              </div>
              {words.map((word) => (
                <WordCard
                  key={word.strongsId}
                  word={word}
                  onClick={() => openWordDetailSheet(word)}
                  onEdit={() => openEditWord(word)}
                  showEditButton={true}
                  showGrammarCase={true}
                  showFullDefinition={true}
                />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );

  // =============== RENDER RESOURCES TAB ===============

  // ── Sub-components ──

  const VerseSelector = () => (
    <div className="flex flex-wrap items-end gap-2 w-full">
      {/* Book — searchable combobox */}
      <div className="flex-1 min-w-[140px]">
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Book</label>
        <Combobox
          options={BIBLE_BOOKS.map((b) => ({ value: b, label: b }))}
          value={verseBook}
          onChange={(v) => { if (v) setVerseBook(v); }}
          placeholder="Select book"
          searchPlaceholder="Search books..."
          width="w-full"
        />
      </div>

      {/* Chapter — dynamic combobox */}
      <div className="flex-1 min-w-[100px]">
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Chapter</label>
        <Combobox
          options={verseChapList.map((c) => ({ value: String(c), label: `Chapter ${c}` }))}
          value={String(verseChapter)}
          onChange={(v) => { if (v) setVerseChapter(Number(v)); }}
          placeholder={verseChapList.length > 0 ? "Select ch." : "—"}
          searchPlaceholder="Find chapter..."
          disabled={verseChapList.length === 0}
          width="w-full"
        />
      </div>

      {/* Verse — dynamic combobox */}
      <div className="flex-1 min-w-[100px]">
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Verse</label>
        <Combobox
          options={verseNumList.map((v) => ({ value: String(v), label: `Verse ${v}` }))}
          value={String(verseNum)}
          onChange={(v) => { if (v) setVerseNum(Number(v)); }}
          placeholder={verseNumList.length > 0 ? "Select v." : "—"}
          searchPlaceholder="Find verse..."
          disabled={verseNumList.length === 0}
          width="w-full"
        />
      </div>

      {/* Translation — searchable combobox */}
      <div className="flex-1 min-w-[140px]">
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Translation</label>
        <Combobox
          options={translations}
          value={verseTranslation}
          onChange={(v) => { if (v) setVerseTranslation(v); }}
          placeholder="Select translation"
          searchPlaceholder="Search translations..."
          width="w-full"
        />
      </div>
    </div>
  );

  // ── Word Studies section ──

  const renderWordStudiesSection = () => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Word Studies
          <span className="ml-1.5 font-normal text-[10px]">({wordStudies.length})</span>
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => { setWsEditIdx(null); setWsForm({ word: "", transliteration: "", meaning: "" }); setWsSheetOpen(true); }}
          className="h-7 gap-1 text-[10px]"
        >
          <Plus className="w-3 h-3" /> Add Word
        </Button>
      </div>
      {wordStudies.length === 0 ? (
        <p className="text-xs text-muted-foreground/60 italic py-2">No word studies added yet.</p>
      ) : (
        <div className="space-y-1.5">
          {wordStudies.map((ws, idx) => (
            <div key={idx} className="flex items-start gap-2 px-3 py-2 rounded-lg border border-border/50 bg-card">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground">{ws.word}</span>
                  {ws.transliteration && (
                    <span className="text-xs italic text-muted-foreground">{ws.transliteration}</span>
                  )}
                </div>
                <p className="text-xs text-foreground/70 mt-0.5 line-clamp-2">{ws.meaning}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary" onClick={() => { setWsEditIdx(idx); setWsForm(ws); setWsSheetOpen(true); }}>
                  <Edit2 className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => setWordStudies((prev) => prev.filter((_, i) => i !== idx))}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ── Commentaries section ──

  const renderCommentariesSection = () => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Commentaries
          <span className="ml-1.5 font-normal text-[10px]">({commentaries.length})</span>
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => { setCommEditIdx(null); setCommForm({ author: "", title: "", text: "" }); setCommSheetOpen(true); }}
          className="h-7 gap-1 text-[10px]"
        >
          <Plus className="w-3 h-3" /> Add
        </Button>
      </div>
      {commentaries.length === 0 ? (
        <p className="text-xs text-muted-foreground/60 italic py-2">No commentaries added yet.</p>
      ) : (
        <div className="space-y-1.5">
          {commentaries.map((c, idx) => (
            <div key={idx} className="flex items-start gap-2 px-3 py-2 rounded-lg border border-border/50 bg-card">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground">{c.author}</span>
                  {c.title && <span className="text-xs text-muted-foreground italic">— {c.title}</span>}
                </div>
                <p className="text-xs text-foreground/70 mt-0.5 line-clamp-2">{c.text}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary" onClick={() => { setCommEditIdx(idx); setCommForm(c); setCommSheetOpen(true); }}>
                  <Edit2 className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => setCommentaries((prev) => prev.filter((_, i) => i !== idx))}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ── Cross References section ──

  const renderCrossRefsSection = () => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Cross References
          <span className="ml-1.5 font-normal text-[10px]">({crossRefs.length})</span>
        </p>                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setXrefEditIdx(null);
                    setXrefForm({ ref: "", text: "" });
                    setXrefRefBook("John");
                    setXrefRefChap(1);
                    setXrefRefVer(1);
                    setXrefSheetOpen(true);
                  }}
                  className="h-7 gap-1 text-[10px]"
                >
                  <Plus className="w-3 h-3" /> Add
                </Button>
      </div>
      {crossRefs.length === 0 ? (
        <p className="text-xs text-muted-foreground/60 italic py-2">No cross-references added yet.</p>
      ) : (
        <div className="space-y-1.5">
          {crossRefs.map((x, idx) => {
            const refParts = parseRef(x.ref);
            const refText = refParts ? getTextForTranslation(refParts.book, refParts.chapter, refParts.verse, verseTranslation) : null;
            return (
              <div key={idx} className="flex items-start gap-2 px-3 py-2 rounded-lg border border-border/50 bg-card">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-primary">{x.ref}</span>
                    {refText && (
                      <span className="text-[10px] text-muted-foreground/50 italic truncate max-w-[200px]">
                        "{refText.slice(0, 80)}{refText.length > 80 ? "..." : ""}"
                      </span>
                    )}
                  </div>
                  {x.text && (
                    <p className="text-xs text-foreground/70 mt-0.5 line-clamp-2">{x.text}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary" onClick={() => openXrefEdit(idx, x)}>
                    <Edit2 className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => setCrossRefs((prev) => prev.filter((_, i) => i !== idx))}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // ── Dictionary Terms section ──

  const renderDictTermsSection = () => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Dictionary Terms
          <span className="ml-1.5 font-normal text-[10px]">({dictTerms.length})</span>
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => { setDictEditIdx(null); setDictForm({ term: "", pronunciation: "", definition: "", description: "" }); setDictSheetOpen(true); }}
          className="h-7 gap-1 text-[10px]"
        >
          <Plus className="w-3 h-3" /> Add
        </Button>
      </div>
      {dictTerms.length === 0 ? (
        <p className="text-xs text-muted-foreground/60 italic py-2">No dictionary terms added yet.</p>
      ) : (
        <div className="space-y-1.5">
          {dictTerms.map((d, idx) => (
            <div key={idx} className="flex items-start gap-2 px-3 py-2 rounded-lg border border-border/50 bg-card">
              <div className="flex-1 min-w-0">
                <span className="text-sm font-bold text-foreground">{d.term}</span>
                {d.pronunciation && <span className="text-xs text-muted-foreground ml-1 italic">({d.pronunciation})</span>}
                <p className="text-xs text-foreground/70 mt-0.5 line-clamp-1">{d.definition}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary" onClick={() => { setDictEditIdx(idx); setDictForm(d); setDictSheetOpen(true); }}>
                  <Edit2 className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => setDictTerms((prev) => prev.filter((_, i) => i !== idx))}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ── Topics section ──

  const renderTopicsSection = () => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Related Topics
          <span className="ml-1.5 font-normal text-[10px]">({topics.length})</span>
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => { setTopicEditIdx(null); setTopicForm({ name: "" }); setTopicSheetOpen(true); }}
          className="h-7 gap-1 text-[10px]"
        >
          <Plus className="w-3 h-3" /> Add
        </Button>
      </div>
      {topics.length === 0 ? (
        <p className="text-xs text-muted-foreground/60 italic py-2">No topics added yet.</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {topics.map((t, idx) => (
            <div key={idx} className="inline-flex items-center gap-1 px-2 py-1 rounded-full border border-border/60 bg-card text-xs font-medium">
              <span>{t.name}</span>
              <button
                onClick={() => setTopics((prev) => prev.filter((_, i) => i !== idx))}
                className="text-muted-foreground hover:text-destructive ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ── Main resources tab render ──

  const renderResourcesTab = () => (
    <div className="space-y-6">
      {/* Verse picker */}
      <div className="flex items-center justify-between">
        <VerseSelector />
        <div className="flex items-center gap-2">
          {/* Save button */}
          <Button
            size="sm"
            onClick={saveResource}
            disabled={resourceSaving || !resSearched}
            className="h-8 gap-1 text-xs"
          >
            {resourceSaving ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Save className="w-3 h-3" />
            )}
            {resourceSaving ? "Saving..." : "Save All"}
          </Button>
          {/* Delete all */}
          {currentResource && (
            <Button
              variant="outline"
              size="sm"
              onClick={deleteResource}
              className="h-8 gap-1 text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
            >
              <Trash2 className="w-3 h-3" />
              Delete
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              confirmSyncActionRef.current = async () => {
                setSyncingAllRefs(true);
                try {
                  const res = await sendPostRequest("strongs", "admin/sync-all-verse-references", {});
                  if (res.returnCode === 200) {
                    const rd = res.returnData as any;
                    toast({
                      title: "All verse references synced",
                      description: `${rd.syncedCount} entries updated with ${rd.totalReferences} references`,
                    });
                    // Refresh resource view
                    if (verseBook && verseChapter > 0 && verseNum > 0) {
                      loadResource(verseBook, verseChapter, verseNum);
                    }
                  } else {
                    toast({
                      title: "Sync failed",
                      description: res.returnMessage,
                      variant: "destructive",
                    });
                  }
                } catch (e: any) {
                  toast({
                    title: "Error",
                    description: e.message,
                    variant: "destructive",
                  });
                } finally {
                  setSyncingAllRefs(false);
                }
              };
              setConfirmSyncLabel("Sync all verse references?");
              setConfirmSyncDesc("This will scan all verse word studies and update the verseReferences field on every Strong's Dictionary entry. This operation is safe to run at any time.");
              setConfirmSyncOpen(true);
            }}
            disabled={syncingAllRefs}
            className="h-8 gap-1 text-xs"
          >
            {syncingAllRefs ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            {syncingAllRefs ? "Syncing..." : "Sync References"}
          </Button>
        </div>
      </div>

      {/* Loading state */}
      {resourcesLoading ? (
        <div className="space-y-6 py-4">
          {/* Badge row skeleton */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-36 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          {/* Verse preview skeleton */}
          <div className="rounded-lg border border-border/50 bg-muted/20 p-3">
            <Skeleton className="h-3 w-48 mb-2" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          {/* Section skeletons */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-7 w-20 rounded-md" />
              </div>
              <div className="rounded-lg border border-border/50 bg-card p-3">
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-3 w-full mb-1" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : !resSearched ? (
        <div className="flex flex-col items-center py-16 text-center">
          <HelpCircle className="w-12 h-12 text-muted-foreground/30 mb-3" />
          <p className="text-sm font-semibold text-muted-foreground">
            Select a verse and click "Load"
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1 max-w-sm">
            Choose a book, chapter, and verse, then click Load to view or create
            resources for that verse.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Verse reference & translation badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="outline"
              className="text-sm font-bold px-3 py-1.5 bg-primary/10 border-primary/30 text-primary"
            >
              {verseBook} {verseChapter}:{verseNum}
            </Badge>
            <Badge
              variant="secondary"
              className="text-[10px] font-mono"
            >
              <Languages className="w-2.5 h-2.5 mr-1" />
              {verseTranslation}
            </Badge>
            {currentResource && (
              <Badge variant="secondary" className="text-[10px]">
                ID: {currentResource.id}
              </Badge>
            )}
            {!currentResource && resSearched && !resourcesLoading && (
              <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-300 bg-amber-50">
                New — no existing resource
              </Badge>
            )}
          </div>

          {/* ── Verse text preview ── */}
          <div className="rounded-lg border border-border/50 bg-muted/20 p-3">
            <div className="flex items-start gap-2">
              <BookText className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                  Verse Preview
                  <span className="ml-1.5 font-normal text-[10px] normal-case">
                    ({verseBook} {verseChapter}:{verseNum} — {verseTranslation})
                  </span>
                </p>
                {versePreview ? (
                  <p className="text-xs sm:text-sm leading-relaxed text-foreground/80 italic">
                    "{versePreview}"
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground/50 italic">
                    Verse text not available for this translation.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Word Studies */}
          {renderWordStudiesSection()}

          {/* Commentaries */}
          {renderCommentariesSection()}

          {/* Cross References */}
          {renderCrossRefsSection()}

          {/* Dictionary Terms */}
          {renderDictTermsSection()}

          {/* Related Topics */}
          {renderTopicsSection()}
        </div>
      )}
    </div>
  );

  // =============== RENDER BOOK PROLOGUES TAB ===============

  const [prologues, setPrologues] = useState<any[]>([]);
  const [prologuesLoading, setProloguesLoading] = useState(true);
  const [prologueSearch, setPrologueSearch] = useState("");

  const loadPrologues = useCallback(async () => {
    setProloguesLoading(true);
    try {
      const res = await sendPostRequest("book-prologues", "admin/get-all", {
        page: 0,
        pageSize: 100,
        search: prologueSearch || undefined,
      });
      if (res.returnCode === 200 && res.returnData) {
        const rd = res.returnData as any;
        setPrologues(rd.data || []);
      }
    } catch (e) {
      console.error("Failed to load prologues:", e);
    } finally {
      setProloguesLoading(false);
    }
  }, [prologueSearch]);

  useEffect(() => {
    if (activeTab === "prologues") loadPrologues();
  }, [activeTab, prologueSearch, loadPrologues]);

  // ── Prologue view mode: "search" or "browse" ──
  const [prologueViewMode, setPrologueViewMode] = useState<"search" | "browse">("search");
  const [prologueFilter, setPrologueFilter] = useState<"all" | "missing">("all");

  // ── Edit prologue state ──
  const [editPrologue, setEditPrologue] = useState<any>(null);
  const [prologueSheetOpen, setPrologueSheetOpen] = useState(false);
  const [prologueSaving, setPrologueSaving] = useState(false);
  const [prologueForm, setPrologueForm] = useState({
    bookName: "",
    author: "",
    audience: "",
    dateWritten: "",
    purpose: "",
    keyTheme: "",
    summary: "",
    christConnection: "",
  });

  const openEditPrologue = (prologue: any) => {
    setPrologueForm({
      bookName: prologue.bookName || "",
      author: prologue.author || "",
      audience: prologue.audience || "",
      dateWritten: prologue.dateWritten || "",
      purpose: prologue.purpose || "",
      keyTheme: prologue.keyTheme || "",
      summary: prologue.summary || "",
      christConnection: prologue.christConnection || "",
    });
    setEditPrologue(prologue);
    setPrologueSheetOpen(true);
  };

  const openNewPrologue = () => {
    setPrologueForm({
      bookName: "",
      author: "",
      audience: "",
      dateWritten: "",
      purpose: "",
      keyTheme: "",
      summary: "",
      christConnection: "",
    });
    setEditPrologue(null);
    setPrologueSheetOpen(true);
  };

  const savePrologue = async () => {
    if (!prologueForm.bookName) {
      toast({ title: "Book name is required", variant: "destructive" });
      return;
    }

    // Count completed fields before saving
    const completedFields = PROLOGUE_CONTENT_FIELDS.filter((f) => {
      const val = prologueForm[f];
      return val != null && String(val).trim().length > 0;
    }).length;
    const totalFields = PROLOGUE_CONTENT_FIELDS.length;

    setPrologueSaving(true);
    try {
      const res = await sendPostRequest("book-prologues", "admin/upsert", prologueForm);
      if (res.returnCode === 200) {
        toast({
          title: `Prologue for ${prologueForm.bookName} saved — ${completedFields}/${totalFields} fields complete`,
        });
        setPrologueSheetOpen(false);
        loadPrologues();
      } else {
        toast({
          title: "Failed to save",
          description: res.returnMessage,
          variant: "destructive",
        });
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setPrologueSaving(false);
    }
  };

  const deletePrologue = async (bookName: string) => {
    if (!confirm(`Delete prologue for ${bookName}?`)) return;
    try {
      const res = await sendPostRequest("book-prologues", "admin/delete", { bookName });
      if (res.returnCode === 200) {
        toast({ title: "Prologue deleted" });
        loadPrologues();
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  // ── Book groupings for browse view ──
  const OLD_TESTAMENT = [
    "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy",
    "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel",
    "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra",
    "Nehemiah", "Esther", "Job", "Psalms", "Proverbs",
    "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah", "Lamentations",
    "Ezekiel", "Daniel", "Hosea", "Joel", "Amos",
    "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk",
    "Zephaniah", "Haggai", "Zechariah", "Malachi",
  ];
  const NEW_TESTAMENT = [
    "Matthew", "Mark", "Luke", "John", "Acts",
    "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians",
    "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians",
    "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews",
    "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John", "Jude", "Revelation",
  ];

  // Build a map: bookName → prologue (or undefined)
  const prologueByBook = useMemo(() => {
    const map = new Map<string, any>();
    for (const p of prologues) {
      map.set(p.bookName, p);
    }
    return map;
  }, [prologues]);

  // Fields that count toward prologue completeness (excluding bookName)
  const PROLOGUE_CONTENT_FIELDS = ["author", "audience", "dateWritten", "purpose", "keyTheme", "summary", "christConnection"] as const;

  const countPrologueFields = (prologue: any): number => {
    return PROLOGUE_CONTENT_FIELDS.filter((f) => {
      const val = prologue[f];
      return val != null && String(val).trim().length > 0;
    }).length;
  };

  const formatDate = (dateStr: string | null | undefined): string => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "";
      return d.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  const renderBookGrid = (books: string[], covenantLabel: string, covenantColor: string, filter: "all" | "missing") => {
    const hasPrologue = books.filter((b) => prologueByBook.has(b));
    const visibleBooks = filter === "missing" ? books.filter((b) => !prologueByBook.has(b)) : books;

    if (filter === "missing" && visibleBooks.length === 0) return null;

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={`text-[10px] font-bold px-2 py-0.5 ${covenantColor}`}
          >
            {covenantLabel}
          </Badge>
          {filter === "missing" ? (
            <span className="text-[10px] text-muted-foreground tabular-nums">
              {visibleBooks.length} need{visibleBooks.length !== 1 ? "s" : ""} prologue
            </span>
          ) : (
            <span className="text-[10px] text-muted-foreground tabular-nums">
              {hasPrologue.length}/{books.length} complete
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {visibleBooks.map((book) => {
            const prologue = prologueByBook.get(book);
            const hasIt = !!prologue;
            const filledCount = hasIt ? countPrologueFields(prologue) : 0;
            const totalFields = PROLOGUE_CONTENT_FIELDS.length;
            return (
              <button
                key={book}
                onClick={() => {
                  if (hasIt) {
                    openEditPrologue(prologue);
                  } else {
                    setPrologueForm((p) => ({ ...p, bookName: book }));
                    setEditPrologue(null);
                    setPrologueSheetOpen(true);
                  }
                }}
                className={`w-full text-left rounded-lg border p-2.5 transition-all active:scale-[0.98] ${
                  hasIt
                    ? "border-emerald-200/60 dark:border-emerald-800/40 bg-emerald-50/50 dark:bg-emerald-950/20 hover:border-emerald-300 dark:hover:border-emerald-700"
                    : "border-border/60 bg-card hover:border-primary/30 hover:bg-muted/20"
                }`}
              >
                <div className="flex items-start justify-between gap-1">
                  <span
                    className={`text-xs font-bold leading-tight ${
                      hasIt ? "text-emerald-700 dark:text-emerald-300" : "text-foreground"
                    }`}
                  >
                    {book}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    {hasIt && (
                      <span
                        className={`text-[8px] font-bold tabular-nums ${
                          filledCount === totalFields
                            ? "text-emerald-500"
                            : filledCount >= 4
                              ? "text-amber-500"
                              : "text-muted-foreground/50"
                        }`}
                      >
                        {filledCount}/{totalFields}
                      </span>
                    )}
                    <Badge
                      variant={hasIt ? "default" : "outline"}
                      className={`shrink-0 text-[8px] px-1 py-0 ${
                        hasIt
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-300/30"
                          : "text-muted-foreground/50"
                      }`}
                    >
                      {hasIt ? "✓" : "+"}
                    </Badge>
                  </div>
                </div>
                {hasIt && (
                  <div className="mt-1 space-y-0.5">
                    {prologue.author && (
                      <p className="text-[9px] text-emerald-600/70 dark:text-emerald-400/70 truncate">
                        by {prologue.author}
                      </p>
                    )}
                    {prologue.keyTheme && (
                      <p className="text-[9px] text-muted-foreground/60 line-clamp-1 leading-tight">
                        {prologue.keyTheme}
                      </p>
                    )}
                    {prologue.updatedOn && (
                      <p className="text-[8px] text-muted-foreground/40 leading-tight mt-0.5">
                        Updated {formatDate(prologue.updatedOn)}
                      </p>
                    )}
                  </div>
                )}
                {!hasIt && (
                  <p className="text-[8px] text-muted-foreground/40 mt-1">
                    Needs prologue
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // =============== RENDER STUDIES TAB (verse_word_studies) ===============

  const [studies, setStudies] = useState<any[]>([]);
  const [studiesLoading, setStudiesLoading] = useState(false);
  const [studiesSearch, setStudiesSearch] = useState("");
  const [studiesPage, setStudiesPage] = useState(0);
  const [studiesTotal, setStudiesTotal] = useState(0);
  const [studiesHasNext, setStudiesHasNext] = useState(false);
  const STUDIES_PAGE_SIZE = 25;

  const loadStudies = useCallback(async (page = 0, search = "") => {
    setStudiesLoading(true);
    try {
      const res = await sendPostRequest("strongs", "admin/list-all-verse-word-studies", {
        page,
        pageSize: STUDIES_PAGE_SIZE,
        search: search || undefined,
      });
      if (res.returnCode === 200 && res.returnData) {
        const rd = res.returnData as any;
        setStudies(rd.data || []);
        setStudiesTotal(rd.total || 0);
        setStudiesPage(page);
        setStudiesHasNext(!!rd.hasNext);
      }
    } catch (e) {
      console.error("Failed to load studies:", e);
    } finally {
      setStudiesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "studies") loadStudies(0, studiesSearch);
  }, [activeTab, studiesSearch, loadStudies]);

  const renderStudiesTab = () => (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by Strong's ID, book, or note content..."
            value={studiesSearch}
            onChange={(e) => setStudiesSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
        {studiesSearch && (
          <Button variant="ghost" size="sm" onClick={() => setStudiesSearch("")} className="h-9 text-xs">
            <X className="w-3.5 h-3.5 mr-1" />
            Clear
          </Button>
        )}
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            confirmSyncActionRef.current = async () => {
              setSyncingAllRefs(true);
              try {
                const res = await sendPostRequest("strongs", "admin/sync-all-verse-references", {});
                if (res.returnCode === 200) {
                  const rd = res.returnData as any;
                  toast({
                    title: "All verse references synced",
                    description: `${rd.syncedCount} entries updated with ${rd.totalReferences} references`,
                  });
                  loadStudies(0, studiesSearch);
                } else {
                  toast({ title: "Sync failed", description: res.returnMessage, variant: "destructive" });
                }
              } catch (e: any) {
                toast({ title: "Error", description: e.message, variant: "destructive" });
              } finally {
                setSyncingAllRefs(false);
              }
            };
            setConfirmSyncLabel("Sync all verse references?");
            setConfirmSyncDesc("This will scan all verse word studies and update the verseReferences field on every Strong's Dictionary entry. This operation is safe to run at any time.");
            setConfirmSyncOpen(true);
          }}
        disabled={syncingAllRefs}
        className="h-9 gap-1 text-xs shrink-0"
      >
        {syncingAllRefs ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Sparkles className="w-3.5 h-3.5" />
        )}
        {syncingAllRefs ? "Syncing..." : "Sync References"}
      </Button>
    </div>

    {/* Loading state */}
      {studiesLoading ? (
        <div className="space-y-3 py-4">
          <Skeleton className="h-5 w-48" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="rounded-lg border border-border/50 bg-card p-3">
              <Skeleton className="h-4 w-1/3 mb-2" />
              <Skeleton className="h-3 w-2/3 mb-1" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : studies.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <BookOpen className="w-12 h-12 text-muted-foreground/30 mb-3" />
          <p className="text-sm font-semibold text-muted-foreground">
            {studiesSearch ? "No studies match your search" : "No verse word studies yet"}
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1 max-w-sm">
            {studiesSearch
              ? "Try a different search term."
              : "Word studies are created when you edit a word entry with a verse selected and save it."}
          </p>
        </div>
      ) : (
        <>
          {/* Stats bar */}
          <div className="flex items-center gap-2 rounded-lg bg-muted/10 border border-border/30 p-2">
            <BookOpen className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-bold text-foreground">
              {studiesTotal} verse word stud{studiesTotal === 1 ? "y" : "ies"}
            </span>
            {studiesSearch && (
              <span className="text-[10px] text-muted-foreground ml-auto">
                Showing {studies.length} of {studiesTotal}
              </span>
            )}
          </div>

          {/* Study list */}
          <div className="space-y-2">
            {studies.map((s: any) => (
              <div
                key={s.id}
                className="rounded-lg border border-border/50 bg-card p-3 hover:border-primary/30 hover:bg-muted/10 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Header row */}
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <Badge variant="secondary" className="text-[10px] font-bold px-1.5">
                        {s.bookName} {s.chapter}:{s.verse}
                      </Badge>
                      <Badge variant="outline" className="text-[9px] font-mono">
                        {s.strongsId}
                      </Badge>
                      <Badge variant="outline" className="text-[9px] font-mono">
                        {s.translation}
                      </Badge>
                      {s.strongs?.language && (
                        <Badge variant="outline" className="text-[9px]">
                          {s.strongs.language}
                        </Badge>
                      )}
                    </div>

                    {/* Word info */}
                    <div className="flex items-center gap-2 text-xs">
                      {s.strongs?.originalWord && (
                        <span className="font-semibold text-foreground">{s.strongs.originalWord}</span>
                      )}
                      {s.strongs?.transliteration && (
                        <span className="italic text-muted-foreground">{s.strongs.transliteration}</span>
                      )}
                      {s.strongs?.shortDefinition && (
                        <span className="text-muted-foreground/70">— {s.strongs.shortDefinition}</span>
                      )}
                    </div>

                    {/* Admin explanation */}
                    {s.adminExplanation && (
                      <p className="text-xs text-foreground/70 mt-1.5 line-clamp-2 border-l-2 border-amber-300/40 pl-2">
                        {s.adminExplanation}
                      </p>
                    )}

                    {/* Surface text */}
                    {s.surfaceText && (
                      <p className="text-[10px] text-muted-foreground/50 mt-1">
                        Surface text: "{s.surfaceText}"
                      </p>
                    )}

                    {/* Date */}
                    <p className="text-[9px] text-muted-foreground/30 mt-1.5">
                      Created {new Date(s.createdOn).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {studiesHasNext && (
            <div className="flex items-center justify-center pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadStudies(studiesPage + 1, studiesSearch)}
                disabled={studiesLoading}
                className="gap-1.5 text-xs h-8"
              >
                {studiesLoading ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <BookOpen className="w-3 h-3" />
                )}
                {studiesLoading
                  ? "Loading..."
                  : `Load more (${studies.length} of ${studiesTotal})`}
              </Button>
            </div>
          )}

          {/* Back to top */}
          {studiesPage > 0 && (
            <div className="flex items-center justify-center pb-1">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-border/40 hover:border-border/80 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  <polyline points="18 15 12 9 6 15" />
                </svg>
                Back to top
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );

  const renderProloguesTab = () => (
    <div className="space-y-4">
      {/* View mode toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 rounded-lg border border-border/50 bg-muted/20 p-0.5">
          <button
            onClick={() => setPrologueViewMode("search")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              prologueViewMode === "search"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Search className="w-3 h-3 inline mr-1" />
            Search
          </button>
          <button
            onClick={() => setPrologueViewMode("browse")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              prologueViewMode === "browse"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <BookOpen className="w-3 h-3 inline mr-1" />
            Browse by Book
          </button>
        </div>

        {prologueViewMode === "search" && (
          <Button
            size="sm"
            onClick={openNewPrologue}
            className="h-8 gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Prologue
          </Button>
        )}
      </div>

      {prologuesLoading ? (
        <div className="space-y-4 py-4">
          {/* Search bar skeleton */}
          <Skeleton className="h-9 w-full rounded-lg" />
          {/* List item skeletons */}
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-lg border border-border/50 bg-card p-3"
            >
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
                <Skeleton className="h-2 w-24" />
              </div>
              <Skeleton className="w-7 h-7 rounded-md" />
              <Skeleton className="w-7 h-7 rounded-md" />
            </div>
          ))}
        </div>
      ) : prologueViewMode === "browse" ? (
        <div className="space-y-6">
          {/* Progress summary bar */}
          <div className="rounded-lg border border-border/50 bg-card p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-foreground">
                  Prologue Progress
                </span>
              </div>
              <span className="text-xs font-bold text-muted-foreground tabular-nums">
                {prologues.length} / {BIBLE_BOOKS.length} books complete
              </span>
            </div>
            {/* Progress bar */}
            <div className="mt-2 h-1.5 w-full rounded-full bg-muted/50 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-400/70 transition-all"
                style={{ width: `${(prologues.length / BIBLE_BOOKS.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Filter chips */}
          <div className="flex items-center gap-1 rounded-lg border border-border/50 bg-muted/20 p-0.5 w-fit">
            <button
              onClick={() => setPrologueFilter("all")}
              className={`px-2.5 py-1 text-[10px] font-medium rounded-md transition-all ${
                prologueFilter === "all"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All Books
            </button>
            <button
              onClick={() => setPrologueFilter("missing")}
              className={`px-2.5 py-1 text-[10px] font-medium rounded-md transition-all ${
                prologueFilter === "missing"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Plus className="w-2.5 h-2.5 inline mr-0.5" />
              Need Prologue
            </button>
          </div>

          {renderBookGrid(OLD_TESTAMENT, "Old Testament", "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800/40", prologueFilter)}
          {renderBookGrid(NEW_TESTAMENT, "New Testament", "bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-950/30 dark:text-sky-300 dark:border-sky-800/40", prologueFilter)}
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by book name, author, or theme..."
                value={prologueSearch}
                onChange={(e) => {
                  setPrologueSearch(e.target.value);
                }}
                className="pl-9 h-9 text-sm"
              />
            </div>
          </div>

          {prologues.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <BookOpen className="w-12 h-12 text-muted-foreground/30 mb-3" />
              <p className="text-sm font-semibold text-muted-foreground">
                No book prologues found
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Add prologues to provide context for each book of the Bible.
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {prologues.map((prologue) => (
                <div
                  key={prologue.bookName}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border/60 bg-card hover:border-primary/30 transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground">
                        {prologue.bookName}
                      </span>
                      {prologue.author && (
                        <span className="text-xs text-muted-foreground">
                          by {prologue.author}
                        </span>
                      )}
                    </div>
                    {prologue.keyTheme && (
                      <p className="text-xs text-foreground/70 line-clamp-1 mt-0.5">
                        {prologue.keyTheme}
                      </p>
                    )}
                    {prologue.updatedOn && (
                      <p className="text-[9px] text-muted-foreground/50 mt-0.5">
                        Updated {formatDate(prologue.updatedOn)}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-primary"
                      onClick={() => openEditPrologue(prologue)}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => deletePrologue(prologue.bookName)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!prologuesLoading && prologues.length > 0 && (
            <p className="text-xs text-muted-foreground text-center">
              {prologues.length} prologue{prologues.length !== 1 ? "s" : ""} loaded
            </p>
          )}
        </>
      )}
    </div>
  );

  // ============================================================
  // MAIN RENDER
  // ============================================================

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-full bg-muted/30 flex items-center justify-center hover:bg-muted/50 transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Study Tools Admin</h1>
            <p className="text-sm text-muted-foreground">
              Manage word studies, verse resources, and book prologues
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full max-w-lg">
            <TabsTrigger value="words" className="gap-1.5">
              <BookText className="w-3.5 h-3.5" />
              Words
            </TabsTrigger>
            <TabsTrigger value="resources" className="gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              Resources
            </TabsTrigger>
            <TabsTrigger value="studies" className="gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              Studies
            </TabsTrigger>
            <TabsTrigger value="prologues" className="gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              Prologues
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="words">{renderWordsTab()}</TabsContent>
            <TabsContent value="resources">{renderResourcesTab()}</TabsContent>
            <TabsContent value="studies">{renderStudiesTab()}</TabsContent>
            <TabsContent value="prologues">{renderProloguesTab()}</TabsContent>
          </div>
        </Tabs>
      </div>

      {/* ── Word Study CRUD Sheet ── */}
      <Sheet open={wsSheetOpen} onOpenChange={setWsSheetOpen}>
        <SheetContent side="right" className="sm:max-w-md overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle className="flex items-center gap-2">
              <BookText className="w-4 h-4 text-primary" />
              {wsEditIdx !== null ? "Edit Word Study" : "Add Word Study"}
            </SheetTitle>
            <SheetDescription>
              Add or edit a word study entry for{" "}
              <span className="font-semibold text-foreground/80">
                {verseBook} {verseChapter}:{verseNum}
              </span>
            </SheetDescription>
          </SheetHeader>

          {/* ── Verse context preview (only when a verse is selected) ── */}
          {verseNum > 0 && (
            <div className="rounded-lg border border-border/40 bg-primary/[0.03] dark:bg-primary/[0.02] p-3 mb-5">
              <div className="flex items-center gap-1.5 mb-1.5">
                <BookOpen className="w-3 h-3 text-primary/70" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Verse Context
                </span>
                <Badge variant="outline" className="text-[8px] font-mono px-1 py-0 ml-auto">
                  {verseTranslation}
                </Badge>
              </div>
              {versePreview ? (
                <p className="text-xs leading-relaxed text-foreground/75 italic border-l-2 border-primary/20 pl-2.5">
                  "{versePreview.slice(0, 300)}{versePreview.length > 300 ? "…" : ""}"
                </p>
              ) : (
                <p className="text-xs text-muted-foreground/50 italic border-l-2 border-border/30 pl-2.5">
                  Verse text not available for this translation.
                </p>
              )}
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[9px] text-muted-foreground/50 tabular-nums">
                  {verseBook} {verseChapter}:{verseNum}
                </span>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Word <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="e.g., love, agape"
                value={wsForm.word}
                onChange={(e) => setWsForm((p) => ({ ...p, word: e.target.value }))}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Transliteration
              </label>
              <Input
                placeholder="e.g., agapē"
                value={wsForm.transliteration}
                onChange={(e) => setWsForm((p) => ({ ...p, transliteration: e.target.value }))}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Meaning <span className="text-destructive">*</span>
              </label>
              <Textarea
                placeholder="What does this word mean in context?"
                value={wsForm.meaning}
                onChange={(e) => setWsForm((p) => ({ ...p, meaning: e.target.value }))}
                rows={3}
                className="text-sm resize-none"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-2 border-t border-border/50 mt-6">
            <Button variant="outline" size="sm" onClick={() => setWsSheetOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={() => {
              if (!wsForm.word.trim() || !wsForm.meaning.trim()) {
                toast({ title: "Word and meaning are required", variant: "destructive" });
                return;
              }
              if (wsEditIdx !== null) {
                setWordStudies((prev) => prev.map((item, i) => i === wsEditIdx ? wsForm : item));
              } else {
                setWordStudies((prev) => [...prev, wsForm]);
              }
              setWsSheetOpen(false);
            }} className="gap-1.5">
              <Save className="w-3.5 h-3.5" />
              {wsEditIdx !== null ? "Update Word" : "Add Word"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* ── Commentary CRUD Sheet ── */}
      <Sheet open={commSheetOpen} onOpenChange={setCommSheetOpen}>
        <SheetContent side="right" className="sm:max-w-md overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              {commEditIdx !== null ? "Edit Commentary" : "Add Commentary"}
            </SheetTitle>
            <SheetDescription>Add or edit a commentary entry for this verse.</SheetDescription>
          </SheetHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Author <span className="text-destructive">*</span></label>
              <Input placeholder="e.g., Matthew Henry" value={commForm.author} onChange={(e) => setCommForm((p) => ({ ...p, author: e.target.value }))} className="h-9 text-sm" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Title</label>
              <Input placeholder="e.g., Commentary on John" value={commForm.title} onChange={(e) => setCommForm((p) => ({ ...p, title: e.target.value }))} className="h-9 text-sm" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Text <span className="text-destructive">*</span></label>
              <Textarea placeholder="Commentary text..." value={commForm.text} onChange={(e) => setCommForm((p) => ({ ...p, text: e.target.value }))} rows={4} className="text-sm resize-none" />
            </div>
          </div>
          <div className="pt-4 flex items-center justify-end gap-2 border-t border-border/50 mt-6">
            <Button variant="outline" size="sm" onClick={() => setCommSheetOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={() => {
              if (!commForm.author.trim() || !commForm.text.trim()) { toast({ title: "Author and text are required", variant: "destructive" }); return; }
              if (commEditIdx !== null) setCommentaries((prev) => prev.map((item, i) => i === commEditIdx ? commForm : item));
              else setCommentaries((prev) => [...prev, commForm]);
              setCommSheetOpen(false);
            }} className="gap-1.5"><Save className="w-3.5 h-3.5" /> {commEditIdx !== null ? "Update" : "Add"}</Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* ── Cross-Reference CRUD Sheet ── */}
      <Sheet open={xrefSheetOpen} onOpenChange={setXrefSheetOpen}>
        <SheetContent side="right" className="sm:max-w-md overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              {xrefEditIdx !== null ? "Edit Cross Reference" : "Add Cross Reference"}
            </SheetTitle>
            <SheetDescription>Select the cross-reference verse and add an optional note.</SheetDescription>
          </SheetHeader>
          <div className="space-y-4">
            {/* Verse selector */}
            <div className="space-y-3 rounded-lg bg-muted/20 border border-border/30 p-3">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Reference Verse</p>
              <div className="flex flex-wrap items-end gap-2">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-muted-foreground">Book</label>
                  <Combobox
                    options={BIBLE_BOOKS.map((b) => ({ value: b, label: b }))}
                    value={xrefRefBook}
                    onChange={(v) => { if (v) setXrefRefBook(v); }}
                    placeholder="Select"
                    searchPlaceholder="Search books..."
                    width="w-32"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-muted-foreground">Chapter</label>
                  <Combobox
                    options={xrefRefChapList.map((c) => ({ value: String(c), label: `${c}` }))}
                    value={String(xrefRefChap)}
                    onChange={(v) => { if (v) setXrefRefChap(Number(v)); }}
                    placeholder="Ch."
                    searchPlaceholder="Find chapter..."
                    disabled={xrefRefChapList.length === 0}
                    width="w-16"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-muted-foreground">Verse</label>
                  <Combobox
                    options={xrefRefVerList.map((v) => ({ value: String(v), label: `${v}` }))}
                    value={String(xrefRefVer)}
                    onChange={(v) => { if (v) setXrefRefVer(Number(v)); }}
                    placeholder="V."
                    searchPlaceholder="Find verse..."
                    disabled={xrefRefVerList.length === 0}
                    width="w-16"
                  />
                </div>
              </div>

              {/* Reference preview */}
              {xrefForm.ref && (
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant="outline"
                    className="text-[10px] font-bold bg-primary/5 border-primary/20 text-primary"
                  >
                    {xrefForm.ref}
                  </Badge>
                  {xrefRefPreview && (
                    <span className="text-[10px] text-muted-foreground/60 italic truncate">
                      — "{xrefRefPreview.slice(0, 60)}..."
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Text note */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Note <span className="text-muted-foreground/50">(optional)</span>
              </label>
              <Textarea
                placeholder="Brief excerpt or note about this reference..."
                value={xrefForm.text}
                onChange={(e) => setXrefForm((p) => ({ ...p, text: e.target.value }))}
                rows={2}
                className="text-sm resize-none"
              />
            </div>
          </div>
          <div className="pt-4 flex items-center justify-end gap-2 border-t border-border/50 mt-6">
            <Button variant="outline" size="sm" onClick={() => setXrefSheetOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={() => {
              if (!xrefForm.ref.trim()) { toast({ title: "Reference is required", variant: "destructive" }); return; }
              if (xrefEditIdx !== null) setCrossRefs((prev) => prev.map((item, i) => i === xrefEditIdx ? xrefForm : item));
              else setCrossRefs((prev) => [...prev, xrefForm]);
              setXrefSheetOpen(false);
            }} className="gap-1.5"><Save className="w-3.5 h-3.5" /> {xrefEditIdx !== null ? "Update" : "Add"}</Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* ── Dictionary Term CRUD Sheet ── */}
      <Sheet open={dictSheetOpen} onOpenChange={setDictSheetOpen}>
        <SheetContent side="right" className="sm:max-w-md overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="flex items-center gap-2">
              <BookText className="w-4 h-4 text-primary" />
              {dictEditIdx !== null ? "Edit Dictionary Term" : "Add Dictionary Term"}
            </SheetTitle>
            <SheetDescription>Add or edit a dictionary term for this verse.</SheetDescription>
          </SheetHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Term <span className="text-destructive">*</span></label>
              <Input placeholder="e.g., Logos" value={dictForm.term} onChange={(e) => setDictForm((p) => ({ ...p, term: e.target.value }))} className="h-9 text-sm" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Pronunciation</label>
              <Input placeholder="e.g., loh-gos" value={dictForm.pronunciation} onChange={(e) => setDictForm((p) => ({ ...p, pronunciation: e.target.value }))} className="h-9 text-sm" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Definition <span className="text-destructive">*</span></label>
              <Textarea placeholder="Simple definition..." value={dictForm.definition} onChange={(e) => setDictForm((p) => ({ ...p, definition: e.target.value }))} rows={2} className="text-sm resize-none" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Description</label>
              <Textarea placeholder="More detailed description..." value={dictForm.description} onChange={(e) => setDictForm((p) => ({ ...p, description: e.target.value }))} rows={2} className="text-sm resize-none" />
            </div>
          </div>
          <div className="pt-4 flex items-center justify-end gap-2 border-t border-border/50 mt-6">
            <Button variant="outline" size="sm" onClick={() => setDictSheetOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={() => {
              if (!dictForm.term.trim() || !dictForm.definition.trim()) { toast({ title: "Term and definition are required", variant: "destructive" }); return; }
              if (dictEditIdx !== null) setDictTerms((prev) => prev.map((item, i) => i === dictEditIdx ? dictForm : item));
              else setDictTerms((prev) => [...prev, dictForm]);
              setDictSheetOpen(false);
            }} className="gap-1.5"><Save className="w-3.5 h-3.5" /> {dictEditIdx !== null ? "Update" : "Add"}</Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* ── Topic CRUD Sheet ── */}
      <Sheet open={topicSheetOpen} onOpenChange={setTopicSheetOpen}>
        <SheetContent side="right" className="sm:max-w-sm overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-primary" />
              {topicEditIdx !== null ? "Edit Topic" : "Add Topic"}
            </SheetTitle>
            <SheetDescription>Add or edit a related topic for this verse.</SheetDescription>
          </SheetHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Topic Name <span className="text-destructive">*</span></label>
              <Input placeholder="e.g., Love, Grace, Faith" value={topicForm.name} onChange={(e) => setTopicForm((p) => ({ ...p, name: e.target.value }))} className="h-9 text-sm" />
            </div>
          </div>
          <div className="pt-4 flex items-center justify-end gap-2 border-t border-border/50 mt-6">
            <Button variant="outline" size="sm" onClick={() => setTopicSheetOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={() => {
              if (!topicForm.name.trim()) { toast({ title: "Topic name is required", variant: "destructive" }); return; }
              if (topicEditIdx !== null) setTopics((prev) => prev.map((item, i) => i === topicEditIdx ? topicForm : item));
              else setTopics((prev) => [...prev, topicForm]);
              setTopicSheetOpen(false);
            }} className="gap-1.5"><Save className="w-3.5 h-3.5" /> {topicEditIdx !== null ? "Update" : "Add"}</Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* ── Edit Word Sheet ── */}
      <Sheet open={editSheetOpen} onOpenChange={setEditSheetOpen}>
        <SheetContent side="right" className="sm:max-w-lg overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="flex items-center gap-2">
              <BookText className="w-4 h-4 text-primary" />
              {editWord ? `Edit: ${editWord.shortDefinition || editWord.originalWord || editWord.strongsId}` : "Add New Word"}
            </SheetTitle>
            <SheetDescription>
              {editWord?.strongsId && (
                <span className="text-xs text-muted-foreground">
                  Strong's ID is fixed. Update the user-facing fields below.
                </span>
              )}
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-4">
            {/* ── Verse Selector ── */}
            <div className="rounded-lg border border-border/40 bg-muted/10 p-3 space-y-3">
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-primary" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Verse Context
                </span>
                {(editVerseBook && editVerseChapter > 0 && editVerseNum > 0) && (
                  <Badge variant="outline" className="text-[9px] font-mono ml-auto">
                    {editVerseBook} {editVerseChapter}:{editVerseNum}
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap items-end gap-2">
                {/* Book */}
                <div className="flex-1 min-w-[120px]">
                  <label className="text-[9px] font-bold text-muted-foreground/70 uppercase tracking-wider">Book</label>
                  <Combobox
                    options={BIBLE_BOOKS.map((b) => ({ value: b, label: b }))}
                    value={editVerseBook}
                    onChange={(v) => { if (v) setEditVerseBook(v); }}
                    placeholder="Select book"
                    searchPlaceholder="Search books..."
                    width="w-full"
                  />
                </div>
                {/* Chapter */}
                <div className="flex-1 min-w-[80px]">
                  <label className="text-[9px] font-bold text-muted-foreground/70 uppercase tracking-wider">Chapter</label>
                  <Combobox
                    options={editChapList.map((c) => ({ value: String(c), label: `Ch. ${c}` }))}
                    value={String(editVerseChapter)}
                    onChange={(v) => { if (v) setEditVerseChapter(Number(v)); }}
                    placeholder="Ch."
                    searchPlaceholder="Find..."
                    disabled={editChapList.length === 0}
                    width="w-full"
                  />
                </div>
                {/* Verse */}
                <div className="flex-1 min-w-[80px]">
                  <label className="text-[9px] font-bold text-muted-foreground/70 uppercase tracking-wider">Verse</label>
                  <Combobox
                    options={editVerList.map((v) => ({ value: String(v), label: `V. ${v}` }))}
                    value={String(editVerseNum)}
                    onChange={(v) => { if (v) setEditVerseNum(Number(v)); }}
                    placeholder="V."
                    searchPlaceholder="Find..."
                    disabled={editVerList.length === 0}
                    width="w-full"
                  />
                </div>
                {/* Translation */}
                <div className="flex-1 min-w-[120px]">
                  <label className="text-[9px] font-bold text-muted-foreground/70 uppercase tracking-wider">Translation</label>
                  <Combobox
                    options={translations}
                    value={editVerseTranslation}
                    onChange={(v) => { if (v) { setEditVerseTranslation(v); lastEditTranslationRef.current = v; } }}
                    placeholder="Select"
                    searchPlaceholder="Search..."
                    width="w-full"
                  />
                </div>
              </div>
              {/* Verse preview */}
              {editVersePreview && (
                <div className="rounded-md bg-muted/20 border border-border/30 px-2.5 py-1.5 mt-1">
                  <p className="text-[11px] leading-relaxed text-foreground/70 italic">
                    "{editVersePreview.slice(0, 120)}{editVersePreview.length > 120 ? "..." : ""}"
                  </p>
                </div>
              )}
            </div>

            {/* ── Separator ── */}
            <div className="border-t border-border/30" />

            {/* Original Word */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Original Word <span className="text-muted-foreground/50">(Greek/Hebrew)</span>
              </label>
              <Input
                placeholder="e.g., λόγος"
                value={wordForm.originalWord}
                onChange={(e) => setWordForm((p) => ({ ...p, originalWord: e.target.value }))}
                className="h-9 text-sm"
              />
            </div>

            {/* Transliteration */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Transliteration <span className="text-muted-foreground/50">(how it sounds)</span>
              </label>
              <Input
                placeholder="e.g., logos"
                value={wordForm.transliteration}
                onChange={(e) => setWordForm((p) => ({ ...p, transliteration: e.target.value }))}
                className="h-9 text-sm"
              />
            </div>

            {/* Language */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Language
              </label>
              <Select
                value={wordForm.language}
                onValueChange={(v) => setWordForm((p) => ({ ...p, language: v }))}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Short Definition (plain English explanation) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Plain-English Explanation <span className="text-destructive">*</span>
              </label>
              <Textarea
                placeholder="What does this word mean in simple terms?"
                value={wordForm.shortDefinition}
                onChange={(e) => setWordForm((p) => ({ ...p, shortDefinition: e.target.value }))}
                rows={2}
                className="text-sm resize-none"
              />
            </div>

            {/* Full Definition */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                More Detail <span className="text-muted-foreground/50">(optional)</span>
              </label>
              <Textarea
                placeholder="Additional context and detail about this word..."
                value={wordForm.fullDefinition}
                onChange={(e) => setWordForm((p) => ({ ...p, fullDefinition: e.target.value }))}
                rows={3}
                className="text-sm resize-none"
              />
            </div>

            {/* Part of Speech */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Part of Speech <span className="text-muted-foreground/50">(optional)</span>
              </label>
              <Input
                placeholder="e.g., noun, verb, adjective"
                value={wordForm.partOfSpeech}
                onChange={(e) => setWordForm((p) => ({ ...p, partOfSpeech: e.target.value }))}
                className="h-9 text-sm"
              />
            </div>

            {/* Admin Explanation */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Study Note <span className="text-muted-foreground/50">(internal note)</span>
              </label>
              <Textarea
                placeholder="Add a study note or admin explanation..."
                value={wordForm.adminExplanation}
                onChange={(e) => setWordForm((p) => ({ ...p, adminExplanation: e.target.value }))}
                rows={2}
                className="text-sm resize-none"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-2 border-t border-border/50 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditSheetOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={saveWord} disabled={saving} className="gap-1.5">
              {saving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              {saving ? "Saving..." : "Save Word"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* ── Word Detail Side Panel (Sheet) ── */}
      <WordDetailSheet
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
        wordEntry={detailWord}
        verseRef={`${verseBook} ${verseChapter}:${verseNum}`}
        verseText={wordVerseText || undefined}
        translationBadge={verseTranslation}
        translations={translations}
        onEdit={() => {
          setDetailSheetOpen(false);
          setTimeout(() => detailWord && openEditWord(detailWord), 200);
        }}
      />

      {/* ── Edit/Add Prologue Sheet ── */}
      <Sheet open={prologueSheetOpen} onOpenChange={setPrologueSheetOpen}>
        <SheetContent side="right" className="sm:max-w-lg overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              {editPrologue ? `Edit: ${editPrologue.bookName}` : "Add Book Prologue"}
            </SheetTitle>
            <SheetDescription>
              Provide context and background for a book of the Bible.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-4">
            {/* Book Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Book Name <span className="text-destructive">*</span>
              </label>
              <Combobox
                options={BIBLE_BOOKS.map((b) => ({ value: b, label: b }))}
                value={prologueForm.bookName}
                onChange={(v) => { if (v) setPrologueForm((p) => ({ ...p, bookName: v })); }}
                placeholder="Select a book"
                searchPlaceholder="Search books..."
                width="w-full"
              />
            </div>

            {/* Author */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Author
              </label>
              <Input
                placeholder="Who wrote this book?"
                value={prologueForm.author}
                onChange={(e) => setPrologueForm((p) => ({ ...p, author: e.target.value }))}
                className="h-9 text-sm"
              />
            </div>

            {/* Audience */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Audience
              </label>
              <Input
                placeholder="Who was it written to?"
                value={prologueForm.audience}
                onChange={(e) => setPrologueForm((p) => ({ ...p, audience: e.target.value }))}
                className="h-9 text-sm"
              />
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Date Written
              </label>
              <Input
                placeholder="e.g., Approx. AD 85-95"
                value={prologueForm.dateWritten}
                onChange={(e) => setPrologueForm((p) => ({ ...p, dateWritten: e.target.value }))}
                className="h-9 text-sm"
              />
            </div>

            {/* Purpose */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Purpose
              </label>
              <Textarea
                placeholder="Why was this book written?"
                value={prologueForm.purpose}
                onChange={(e) => setPrologueForm((p) => ({ ...p, purpose: e.target.value }))}
                rows={2}
                className="text-sm resize-none"
              />
            </div>

            {/* Key Theme */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Key Theme
              </label>
              <Input
                placeholder="e.g., Jesus, the Son of God"
                value={prologueForm.keyTheme}
                onChange={(e) => setPrologueForm((p) => ({ ...p, keyTheme: e.target.value }))}
                className="h-9 text-sm"
              />
            </div>

            {/* Summary */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Summary
              </label>
              <Textarea
                placeholder="Brief summary of the book..."
                value={prologueForm.summary}
                onChange={(e) => setPrologueForm((p) => ({ ...p, summary: e.target.value }))}
                rows={3}
                className="text-sm resize-none"
              />
            </div>

            {/* Christ Connection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Connection to Christ
              </label>
              <Textarea
                placeholder="How does this book point to Jesus?"
                value={prologueForm.christConnection}
                onChange={(e) => setPrologueForm((p) => ({ ...p, christConnection: e.target.value }))}
                rows={2}
                className="text-sm resize-none"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-2 border-t border-border/50 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPrologueSheetOpen(false)}
              disabled={prologueSaving}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={savePrologue} disabled={prologueSaving} className="gap-1.5">
              {prologueSaving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              {prologueSaving ? "Saving..." : "Save Prologue"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>


      {/* ── Sync confirmation dialog ── */}
      <AlertDialog open={confirmSyncOpen} onOpenChange={setConfirmSyncOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmSyncLabel}</AlertDialogTitle>
            <AlertDialogDescription>{confirmSyncDesc}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                setConfirmSyncOpen(false);
                const action = confirmSyncActionRef.current;
                confirmSyncActionRef.current = null;
                if (action) {
                  await action();
                }
              }}
              className="gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Yes, Sync
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
}
