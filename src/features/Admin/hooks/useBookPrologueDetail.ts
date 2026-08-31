// useBookPrologueDetail — fetch a single book prologue with all fields
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { sendPostRequest } from "@/services/api";

export interface BookPrologueDetail {
  bookName: string;
  title?: string;
  sortOrder?: number;
  author?: string;
  authorDetail?: string;
  audience?: string;
  dateWritten?: string;
  locationWritten?: string;
  purpose?: string;
  keyTheme?: string;
  summary?: string;
  background?: string;
  lessons?: string;
  chapters?: number;
  structure?: Array<{ range: string; title: string }>;
  applications?: string[];
  keyScripture?: Array<{ reference: string; text: string }>;
  mainThemes?: string[];
  keyPeople?: string[];
  keyVerses?: string[];
  christConnection?: string;
  isPublished?: boolean;
  createdBy?: string;
  createdOn?: string;
  updatedBy?: string;
  updatedOn?: string;
}

export function useBookPrologueDetail() {
  const { bookName } = useParams<{ bookName: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [item, setItem] = useState<BookPrologueDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookName) return;
    setLoading(true);
    sendPostRequest("book-prologues", "get", {
      bookName: decodeURIComponent(bookName),
    })
      .then((res) => {
        if (res?.returnCode === 200 && res.returnData) {
          setItem(res.returnData);
        } else {
          toast({ title: "Not found", variant: "destructive" });
          navigate("/admin/book-prologues");
        }
      })
      .catch(() => {
        toast({ title: "Failed to load", variant: "destructive" });
        navigate("/admin/book-prologues");
      })
      .finally(() => setLoading(false));
  }, [bookName, toast, navigate]);

  return { item, loading, navigate };
}
