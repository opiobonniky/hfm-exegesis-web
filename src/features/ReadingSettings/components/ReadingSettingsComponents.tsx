import { ArrowLeft, Save, Loader2, Type, Sun, Moon, Monitor, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { FontSize } from "../hooks/useReadingSettingsPage";
import { tt } from '@/components/languages/hardcodedTranslate';

interface ReadingSettingsHeaderProps {
  saving: boolean;
  onBack: () => void;
  onSave: () => void;
}

export function ReadingSettingsHeader({ saving, onBack, onSave }: ReadingSettingsHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1>{tt("Reading Settings")}</h1>
          <p>{tt("Customize your reading experience")}</p>
        </div>
      </div>
      <Button onClick={onSave} disabled={saving}>
        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}{tt("Save")}</Button>
    </div>
  );
}

interface FontSizeSectionProps {
  fontSize: FontSize;
  fontSizePx: string;
  onSetFontSize: (size: FontSize) => void;
}

export function FontSizeSection({ fontSize, fontSizePx, onSetFontSize }: FontSizeSectionProps) {
  const FONT_SIZES: { value: FontSize; label: string; px: string }[] = [
    { value: "small", label: "Small", px: "14px" },
    { value: "medium", label: "Medium", px: "16px" },
    { value: "large", label: "Large", px: "18px" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Type className="h-5 w-5 text-primary" />{tt("Font Size")}</CardTitle>
        <CardDescription>{tt("Adjust the text size for reading")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {FONT_SIZES.map((fs) => (
            <button
              key={fs.value}
              onClick={() => onSetFontSize(fs.value)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all",
                fontSize === fs.value ? "border-primary bg-primary/5" : "hover:border-primary/50"
              )}
            >
              <span className="font-medium">{fs.label}</span>
              <span className="text-xs text-muted-foreground">{fs.px}</span>
            </button>
          ))}
        </div>
        <div className="rounded-lg bg-muted/50 p-4">
          <p style={{ fontSize: fontSizePx }}>{tt("For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life. — John 3:16")}</p>
        </div>
      </CardContent>
    </Card>
  );
}

interface DisplayOptionsSectionProps {
  showVerseNumbers: boolean;
  autoPlayVerse: boolean;
  onToggleVerseNumbers: (checked: boolean) => void;
  onToggleAutoPlay: (checked: boolean) => void;
}

export function DisplayOptionsSection({
  showVerseNumbers,
  autoPlayVerse,
  onToggleVerseNumbers,
  onToggleAutoPlay,
}: DisplayOptionsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />{tt("Display Options")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{tt("Show Verse Numbers")}</p>
            <p className="text-sm text-muted-foreground">{tt("Display verse numbers alongside text")}</p>
          </div>
          <Switch checked={showVerseNumbers} onCheckedChange={onToggleVerseNumbers} />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{tt("Auto-play Audio")}</p>
            <p className="text-sm text-muted-foreground">{tt("Automatically play audio when opening a chapter")}</p>
          </div>
          <Switch checked={autoPlayVerse} onCheckedChange={onToggleAutoPlay} />
        </div>
      </CardContent>
    </Card>
  );
}

interface ThemeSectionProps {
  theme: string;
  onSetTheme: (theme: "light" | "dark" | "system") => void;
}

export function ThemeSection({ theme, onSetTheme }: ThemeSectionProps) {
  const themes = [
    { value: "light" as const, label: tt("Light"), icon: Sun },
    { value: "dark" as const, label: tt("Dark"), icon: Moon },
    { value: "system" as const, label: tt("System"), icon: Monitor },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">{tt("Theme")}</CardTitle>
        <CardDescription>{tt("Choose your preferred color scheme")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3">
          {themes.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => onSetTheme(value)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all",
                theme === value ? "border-primary bg-primary/5" : "hover:border-primary/50"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium text-sm">{label}</span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
