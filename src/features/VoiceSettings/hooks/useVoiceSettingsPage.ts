import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { sendPostRequest } from "@/services/api";
import { routes } from "@/components/Routes/routes";

export interface VoiceSettingsData {
  edgeEnabled: boolean;
  edgeVoiceId: string;
  deviceVoiceId: string;
  rate: number;
  pitch: number;
}
export const EDGE_VOICES = [
  { id: "en-US-JennyNeural", name: "Jenny", gender: "Female", accent: "US" },
  { id: "en-US-GuyNeural", name: "Guy", gender: "Male", accent: "US" },
  { id: "en-US-AriaNeural", name: "Aria", gender: "Female", accent: "US" },
  { id: "en-US-DavisNeural", name: "Davis", gender: "Male", accent: "US" },
  { id: "en-GB-SoniaNeural", name: "Sonia", gender: "Female", accent: "British" },
  { id: "en-GB-RyanNeural", name: "Ryan", gender: "Male", accent: "British" },
  { id: "en-AU-NatashaNeural", name: "Natasha", gender: "Female", accent: "Australian" },
  { id: "en-IE-EmilyNeural", name: "Emily", gender: "Female", accent: "Irish" },
];
export const RATE_SNAPS = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];
export const PITCH_SNAPS = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];
const PREVIEW_TEXT = "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.";
export function useVoiceSettingsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [settings, setSettings] = useState<VoiceSettingsData>({
    edgeEnabled: false, edgeVoiceId: "en-US-JennyNeural", deviceVoiceId: "", rate: 1.0, pitch: 1.0,
  });
  const fetchSettings = useCallback(async () => {
    try {
      const res = await sendPostRequest("user", "get-voice-settings", {});
      if (res.data?.returnCode === 200 && res.data.returnData) setSettings(res.data.returnData);
    } catch { /* use defaults */ } finally { setLoading(false); }
  }, []);
  useEffect(() => { fetchSettings(); }, [fetchSettings]);
  const handlePreview = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const synth = window.speechSynthesis;
    synthRef.current = synth;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(PREVIEW_TEXT);
    utterance.rate = settings.rate;
    utterance.pitch = settings.pitch;
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    synth.speak(utterance);
  }, [settings.rate, settings.pitch]);
  const stopPreview = useCallback(() => { synthRef.current?.cancel(); setIsPlaying(false); }, []);
  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const res = await sendPostRequest("user", "update-voice-settings", settings);
      if (res.data?.returnCode === 200) {
        toast({ title: "Saved", description: "Voice settings updated" });
        navigate(routes.settings.path);
      } else { throw new Error(res.data?.returnMessage || "Failed"); }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to save", variant: "destructive" });
    } finally { setSaving(false); }
  }, [settings, navigate, toast]);
  const updateSetting = <K extends keyof VoiceSettingsData>(key: K, value: VoiceSettingsData[K]) =>
    setSettings((s) => ({ ...s, [key]: value }));
  return { loading, saving, isPlaying, settings, updateSetting, handlePreview, stopPreview, handleSave, navigate };
}
