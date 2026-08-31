// useBookPrologueDetail — fetch a single book prologue
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { sendPostRequest } from "@/services/api";

interface BookPrologueDetail {
  bookName: string;
  title: string;
  content: string;
  isPublished?: boolean;
  createdBy?: string;
  createdOn?: string;
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
