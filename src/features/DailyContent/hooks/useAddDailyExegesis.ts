// useAddDailyExegesis — all state + API logic for AddDailyExegesis page
import { useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/components/languages/languageProvider";
import { sendPostRequest } from "@/services/api";
import { routes } from "@/components/Routes/routes";

export function useAddDailyExegesis() {
  const { t, isRtl } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const editingExegesis = location.state?.exegesis as Record<string, any> | undefined;
  const isEditing = !!editingExegesis;

  // Required fields
  const [title, setTitle] = useState(editingExegesis?.title || "");
  const [passageReference, setPassageReference] = useState(editingExegesis?.passageReference || "");
  const [teachingBody, setTeachingBody] = useState(editingExegesis?.teachingBody || "");

  // Optional fields
  const [introduction, setIntroduction] = useState(editingExegesis?.introduction || "");
  const [contextSummary, setContextSummary] = useState(editingExegesis?.contextSummary || "");
  const [application, setApplication] = useState(editingExegesis?.application || "");
  const [prayer, setPrayer] = useState(editingExegesis?.prayer || "");
  const [tags, setTags] = useState(editingExegesis?.tags || "");

  // Date/publish
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const d = editingExegesis?.displayDate ? new Date(editingExegesis.displayDate) : new Date();
    d.setHours(8, 0, 0, 0);
    return d;
  });
  const [selectedTime, setSelectedTime] = useState(() => {
    if (editingExegesis?.displayDate) {
      const d = new Date(editingExegesis.displayDate);
      return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    }
    return "08:00";
  });
  const [published, setPublished] = useState(editingExegesis?.isPublished ?? true);

  // Sync time
  const handleTimeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const time = e.target.value;
      setSelectedTime(time);
      if (!time) return;
      const [h, m] = time.split(":").map(Number);
      if (isNaN(h) || isNaN(m)) return;
      const nd = new Date(selectedDate);
      nd.setHours(h, m, 0, 0);
      setSelectedDate(nd);
    },
    [selectedDate],
  );

  const saveDisabled = !title.trim() || !passageReference.trim() || !teachingBody.trim();

  const handleSave = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (saveDisabled) {
      toast({ title: "Missing fields", description: "Title, passage reference, and teaching body are required", variant: "destructive" });
      return;
    }
    const payload: Record<string, any> = {
      title,
      passageReference,
      teachingBody,
      introduction: introduction || null,
      contextSummary: contextSummary || null,
      application: application || null,
      prayer: prayer || null,
      tags: tags || null,
      displayDate: format(selectedDate, "yyyy-MM-dd"),
      displayTime: selectedDate.toISOString(),
      isPublished: published,
      ...(isEditing ? { id: editingExegesis?.id } : {}),
    };
    try {
      const res = await sendPostRequest("admin", "add-daily-exegesis", payload);
      if (res.returnCode === 200) {
        toast({ title: isEditing ? "Updated" : "Created", description: `Exegesis ${isEditing ? "updated" : "created"} successfully` });
        navigate(routes.dailyExegesis.path);
      } else {
        toast({ title: "Error", description: res.returnMessage || "Failed to save", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to save exegesis", variant: "destructive" });
    }
  }, [
    title, passageReference, teachingBody, introduction, contextSummary,
    application, prayer, tags, selectedDate, published,
    isEditing, editingExegesis, toast, t, navigate, saveDisabled,
  ]);

  return {
    // Required
    title, setTitle,
    passageReference, setPassageReference,
    teachingBody, setTeachingBody,
    // Optional
    introduction, setIntroduction,
    contextSummary, setContextSummary,
    application, setApplication,
    prayer, setPrayer,
    tags, setTags,
    // Date/publish
    selectedDate, setSelectedDate,
    selectedTime, handleTimeChange,
    published, setPublished,
    // Derived
    saveDisabled, isEditing,
    // Actions
    handleSave,
    // Helpers
    t, isRtl, navigate,
  };
}
