// useBookOverview — fetches prologue data and reading position for a book
import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getBookPrologue } from "@/services/bookProloguesApi";
import type { BookPrologue } from "@/services/bookProloguesApi";
import { sendPostRequest } from "@/services/api";

const OT_COUNT = 39;
const ORDINALS = [
  "First","Second","Third","Fourth","Fifth","Sixth","Seventh","Eighth",
  "Ninth","Tenth","Eleventh","Twelfth","Thirteenth","Fourteenth","Fifteenth",
  "Sixteenth","Seventeenth","Eighteenth","Nineteenth","Twentieth","Twenty-First",
  "Twenty-Second","Twenty-Third","Twenty-Fourth","Twenty-Fifth","Twenty-Sixth",
  "Twenty-Seventh","Twenty-Eighth","Twenty-Ninth","Thirtieth","Thirty-First",
  "Thirty-Second","Thirty-Third","Thirty-Fourth","Thirty-Fifth","Thirty-Sixth",
  "Thirty-Seventh","Thirty-Eighth","Thirty-Ninth","Fortieth","Forty-First",
  "Forty-Second","Forty-Third","Forty-Fourth","Forty-Fifth","Forty-Seventh",
  "Forty-Eighth","Forty-Ninth","Fiftieth","Fifty-First","Fifty-Second",
  "Fifty-Third","Fifty-Fourth","Fifty-Fifth","Fifty-Sixth","Fifty-Seventh",
  "Fifty-Eighth","Fifty-Ninth","Sixtieth","Sixty-First","Sixty-Second",
];
/** Get ordinal designation — "The First Book of the Bible" etc */
export const getBookDesignation = (
  bookName: string,
  template?: string,
): string | null => {
  const allBooks = getOTBooks().concat(getNTBooks());
  const index = allBooks.findIndex(
    (b) => b.toLowerCase() === bookName.toLowerCase(),
  );
  if (index < 0 || index >= ORDINALS.length) return null;
  const ordinal = ORDINALS[index];
  return (template || "The {ordinal} Book of the Bible").replace(
    "{ordinal}",
    ordinal,
};
export const getBookTestament = (bookName: string): "Old" | "New" => {
  return index >= 0 && index < OT_COUNT ? "Old" : "New";
// Bible book lists
function getOTBooks(): string[] {
  return [
    "Genesis","Exodus","Leviticus","Numbers","Deuteronomy","Joshua","Judges",
    "Ruth","1 Samuel","2 Samuel","1 Kings","2 Kings","1 Chronicles","2 Chronicles",
    "Ezra","Nehemiah","Esther","Job","Psalms","Proverbs","Ecclesiastes",
    "Song of Solomon","Isaiah","Jeremiah","Lamentations","Ezekiel","Daniel",
    "Hosea","Joel","Amos","Obadiah","Jonah","Micah","Nahum","Habakkuk",
    "Zephaniah","Haggai","Zechariah","Malachi",
  ];
}
function getNTBooks(): string[] {
    "Matthew","Mark","Luke","John","Acts","Romans","1 Corinthians","2 Corinthians",
    "Galatians","Ephesians","Philippians","Colossians","1 Thessalonians",
    "2 Thessalonians","1 Timothy","2 Timothy","Titus","Philemon","Hebrews",
    "James","1 Peter","2 Peter","1 John","2 John","3 John","Jude","Revelation",
export function useBookOverview() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookName = searchParams.get("book") || "Genesis";
  const [prologue, setPrologue] = useState<BookPrologue | null>(null);
  const [loading, setLoading] = useState(true);
  const [resumeChapter, setResumeChapter] = useState<number | null>(null);
  const [resumeVerse, setResumeVerse] = useState<number | null>(null);
  // Fetch prologue
  useEffect(() => {
    let ignore = false;
    setLoading(true);
    (async () => {
      try {
        const p = await getBookPrologue(bookName);
        if (!ignore) setPrologue(p);
      } catch {
        if (!ignore) setPrologue(null);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [bookName]);
  // Load saved reader position
        const res = await sendPostRequest<{ chapter?: number; verseNumber?: number }>(
          "bible",
          "get-last-read-position",
          { bookName },
        );
        if (res.returnCode === 200 && res.returnData) {
          const pos = res.returnData;
          if (!ignore && pos.chapter) setResumeChapter(pos.chapter);
          if (!ignore && pos.verseNumber) setResumeVerse(pos.verseNumber);
        }
        // ignore
  const isOt = getBookTestament(bookName) === "Old";
  const testamentLabel = isOt ? "Old Testament" : "New Testament";
  const designation = getBookDesignation(bookName);
  const onStartReading = useCallback(() => {
    const params = new URLSearchParams({
      book: bookName,
      chapter: String(resumeChapter ?? 1),
    });
    if (resumeVerse) params.set("verse", String(resumeVerse));
    navigate(`/bible-reader?${params.toString()}`);
  }, [bookName, resumeChapter, resumeVerse, navigate]);
  const onBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);
  return {
    bookName,
    prologue,
    loading,
    resumeChapter,
    resumeVerse,
    isOt,
    designation,
    testamentLabel,
    onStartReading,
    onBack,
  };
