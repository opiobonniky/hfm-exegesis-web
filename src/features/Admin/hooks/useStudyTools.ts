// Admin useStudyTools — useStudyTools state and API logic
import { useState, useCallback, useRef } from "react";
import { sendPostRequest } from "@/services/api";
import { bibleApi } from "@/services/bibleApi";
import { useAdminErrorHandler } from "./useAdminErrorHandler";
import {
  getChaptersForBook,
  getVersesCountForChapter,
  getVerseText,
} from "@/utilities/bibleUtils";
import { BIBLE_BOOKS } from "@/data/staticData";
import type { StrongsWordEntry } from "@/data/staticData";

// ── Types ──
export type WordEntry = StrongsWordEntry;

export interface WordStudyItem {
  word: string;
  transliteration: string;
  meaning: string;
}

export interface CommentaryItem {
  author: string;
  title: string;
  text: string;
}

export interface CrossReferenceItem {
  ref: string;
  text: string;
}

export interface DictionaryTermItem {
  term: string;
  pronunciation: string;
  definition: string;
  description: string;
}

export interface TopicItem {
  name: string;
}

export interface VerseResource {
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

export function useStudyTools() {
  const [words, setWords] = useState<WordEntry[]>([]);
  const [wordsLoading, setWordsLoading] = useState(false);
  const [wordSearch, setWordSearch] = useState("");
  const [editWord, setEditWord] = useState<WordEntry | null>(null);
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [verseBook, setVerseBook] = useState("");
  const [verseChapter, setVerseChapter] = useState(0);
  const [verseNum, setVerseNum] = useState(0);
  const [verseChapList, setVerseChapList] = useState<number[]>([]);
  const [verseNumList, setVerseNumList] = useState<number[]>([]);
  const [currentResource, setCurrentResource] = useState<VerseResource | null>(null);
  const [resourcesLoading, setResourcesLoading] = useState(false);
  const [resourceSaving, setResourceSaving] = useState(false);
  const [wordStudies, setWordStudies] = useState<WordStudyItem[]>([]);
  const [commentaries, setCommentaries] = useState<CommentaryItem[]>([]);
  const [crossRefs, setCrossRefs] = useState<CrossReferenceItem[]>([]);
  const [dictTerms, setDictTerms] = useState<DictionaryTermItem[]>([]);
  const [topics, setTopics] = useState<TopicItem[]>([]);
  const [detailWord, setDetailWord] = useState<WordEntry | null>(null);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);
  const [prologues, setPrologues] = useState<any[]>([]);
  const [prologuesLoading, setProloguesLoading] = useState(false);
  const [prologueSearch, setPrologueSearch] = useState("");
  const [prologueViewMode, setPrologueViewMode] = useState<"search" | "browse">("search");
  const [selectedPrologueBook, setSelectedPrologueBook] = useState("");
  const [editPrologue, setEditPrologue] = useState<any>(null);
  const [prologueSheetOpen, setPrologueSheetOpen] = useState(false);
  const [studies, setStudies] = useState<any[]>([]);
  const [studiesLoading, setStudiesLoading] = useState(false);
  const [studiesSearch, setStudiesSearch] = useState("");
  const [confirmSyncOpen, setConfirmSyncOpen] = useState(false);
  const [confirmSyncLabel, setConfirmSyncLabel] = useState("");
  const [confirmSyncDesc, setConfirmSyncDesc] = useState("");
  const [syncingAllRefs, setSyncingAllRefs] = useState(false);
  const confirmSyncActionRef = useRef<(() => Promise<void>) | null>(null);
  const { handleError } = useAdminErrorHandler();

  const searchWords = useCallback(async (query: string) => {
    if (!query.trim()) return;
    setWordsLoading(true);
    try {
      const res = await sendPostRequest("strongs", "admin/search-words", { query, page: 0, size: 50 });
      if (res.returnCode === 200) setWords(res.returnData?.words || []);
    } catch (e) { handleError(e, "load words"); }
    finally { setWordsLoading(false); }
  }, [handleError]);

  const loadResource = useCallback(async (book: string, chapter: number, verse: number) => {
    setResourcesLoading(true);
    try {
      const res = await sendPostRequest("strongs", "admin/get-verse-resource", { bookName: book, chapter, verseStart: verse });
      if (res.returnCode === 200 && res.returnData) {
        const r = res.returnData;
        setCurrentResource(r);
        setWordStudies(r.wordStudies || []);
        setCommentaries(r.commentaries || []);
        setCrossRefs(r.crossReferences || []);
        setDictTerms(r.dictionaryTerms || []);
        setTopics(r.relatedTopics || []);
      }
    } catch (e) { handleError(e, "load verse resource"); }
    finally { setResourcesLoading(false); }
  }, [handleError]);

  const loadPrologues = useCallback(async () => {
    setProloguesLoading(true);
    try {
      const res = await sendPostRequest("book-prologues", "admin/get-all", { page: 0, size: 50, search: prologueSearch });
      if (res.returnCode === 200) setPrologues(res.returnData?.content || []);
    } catch (e) { handleError(e, "load prologues"); }
    finally { setProloguesLoading(false); }
  }, [prologueSearch, handleError]);

  const loadStudies = useCallback(async (page = 0, search = "") => {
    setStudiesLoading(true);
    try {
      const res = await sendPostRequest("admin", "get-all-daily-exegesis", { page, size: 20, search });
      if (res.returnCode === 200) setStudies(res.returnData?.content || []);
    } catch (e) { handleError(e, "load studies"); }
    finally { setStudiesLoading(false); }
  }, [handleError]);

  const handleBookChange = useCallback((book: string) => {
    setVerseBook(book);
    setVerseChapter(0);
    setVerseNum(0);
    if (book) setVerseChapList(getChaptersForBook(book));
    else setVerseChapList([]);
    setVerseNumList([]);
  }, []);

  const handleChapterChange = useCallback((chap: number) => {
    setVerseChapter(chap);
    if (verseBook && chap) {
      const max = getVersesCountForChapter(verseBook, chap);
      setVerseNumList(max > 0 ? Array.from({ length: max }, (_, i) => i + 1) : []);
    } else setVerseNumList([]);
  }, [verseBook]);

  return {
    // Words
    words, setWords, wordsLoading, wordSearch, setWordSearch, editWord, setEditWord,
    editSheetOpen, setEditSheetOpen, saving, setSaving, searchWords, detailWord, setDetailWord,
    detailSheetOpen, setDetailSheetOpen,
    // Verse selector
    verseBook, handleBookChange, verseChapter, handleChapterChange, verseNum, setVerseNum,
    verseChapList, verseNumList,
    // Resources
    currentResource, setCurrentResource, resourcesLoading, loadResource,
    resourceSaving, setResourceSaving,
    // CRUD arrays
    wordStudies, setWordStudies, commentaries, setCommentaries,
    crossRefs, setCrossRefs, dictTerms, setDictTerms, topics, setTopics,
    // Prologues
    prologues, prologuesLoading, prologueSearch, setPrologueSearch,
    prologueViewMode, setPrologueViewMode, selectedPrologueBook, setSelectedPrologueBook,
    editPrologue, setEditPrologue, prologueSheetOpen, setPrologueSheetOpen, loadPrologues,
    // Studies
    studies, studiesLoading, studiesSearch, setStudiesSearch, loadStudies,
    // Sync
    confirmSyncOpen, setConfirmSyncOpen, confirmSyncLabel, setConfirmSyncLabel,
    confirmSyncDesc, setConfirmSyncDesc, syncingAllRefs, setSyncingAllRefs,
    confirmSyncActionRef,
  };
}
