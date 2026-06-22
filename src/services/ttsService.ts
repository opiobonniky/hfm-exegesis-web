import api from "./api";

export interface TTSVoice {
  name: string;
  voiceId: string;
  source: "api" | "builtin" | "edge" | "elevenlabs";
  category?: string;
}

const DEFAULT_VOICE_ID = "en-US-AriaNeural";

export const ttsService = {
  isEnabled: async (): Promise<boolean> => {
    try {
      const response = await api.get("/tts/status");
      return response.data.returnData?.enabled === true;
    } catch {
      return false;
    }
  },

  getVoices: async (): Promise<TTSVoice[]> => {
    try {
      const response = await api.get("/tts/voices");
      if (response.data.returnCode === 200 && response.data.returnData) {
        return response.data.returnData;
      }
      return getEdgeVoices();
    } catch {
      return getEdgeVoices();
    }
  },

  speak: async (text: string, voiceId?: string, speed?: number): Promise<ArrayBuffer> => {
    const response = await api.post(
      "/tts/speak",
      { text, voiceId: voiceId || DEFAULT_VOICE_ID, speed: speed || 1.0 },
      { responseType: "arraybuffer" },
    );
    return response.data;
  },
};

function getEdgeVoices(): TTSVoice[] {
  return [
    { name: "Aria (Female)",  voiceId: "en-US-AriaNeural",  source: "edge", category: "Neural" },
    { name: "Jenny (Female)", voiceId: "en-US-JennyNeural", source: "edge", category: "Neural" },
    { name: "Guy (Male)",     voiceId: "en-US-GuyNeural",   source: "edge", category: "Neural" },
    { name: "Davis (Male)",   voiceId: "en-US-DavisNeural", source: "edge", category: "Neural" },
    { name: "Emma (Female)",  voiceId: "en-US-EmmaNeural",  source: "edge", category: "Neural" },
    { name: "Brian (Male)",   voiceId: "en-US-BrianNeural", source: "edge", category: "Neural" },
    { name: "Sonia (Female)", voiceId: "en-GB-SoniaNeural", source: "edge", category: "Neural" },
    { name: "Ryan (Male)",    voiceId: "en-GB-RyanNeural",  source: "edge", category: "Neural" },
  ];
}
