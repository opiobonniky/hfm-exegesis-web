import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../services/adminApi';
import { wordStudyApi } from '../services/studyToolsApi';
import { useAdminErrorHandler } from './useAdminErrorHandler';
import { getChaptersForBook, getVersesCountForChapter, getActiveVersionId } from '@/utilities/bibleUtils';
import type { WordEntry } from '../types';

type WordsPage = { data: WordEntry[]; hasNext: boolean };

/** Words-only admin state. Dictionary definitions and passage notes are saved
 * by StudyWordEditor; other content has its own dedicated admin pages. */
export function useStudyTools() {
  const navigate = useNavigate();
  const { actions: { handleError } } = useAdminErrorHandler();
  const [words, setWords] = useState<WordEntry[]>([]);
  const [wordsLoading, setWordsLoading] = useState(false);
  const [wordsLoadingMore, setWordsLoadingMore] = useState(false);
  const [wordsHasMore, setWordsHasMore] = useState(false);
  const [wordSearch, setWordSearch] = useState('');
  const [verseBook, setVerseBook] = useState('');
  const [verseChapter, setVerseChapter] = useState(0);
  const [verseNum, setVerseNum] = useState(0);
  const [verseText, setVerseText] = useState('');
  const [verseTextLoading, setVerseTextLoading] = useState(false);
  const [detailWord, setDetailWord] = useState<WordEntry | null>(null);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);
  const pageRef = useRef(0);
  const queryRef = useRef('');
  const requestRef = useRef(0);
  const loadingRef = useRef(false);
  const verseTextRef = useRef(0);
  const passageRef = useRef<{ book: string; chapter: number; verse?: number } | null>(null);
  const loadMorePassageRef = useRef<() => void>(() => {});

  const loadWordsPage = useCallback(async (query: string, page: number, append: boolean) => {
    if (append && loadingRef.current) return;
    const request = ++requestRef.current;
    loadingRef.current = true;
    setWordsLoadingMore(append); setWordsLoading(!append);
    if (!append) { passageRef.current = null; setWords([]); setWordsHasMore(false); queryRef.current = query; }
    try {
      const result = await wordStudyApi.search(query, undefined, page, 30);
      if (request !== requestRef.current) return;
      if (result.returnCode !== 200) throw new Error(result.returnMessage || 'Could not load words');
      const payload = result.returnData as WordsPage;
      setWords(previous => append ? [...previous, ...payload.data] : payload.data);
      setWordsHasMore(payload.hasNext); pageRef.current = page;
    } catch (error) { if (request === requestRef.current) handleError(error, 'load words'); }
    finally {
      if (request === requestRef.current) { loadingRef.current = false; setWordsLoading(false); setWordsLoadingMore(false); }
    }
  }, [handleError]);

  const searchWords = useCallback((query: string) => loadWordsPage(query.trim(), 0, false), [loadWordsPage]);
  const loadMoreWords = useCallback(() => {
    if (!wordsHasMore || loadingRef.current) return;
    if (passageRef.current) loadMorePassageRef.current();
    else void loadWordsPage(queryRef.current, pageRef.current + 1, true);
  }, [loadWordsPage, wordsHasMore]);

  const loadVerseWords = useCallback(async (book: string, chapter: number, verse?: number, page = 0) => {
    const append = page > 0;
    if (append && loadingRef.current) return;
    const request = ++requestRef.current;
    loadingRef.current = true;
    setWordsLoading(!append); setWordsLoadingMore(append);
    if (!append) { passageRef.current = { book, chapter, verse }; setWordsHasMore(false); setWords([]); }
    try {
      const result = await adminApi.request<{ data: WordEntry[]; hasNext: boolean }>('strongs', 'admin/get-verse-unique-words', {
        bookName: book, chapter, verse, translation: getActiveVersionId(), page, pageSize: 30,
      });
      if (request !== requestRef.current) return;
      if (result.returnCode !== 200) throw new Error(result.returnMessage || 'Could not load verse words');
      const rows = result.returnData?.data || [];
      setWords(previous => append ? [...previous, ...rows] : rows);
      setWordsHasMore(Boolean(result.returnData?.hasNext)); pageRef.current = page;
    } catch (error) { if (request === requestRef.current) handleError(error, 'load verse words'); }
    finally { if (request === requestRef.current) { loadingRef.current = false; setWordsLoading(false); setWordsLoadingMore(false); } }
  }, [handleError]);
  loadMorePassageRef.current = () => {
    const passage = passageRef.current;
    if (passage) void loadVerseWords(passage.book, passage.chapter, passage.verse, pageRef.current + 1);
  };

  const loadVerseText = useCallback(async (book: string, chapter: number, verse: number) => {
    const request = ++verseTextRef.current;
    setVerseText('');
    if (!book || !chapter || !verse) { setVerseTextLoading(false); return; }
    setVerseTextLoading(true);
    try {
      const result = await adminApi.getVerse(getActiveVersionId(), book, chapter, verse);
      if (request === verseTextRef.current) setVerseText(result.text || '');
    } catch { /* The word list remains usable when Scripture text is unavailable. */ }
    finally { if (request === verseTextRef.current) setVerseTextLoading(false); }
  }, []);

  const handleBookChange = useCallback((book: string) => {
    ++requestRef.current;
    ++verseTextRef.current;
    loadingRef.current = false; passageRef.current = null;
    setWordsLoading(false); setWordsLoadingMore(false);
    setVerseBook(book); setVerseChapter(0); setVerseNum(0); setVerseText('');
  }, []);
  const handleChapterChange = useCallback((chapter: number) => {
    ++requestRef.current;
    ++verseTextRef.current;
    loadingRef.current = false; passageRef.current = null;
    setWordsLoading(false); setWordsLoadingMore(false);
    setVerseChapter(chapter); setVerseNum(0); setVerseText('');
  }, []);

  return {
    data: {
      words, wordsLoading, wordsLoadingMore, wordsHasMore, wordSearch,
      verseBook, verseChapter, verseNum, verseText, verseTextLoading,
      verseChapList: verseBook ? getChaptersForBook(verseBook) : [],
      verseNumList: verseBook && verseChapter ? Array.from({ length: getVersesCountForChapter(verseBook, verseChapter) }, (_, index) => index + 1) : [],
      detailWord, detailSheetOpen,
    },
    actions: { navigate, setWordSearch, searchWords, loadMoreWords, loadVerseWords, loadVerseText,
      handleBookChange, handleChapterChange, setVerseNum, setDetailWord, setDetailSheetOpen },
  };
}
