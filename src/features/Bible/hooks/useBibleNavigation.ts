// Bible useBibleNavigation — useBibleNavigation state and API logic
import { useState, useEffect, useCallback } from "react";
import { sendPostRequest } from "@/services/api";

export interface BibleBook {
  id: string;
  name: string;
  testament: string;
  chapters: number;
}
export interface BibleChapter {
  bookId: string;
  chapter: number;
  verses: BibleVerse[];
export interface BibleVerse {
  verse: number;
  text: string;
  highlighted?: boolean;
  note?: string;
export function useBibleNavigation() {
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [chapterData, setChapterData] = useState<BibleChapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [chapterLoading, setChapterLoading] = useState(false);
  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await sendPostRequest("bible", "get-translations", {});
      if (res.returnCode === 200) {
        setBooks(res.returnData || []);
      }
    } catch (e) {
      console.error("Failed to fetch Bible books", e);
    } finally {
      setLoading(false);
    }
  }, []);
  const fetchChapter = useCallback(async (bookId: string, chapter: number) => {
    setChapterLoading(true);
      const res = await sendPostRequest("bible", "get-chapter", { bookId, chapter });
        setChapterData(res.returnData);
      console.error("Failed to fetch chapter", e);
      setChapterLoading(false);
  useEffect(() => { fetchBooks(); }, [fetchBooks]);
  useEffect(() => {
    if (selectedBook) {
      fetchChapter(selectedBook.id, selectedChapter);
  }, [selectedBook, selectedChapter, fetchChapter]);
  const selectBook = useCallback((book: BibleBook) => {
    setSelectedBook(book);
    setSelectedChapter(1);
  const goToChapter = useCallback((chapter: number) => {
    if (selectedBook && chapter >= 1 && chapter <= selectedBook.chapters) {
      setSelectedChapter(chapter);
  }, [selectedBook]);
  return {
    books,
    selectedBook,
    selectedChapter,
    chapterData,
    loading,
    chapterLoading,
    selectBook,
    goToChapter,
  };
