"use client";

import { useVoiceSettingsPage, EDGE_VOICE_OPTIONS } from "../hooks/useVoiceSettingsPage";
import {
  VoiceSettingsLayout,
  VoiceSettingsHeader,
  VoicePreviewCard,
  VoiceProviderCard,
  VoiceGrid,
  VoiceSliderCard,
  VoiceGridCard,
} from "../components";

function VoiceLoadingSpinner() {
  return (
    <VoiceSettingsLayout>
      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    </VoiceSettingsLayout>
  );
}

export default function VoiceSettingsPage() {
  const h = useVoiceSettingsPage();

  if (h.loading) return <VoiceLoadingSpinner />;

  return (
    <VoiceSettingsLayout>
      <VoiceSettingsHeader
        title="Reading Voice"
        subtitle="Configure text-to-speech voice and playback"
        saving={h.saving}
        onBack={h.goBack}
        onSave={h.handleSave}
      />

      <VoicePreviewCard
        isPlaying={h.isPlaying}
        onPlay={h.handlePreview}
        onStop={h.stopPreview}
      />

      <VoiceProviderCard
        edgeEnabled={h.settings.edgeEnabled}
        onToggleEdge={(c) => h.updateSetting("edgeEnabled", c)}
      >
        {h.settings.edgeEnabled && (
          <VoiceGridCard
            voices={EDGE_VOICE_OPTIONS}
            selectedId={h.settings.edgeVoiceId}
            onSelect={(id) => h.updateSetting("edgeVoiceId", id)}
          />
        )}
      </VoiceProviderCard>

      <VoiceGrid>
        <VoiceSliderCard
          label="Speed"
          icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
          iconColor="#f59e0b"
          value={h.settings.rate}
          min={0.5} max={2.0} step={0.05}
          lowLabel="Slow" highLabel="Fast"
          onChange={(v) => h.updateSetting("rate", v)}
        />
        <VoiceSliderCard
          label="Pitch"
          icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" /></svg>}
          iconColor="#a855f7"
          value={h.settings.pitch}
          min={0.5} max={2.0} step={0.05}
          lowLabel="Low" highLabel="High"
          onChange={(v) => h.updateSetting("pitch", v)}
        />
      </VoiceGrid>
    </VoiceSettingsLayout>
  );
}
