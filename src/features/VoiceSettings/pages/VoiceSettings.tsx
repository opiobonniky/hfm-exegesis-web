"use client";

import { ArrowLeft, Save, Loader2, Volume2, Play, Pause, Gauge, Music2, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useVoiceSettingsPage, EDGE_VOICES } from "../hooks/useVoiceSettingsPage";
export default function VoiceSettingsPage() {
  const h = useVoiceSettingsPage();
  if (h.loading) return (
    <div className="flex items-center justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  );
  return (
    <div className="space-y-6 p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => h.navigate(-1)}><ArrowLeft className="h-5 w-5" /></Button>
          <div>
            <h1 className="text-2xl font-bold">Reading Voice</h1>
            <p className="text-sm text-muted-foreground">Configure text-to-speech voice and playback</p>
          </div>
        </div>
        <Button onClick={h.handleSave} disabled={h.saving}>
          {h.saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Save
        </Button>
      </div>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Preview Voice</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-md">For God so loved the world that he gave his one and only Son...</p>
            </div>
            <Button variant={h.isPlaying ? "destructive" : "default"} size="lg" onClick={h.isPlaying ? h.stopPreview : h.handlePreview}>
              {h.isPlaying ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
              {h.isPlaying ? "Stop" : "Play"}
            </Button>
        </CardContent>
      </Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Volume2 className="h-5 w-5 text-primary" />Voice Provider</CardTitle>
          <CardDescription>Choose between device voices or cloud-based Microsoft Edge voices</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between border rounded-lg p-4">
              <p className="font-medium">Microsoft Edge TTS</p>
              <p className="text-sm text-muted-foreground">High-quality neural voices powered by Microsoft Azure</p>
            <Switch checked={h.settings.edgeEnabled} onCheckedChange={(c) => h.updateSetting("edgeEnabled", c)} />
          {h.settings.edgeEnabled && (
              <Label>Select Voice</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {EDGE_VOICES.map((voice) => (
                  <button key={voice.id} onClick={() => h.updateSetting("edgeVoiceId", voice.id)}
                    className={cn("flex items-center justify-between rounded-lg border p-3 text-left transition-colors",
                      h.settings.edgeVoiceId === voice.id ? "border-primary bg-primary/5" : "hover:border-primary/50")}>
                    <div>
                      <p className="font-medium text-sm">{voice.name}</p>
                      <p className="text-xs text-muted-foreground">{voice.gender} • {voice.accent}</p>
                    </div>
                    {h.settings.edgeVoiceId === voice.id && <Check className="h-4 w-4 text-primary" />}
                  </button>
                ))}
              </div>
          )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Gauge className="h-4 w-4 text-amber-500" />Speed</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Slider value={[h.settings.rate]} min={0.5} max={2.0} step={0.05} onValueChange={([v]) => h.updateSetting("rate", v)} />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Slow</span><span className="font-medium text-foreground">{h.settings.rate.toFixed(2)}x</span><span>Fast</span>
          </CardContent>
        </Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Music2 className="h-4 w-4 text-purple-500" />Pitch</CardTitle></CardHeader>
            <Slider value={[h.settings.pitch]} min={0.5} max={2.0} step={0.05} onValueChange={([v]) => h.updateSetting("pitch", v)} />
              <span>Low</span><span className="font-medium text-foreground">{h.settings.pitch.toFixed(2)}x</span><span>High</span>
    </div>
}
