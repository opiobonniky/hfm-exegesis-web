import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/useTheme";
import { routes } from "@/components/Routes/routes";

export type FontSize = "small" | "medium" | "large";
export const FONT_SIZES: { value: FontSize; label: string; px: string }[] = [
  { value: "small", label: "Small", px: "14px" },
  { value: "medium", label: "Medium", px: "16px" },
  { value: "large", label: "Large", px: "18px" },
];
export function useReadingSettingsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { themeMode, setThemeMode } = useTheme();
  const [saving, setSaving] = useState(false);
  const [fontSize, setFontSize] = useState<FontSize>("medium");
  const [showVerseNumbers, setShowVerseNumbers] = useState(true);
  const [autoPlayVerse, setAutoPlayVerse] = useState(false);
  const fontSizePx = FONT_SIZES.find((f) => f.value === fontSize)?.px || "16px";
  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      localStorage.setItem("reading_font_size", fontSizePx);
      localStorage.setItem("reading_show_verse_numbers", String(showVerseNumbers));
      localStorage.setItem("reading_auto_play", String(autoPlayVerse));
      toast({ title: "Saved", description: "Reading settings updated" });
      navigate(routes.settings.path);
    } catch {
      toast({ title: "Error", variant: "destructive" });
    } finally { setSaving(false); }
  }, [fontSizePx, showVerseNumbers, autoPlayVerse, navigate, toast]);
  const goBack = useCallback(() => navigate(-1), [navigate]);
  return { goBack, saving, fontSize, setFontSize, showVerseNumbers, setShowVerseNumbers, autoPlayVerse, setAutoPlayVerse, fontSizePx, handleSave, theme: themeMode, setTheme: setThemeMode };
}
