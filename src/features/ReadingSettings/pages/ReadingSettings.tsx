"use client";

import { ArrowLeft, Save, Loader2, Type, Sun, Moon, Monitor, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useReadingSettingsPage, FONT_SIZES } from "../hooks/useReadingSettingsPage";

export default function ReadingSettingsPage() {
  const h = useReadingSettingsPage();

  return (
    <div className="space-y-6 p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => h.navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Reading Settings</h1>
            <p className="text-sm text-muted-foreground">Customize your reading experience</p>
          </div>
        </div>
        <Button onClick={h.handleSave} disabled={h.saving}>
          {h.saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Save
        </Button>
      </div>

      {/* Font Size */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-5 w-5 text-primary" /> Font Size
          </CardTitle>
          <CardDescription>Adjust the text size for reading</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {FONT_SIZES.map((fs) => (
              <button
                key={fs.value}
                onClick={() => h.setFontSize(fs.value)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all",
                  h.fontSize === fs.value ? "border-primary bg-primary/5" : "hover:border-primary/50"
                )}
              >
                <span className="font-medium">{fs.label}</span>
                <span className="text-xs text-muted-foreground">{fs.px}</span>
              </button>
            ))}
          </div>
          <div className="rounded-lg bg-muted/50 p-4">
            <p style={{ fontSize: h.fontSizePx }}>
              For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life. — John 3:16
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Display Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" /> Display Options
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Show Verse Numbers</p>
              <p className="text-sm text-muted-foreground">Display verse numbers alongside text</p>
            </div>
            <Switch checked={h.showVerseNumbers} onCheckedChange={h.setShowVerseNumbers} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Auto-play Audio</p>
              <p className="text-sm text-muted-foreground">Automatically play audio when opening a chapter</p>
            </div>
            <Switch checked={h.autoPlayVerse} onCheckedChange={h.setAutoPlayVerse} />
          </div>
        </CardContent>
      </Card>

      {/* Theme */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">Theme</CardTitle>
          <CardDescription>Choose your preferred color scheme</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: "light" as const, label: "Light", icon: Sun },
              { value: "dark" as const, label: "Dark", icon: Moon },
              { value: "system" as const, label: "System", icon: Monitor },
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => h.setTheme(value)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all",
                  h.theme === value ? "border-primary bg-primary/5" : "hover:border-primary/50"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium text-sm">{label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
