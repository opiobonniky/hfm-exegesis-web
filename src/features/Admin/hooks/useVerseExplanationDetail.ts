// useVerseExplanationDetail — fetch a single verse explanation
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { sendPostRequest } from "@/services/api";

interface VerseExplanationDetail {
  id: number;
  bookName: string;
  chapter: number;
  verseNumber: number;
  explanation: string;
  learnMore?: string;
  isPublished?: boolean;
  createdOn?: string;
  updatedOn?: string;
}

export function useVerseExplanationDetail() {
  const { bookName, chapter, verseNumber } = useParams<{
    bookName: string;
    chapter: string;
    verseNumber: string;
  }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [item, setItem] = useState<VerseExplanationDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookName || !chapter || !verseNumber) return;
    setLoading(true);
    sendPostRequest("bible", "get-verse-explanation", {
      bookName: decodeURIComponent(bookName),
      chapter: Number(chapter),
      verseNumber: Number(verseNumber),
    })
      .then((res) => {
        if (res?.returnCode === 200 && res.returnData) {
          setItem(res.returnData);
        } else {
          toast({ title: "Not found", variant: "destructive" });
          navigate("/admin/verse-explanations");
        }
      })
      .catch(() => {
        toast({ title: "Failed to load", variant: "destructive" });
        navigate("/admin/verse-explanations");
      })
      .finally(() => setLoading(false));
  }, [bookName, chapter, verseNumber, toast, navigate]);

  return { item, loading, navigate };
}
