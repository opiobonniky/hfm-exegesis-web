// Admin useStudyTools — useStudyTools state and API logic
import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "../services/adminApi";
import { useAdminErrorHandler } from "./useAdminErrorHandler";
import {
  getChaptersForBook,
  getVersesCountForChapter,
  getVerseText,
} from "@/utilities/bibleUtils";
import { BIBLE_BOOKS } from "@/data/staticData";
import type { StrongsWordEntry } from "@/data/staticData";
import { verseResourcesApi } from "../services/studyToolsApi";
import { wordStudyApi } from "../services/studyToolsApi";
import { getActiveVersionId } from "@/utilities/bibleUtils";

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
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("words");
  const [words, setWords] = useState<WordEntry[]>([]);
  const [wordsLoading, setWordsLoading] = useState(false);
  const [wordsLoadingMore, setWordsLoadingMore] = useState(false);
  const [wordsHasMore, setWordsHasMore] = useState(true);
  const wordsPageRef = useRef(0);
  const [wordSearch, setWordSearch] = useState("");
  const [editWord, setEditWord] = useState<WordEntry | null>(null);
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [verseBook, setVerseBook] = useState("");
  const [verseChapter, setVerseChapter] = useState(0);
  const [verseNum, setVerseNum] = useState(0);
  const [verseChapList, setVerseChapList] = useState<number[]>([]);
  const [verseNumList, setVerseNumList] = useState<number[]>([]);
  const [verseText, setVerseText] = useState("");
  const [verseTextLoading, setVerseTextLoading] = useState(false);
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
  const { actions: { handleError } } = useAdminErrorHandler();

  useEffect(() => {
    if (!verseBook || !verseChapter || !verseNum) {
      setVerseText("");
      return;
    }

    let active = true;
    setVerseTextLoading(true);
    adminApi.getVerse(getActiveVersionId(), verseBook, verseChapter, verseNum)
      .then((verse) => {
        if (active) setVerseText(verse.text || "");
      })
      .catch(() => {
        if (active) setVerseText("");
      })
      .finally(() => {
        if (active) setVerseTextLoading(false);
      });

    return () => {
      active = false;
    };
  }, [verseBook, verseChapter, verseNum]);

  const loadWordsPage = useCallback(async (query: string, page: number, append: boolean) => {
    append ? setWordsLoadingMore(true) : setWordsLoading(true);
    try {
      const res = await wordStudyApi.search(query, undefined, page, 30);
      if (res.returnCode === 200) {
        const pageData = res.returnData?.data || res.returnData?.content || res.returnData?.words || [];
        setWords((previous) => append ? [...previous, ...pageData] : pageData);
        setWordsHasMore(res.returnData?.hasNext ?? pageData.length === 30);
        wordsPageRef.current = page;
      }
    } catch (e) { handleError(e, "load words"); }
    finally {
      setWordsLoading(false);
      setWordsLoadingMore(false);
    }
  }, [handleError]);

  const searchWords = useCallback(async (query: string) => {
    await loadWordsPage(query.trim(), 0, false);
  }, [loadWordsPage]);

  const loadMoreWords = useCallback(async () => {
    if (wordsLoading || wordsLoadingMore || !wordsHasMore) return;
    await loadWordsPage(wordSearch.trim(), wordsPageRef.current + 1, true);
  }, [loadWordsPage, wordSearch, wordsHasMore, wordsLoading, wordsLoadingMore]);

  const loadVerseWords = useCallback(async (book: string, chapter: number, verse?: number) => {
    setWordsLoading(true);
    setWordsHasMore(false);
    wordsPageRef.current = 0;
    try {
      const res = await adminApi.request("strongs", "admin/get-verse-words", {
        bookName: book,
        chapter,
        verse,
        translation: getActiveVersionId(),
      });
      if (res.returnCode === 200) {
        const verseWords = res.returnData?.words || res.returnData?.content || res.returnData || [];
        const resource = verse ? await verseResourcesApi.getByReference(book, chapter, verse) : null;
        const resourceWords = resource?.returnData?.wordStudies || [];
        const attachedWords = resourceWords.map((study: any) => ({
          strongsId: study.strongs || study.strongsId,
          originalWord: study.word || null,
          transliteration: study.transliteration || null,
          shortDefinition: study.meaning || "Verse-specific word study",
          fullDefinition: study.meaning || null,
          language: study.strongs?.startsWith("H") ? "hebrew" : "greek",
          partOfSpeech: null,
          grammaticalCase: null,
          gender: null,
          number: null,
          usageCount: null,
          crossReferences: null,
          adminExplanation: study.meaning || null,
          hasVerseStudy: true,
          verseStudyNote: study.meaning || null,
        }));
        const merged = [...verseWords, ...attachedWords].filter((word, index, all) =>
          word.strongsId && all.findIndex((candidate) => candidate.strongsId === word.strongsId) === index
        );
        setWords(merged);
      }
    } catch (e) {
      handleError(e, "load verse words");
    } finally {
      setWordsLoading(false);
    }
  }, [handleError]);

  const loadResource = useCallback(async (book: string, chapter: number, verse: number) => {
    setResourcesLoading(true);
    setCurrentResource(null);
    setWordStudies([]);
    setCommentaries([]);
    setCrossRefs([]);
    setDictTerms([]);
    setTopics([]);
    try {
      const res = await verseResourcesApi.getByReference(book, chapter, verse);
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

  const saveResource = useCallback(async () => {
    if (!verseBook || !verseChapter || !verseNum) return false;
    setResourceSaving(true);
    try {
      const res = await verseResourcesApi.upsert({
        id: currentResource?.id || undefined,
        bookName: verseBook,
        chapter: verseChapter,
        verseStart: verseNum,
        verseEnd: verseNum,
        wordStudies,
        commentaries,
        crossReferences: crossRefs,
        dictionaryTerms: dictTerms,
        relatedTopics: topics,
        interlinearWords: currentResource?.interlinearWords || [],
      });
      if (res.returnCode === 200) {
        await loadResource(verseBook, verseChapter, verseNum);
        return true;
      }
      return false;
    } catch (e) {
      handleError(e, "save verse resource");
      return false;
    } finally {
      setResourceSaving(false);
    }
  }, [
    commentaries, crossRefs, currentResource?.id, currentResource?.interlinearWords,
    dictTerms, handleError, loadResource, topics, verseBook, verseChapter,
    verseNum, wordStudies,
  ]);

  const loadPrologues = useCallback(async () => {
    setProloguesLoading(true);
    try {
      const res = await adminApi.request("book-prologues", "admin/get-all", { page: 0, size: 50, search: prologueSearch });
      if (res.returnCode === 200) setPrologues(res.returnData?.content || []);
    } catch (e) { handleError(e, "load prologues"); }
    finally { setProloguesLoading(false); }
  }, [prologueSearch, handleError]);

  const loadStudies = useCallback(async (page = 0, search = "") => {
    setStudiesLoading(true);
    try {
      const res = await adminApi.request("admin", "get-all-daily-exegesis", { page, size: 20, search });
      if (res.returnCode === 200) setStudies(res.returnData?.content || []);
    } catch (e) { handleError(e, "load studies"); }
    finally { setStudiesLoading(false); }
  }, [handleError]);

  const deletePrologue = useCallback(async (id: number) => {
    try {
      const res = await adminApi.request("book-prologues", "admin/delete", { id });
      if (res.returnCode === 200) {
        await loadPrologues();
        return true;
      }
    } catch (e) { handleError(e, "delete prologue"); }
    return false;
  }, [handleError, loadPrologues]);

  const savePrologue = useCallback(async (data: unknown, id?: number) => {
    try {
      const res = await adminApi.request("book-prologues", "admin/upsert", { ...(data as object), ...(id ? { id } : {}) });
      if (res.returnCode === 200) {
        await loadPrologues();
        return true;
      }
    } catch (e) { handleError(e, "save prologue"); }
    return false;
  }, [handleError, loadPrologues]);

  const deleteStudy = useCallback(async (id: number) => {
    try {
      const res = await adminApi.request("admin", "delete-daily-exegesis", { id });
      if (res.returnCode === 200) {
        await loadStudies(0, studiesSearch);
        return true;
      }
    } catch (e) { handleError(e, "delete study"); }
    return false;
  }, [handleError, loadStudies, studiesSearch]);

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

  return { data: {
    // Words
    words, setWords, wordsLoading, wordSearch, setWordSearch, editWord, setEditWord,
    editSheetOpen, setEditSheetOpen, saving, setSaving, searchWords, detailWord, setDetailWord,
    detailSheetOpen, setDetailSheetOpen, loadVerseWords, loadMoreWords,
    wordsLoadingMore, wordsHasMore,
    // Verse selector
    verseBook, handleBookChange, verseChapter, handleChapterChange, verseNum, setVerseNum,
    verseChapList, verseNumList, verseText, verseTextLoading,
    // Resources
    currentResource, setCurrentResource, resourcesLoading, loadResource,
    resourceSaving, setResourceSaving,
    saveResource,
    // CRUD arrays
    wordStudies, setWordStudies, commentaries, setCommentaries,
    crossRefs, setCrossRefs, dictTerms, setDictTerms, topics, setTopics,
    // Prologues
    prologues, prologuesLoading, prologueSearch, setPrologueSearch,
    prologueViewMode, setPrologueViewMode, selectedPrologueBook, setSelectedPrologueBook,
    editPrologue, setEditPrologue, prologueSheetOpen, setPrologueSheetOpen, loadPrologues, deletePrologue, savePrologue,
    // Studies
    studies, studiesLoading, studiesSearch, setStudiesSearch, loadStudies,
    // Sync
    confirmSyncOpen, setConfirmSyncOpen, confirmSyncLabel, setConfirmSyncLabel,
    confirmSyncDesc, setConfirmSyncDesc, syncingAllRefs, setSyncingAllRefs,
    confirmSyncActionRef,
    // Tab
    activeTab, setActiveTab,
  }, actions: {
    setWords, setWordSearch, setEditWord, setEditSheetOpen, setSaving, searchWords,
    setDetailWord, setDetailSheetOpen, loadVerseWords, loadMoreWords, handleBookChange,
    handleChapterChange, setVerseNum, setCurrentResource, loadResource, setResourceSaving,
    saveResource, setWordStudies, setCommentaries, setCrossRefs, setDictTerms, setTopics,
    setPrologueSearch, setPrologueViewMode, setSelectedPrologueBook, setEditPrologue,
    setPrologueSheetOpen, loadPrologues, deletePrologue, savePrologue, setStudiesSearch, loadStudies, deleteStudy, setConfirmSyncOpen,
    setConfirmSyncLabel, setConfirmSyncDesc, setSyncingAllRefs, setActiveTab, navigate,
  } };
}
