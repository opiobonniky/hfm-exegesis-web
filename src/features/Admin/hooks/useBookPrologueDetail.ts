// useBookPrologueDetail — fetch a single book prologue with all fields
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { adminApi } from "../services/adminApi";
import { BookPrologueDetailData } from "../types";


export function useBookPrologueDetail() {
  const { bookName } = useParams<{ bookName: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [item, setItem] = useState<BookPrologueDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookName) return;
    setLoading(true);
    adminApi.request("book-prologues", "get", {
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

  const data: BookPrologueDetailData = {
    loading,
    ...(item ?? { bookName: "" }),
  };

  return { data, actions: { navigate } };
}
