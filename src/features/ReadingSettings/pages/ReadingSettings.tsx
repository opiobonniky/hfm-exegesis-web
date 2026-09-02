"use client";

import { useReadingSettingsPage } from "../hooks/useReadingSettingsPage";
import {
  ReadingSettingsHeader,
  FontSizeSection,
  DisplayOptionsSection,
  ThemeSection,
} from "../components";

export default function ReadingSettingsPage() {
  const h = useReadingSettingsPage();

  return (
    <div className="space-y-6 p-6 max-w-2xl mx-auto">
      <ReadingSettingsHeader
        saving={h.saving}
        onBack={h.goBack}
        onSave={h.handleSave}
      />
      <FontSizeSection
        fontSize={h.fontSize}
        fontSizePx={h.fontSizePx}
        onSetFontSize={h.setFontSize}
      />
      <DisplayOptionsSection
        showVerseNumbers={h.showVerseNumbers}
        autoPlayVerse={h.autoPlayVerse}
        onToggleVerseNumbers={h.setShowVerseNumbers}
        onToggleAutoPlay={h.setAutoPlayVerse}
      />
      <ThemeSection
        theme={h.theme}
        onSetTheme={h.setTheme}
      />
    </div>
  );
}
