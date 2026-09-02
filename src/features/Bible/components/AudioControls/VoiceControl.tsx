import { ChevronDown, Mic } from "lucide-react";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { TTSVoice } from "@/services/ttsService";

interface VoiceControlProps {
  voices: TTSVoice[];
  selectedVoice: TTSVoice | null;
  onVoiceChange: (voice: TTSVoice) => void;
}

export function VoiceControl({ voices, selectedVoice, onVoiceChange }: VoiceControlProps) {
  return (
    <section className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/70 p-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Mic className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Reading voice
        </p>
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label="Select voice"
              className="mt-0.5 flex max-w-full items-center gap-1 text-start text-xs font-semibold text-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="truncate">{selectedVoice?.name || "Default"}</span>
              <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="max-h-[300px] w-[260px] overflow-hidden p-0" align="end">
            <div className="border-b border-border/60 px-3 py-2.5">
              <p className="text-xs font-bold text-foreground">Select reading voice</p>
            </div>
            <div className="max-h-[250px] overflow-y-auto p-1.5">
              {voices.map((voice) => (
                <button
                  type="button"
                  key={voice.voiceId}
                  onClick={() => {
                    onVoiceChange(voice);
                  }}
                  aria-pressed={selectedVoice?.voiceId === voice.voiceId}
                  className={cn(
                    "w-full rounded-lg px-2.5 py-2 text-start text-xs transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    selectedVoice?.voiceId === voice.voiceId &&
                      "bg-primary/10 font-semibold text-primary",
                  )}
                >
                  {voice.name}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </section>
  );
}
