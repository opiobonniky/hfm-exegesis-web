// VoiceSettings layout wrapper
import { ReactNode } from "react";

interface VoiceSettingsLayoutProps {
  children: ReactNode;
}

export function VoiceSettingsLayout({ children }: VoiceSettingsLayoutProps) {
  return <div className="space-y-6 p-6 max-w-2xl mx-auto">{children}</div>;
}

interface VoiceSettingsHeaderProps {
  title: string;
  subtitle: string;
  saving: boolean;
  onBack: () => void;
  onSave: () => void;
}

export function VoiceSettingsHeader({ title, subtitle, saving, onBack, onSave }: VoiceSettingsHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="inline-flex items-center justify-center w-9 h-9 rounded-md hover:bg-muted transition-colors">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
      </div>
      <button onClick={onSave} disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50">
        {saving ? (
          <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
        ) : null}
        Save
      </button>
    </div>
  );
}

interface VoicePreviewCardProps {
  isPlaying: boolean;
  onPlay: () => void;
  onStop: () => void;
}

export function VoicePreviewCard({ isPlaying, onPlay, onStop }: VoicePreviewCardProps) {
  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Preview Voice</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-md">For God so loved the world that he gave his one and only Son...</p>
        </div>
        <button
          onClick={isPlaying ? onStop : onPlay}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${isPlaying ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : "bg-primary text-primary-foreground hover:opacity-90"}`}
        >
          {isPlaying ? (
            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" /></svg>
          ) : (
            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /></svg>
          )}
          {isPlaying ? "Stop" : "Play"}
        </button>
      </div>
    </div>
  );
}

interface VoiceProviderCardProps {
  edgeEnabled: boolean;
  onToggleEdge: (enabled: boolean) => void;
  children: ReactNode;
}

export function VoiceProviderCard({ edgeEnabled, onToggleEdge, children }: VoiceProviderCardProps) {
  return (
    <div className="rounded-lg border bg-card">
      <div className="px-6 py-4 border-b">
        <p className="font-semibold flex items-center gap-2">
          <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 6l-4 4h3v4h2v-4h3l-4-4z" /></svg>
          Voice Provider
        </p>
        <p className="text-sm text-muted-foreground">Choose between device voices or cloud-based Microsoft Edge voices</p>
      </div>
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between border rounded-lg p-4">
          <div>
            <p className="font-medium">Microsoft Edge TTS</p>
            <p className="text-sm text-muted-foreground">High-quality neural voices powered by Microsoft Azure</p>
          </div>
          <button
            onClick={() => onToggleEdge(!edgeEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${edgeEnabled ? "bg-primary" : "bg-muted"}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${edgeEnabled ? "translate-x-6" : "translate-x-1"}`} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

interface VoiceGridProps {
  children: ReactNode;
}

export function VoiceGrid({ children }: VoiceGridProps) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>;
}

interface VoiceSliderCardProps {
  label: string;
  icon: ReactNode;
  iconColor: string;
  value: number;
  min: number;
  max: number;
  step: number;
  lowLabel: string;
  highLabel: string;
  onChange: (value: number) => void;
}

export function VoiceSliderCard({ label, icon, iconColor, value, min, max, step, lowLabel, highLabel, onChange }: VoiceSliderCardProps) {
  return (
    <div className="rounded-lg border bg-card">
      <div className="px-6 py-4 border-b">
        <p className="font-semibold flex items-center gap-2 text-base">
          <span style={{ color: iconColor }}>{icon}</span>
          {label}
        </p>
      </div>
      <div className="p-6 space-y-3">
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{lowLabel}</span>
          <span className="font-medium text-foreground">{value.toFixed(2)}x</span>
          <span>{highLabel}</span>
        </div>
      </div>
    </div>
  );
}

interface VoiceGridCardProps {
  voices: Array<{ id: string; name: string; gender: string; accent: string }>;
  selectedId: string;
  onSelect: (id: string) => void;
}

export function VoiceGridCard({ voices, selectedId, onSelect }: VoiceGridCardProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Select Voice</p>
      <div className="grid grid-cols-2 gap-2 mt-2">
        {voices.map((voice) => (
          <button key={voice.id} onClick={() => onSelect(voice.id)}
            className={`flex items-center justify-between rounded-lg border p-3 text-left transition-colors ${selectedId === voice.id ? "border-primary bg-primary/5" : "hover:border-primary/50"}`}>
            <div>
              <p className="font-medium text-sm">{voice.name}</p>
              <p className="text-xs text-muted-foreground">{voice.gender} • {voice.accent}</p>
            </div>
            {selectedId === voice.id && (
              <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
