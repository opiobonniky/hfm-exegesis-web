import { Sun, Moon, Type, Globe } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/components/languages/languageProvider";
import { LANGUAGE_NAMES, type Language } from "@/components/languages/type";
import { tt } from '@/components/languages/hardcodedTranslate';

interface PreferencesTabProps {
  fontSize: number;
  onFontSizeChange: (v: number) => void;
  translation: string;
  onTranslationChange: (v: string) => void;
}

export function PreferencesTab({ fontSize, onFontSizeChange, translation, onTranslationChange }: PreferencesTabProps) {
  const { themeMode, setThemeMode } = useTheme();
  const { lang: currentLang, setLanguage } = useLanguage();
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-card border border-border/50 p-4 sm:p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Globe className="w-5 h-5 text-sky-600" />
          <div>
            <h3 className="font-semibold">{tt("Language & Theme")}</h3>
            <p className="text-xs text-muted-foreground">{tt("Customize your experience")}</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>{tt("Theme")}</Label>
            <div className="flex items-center gap-2">
              <button onClick={() => setThemeMode("light")} className={`p-2 rounded-lg ${themeMode === "light" ? "bg-primary text-primary-foreground" : "bg-muted"}`}><Sun className="w-4 h-4" /></button>
              <button onClick={() => setThemeMode("dark")} className={`p-2 rounded-lg ${themeMode === "dark" ? "bg-primary text-primary-foreground" : "bg-muted"}`}><Moon className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>{tt("Language")}</Label>
            <Select value={currentLang} onValueChange={(v) => setLanguage(v as Language)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(LANGUAGE_NAMES).map(([code, name]) => <SelectItem key={code} value={code}>{name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <div className="rounded-2xl bg-card border border-border/50 p-4 sm:p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Type className="w-5 h-5 text-emerald-600" />
          <div>
            <h3 className="font-semibold">{tt("Reading Preferences")}</h3>
            <p className="text-xs text-muted-foreground">{tt("Adjust font size and translation")}</p>
          </div>
        </div>
        <Label>{tt("Font Size:")}{fontSize}px</Label>
        <Slider value={[fontSize]} onValueChange={(v) => onFontSizeChange(v[0])} min={12} max={28} step={1} />
        <Label>{tt("Preferred Translation")}</Label>
        <Select value={translation} onValueChange={onTranslationChange}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {["BSB", "KJV", "ESV", "NIV", "NKJV", "NASB", "NLT", "CSB", "WEB"].map((id) => <SelectItem key={id} value={id}>{id}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
