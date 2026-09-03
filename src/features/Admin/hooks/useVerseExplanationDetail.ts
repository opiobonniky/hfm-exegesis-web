// useVerseExplanationDetail — fetch a single verse explanation with all children
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { sendPostRequest } from "@/services/api";

export interface VerseExplanationDetail {
  id: number;
  bookName: string;
  chapter: number;
  verseNumber: number;
  bibleVersion: string;
  isPublished?: boolean;
  createdOn?: string;
  updatedOn?: string;
  exegesis: { explanationText: string; applicationText: string } | null;
  studyMetadata: {
    introduction: string;
    backgroundAuthor: string;
    backgroundBook: string;
    backgroundContext: string;
    finalThoughts: string;
  } | null;
  wordStudies: { strongsId: string; surfaceText: string; customDefinition: string; sortOrder: number }[];
  practicalApps: { applicationText: string; sortOrder: number }[];
  crossReferences: { bookName: string; chapter: number; verseNumber: number; referenceText: string; commentary: string; sortOrder: number }[];
  themes: { themeName: string; sortOrder: number }[];
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

  const deleteItem = useCallback(async () => {
    if (!item) return false;
    try {
      const res = await sendPostRequest("bible", "delete-verse-explanation", { id: item.id });
      if (res?.returnCode === 200 || res?.status === 200) {
        toast({ title: "Deleted" });
        navigate("/admin/verse-explanations");
        return true;
      }
      throw new Error(res?.returnMessage || "Failed to delete");
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
      return false;
    }
  }, [item, toast, navigate]);

  return { item, loading, navigate, deleteItem };
}
