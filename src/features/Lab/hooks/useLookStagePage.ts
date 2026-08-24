import { useState, useCallback } from "react";

interface LookStageProps {
  lookNotes: string;
  currentPromptIdx: number;
  onUpdate: (data: { lookNotes?: string; currentPromptIdx?: number }) => void;
  onAdvance: (lookNotes?: string) => void;
  lookPrompts: string[];
}
function parseNotes(raw: string): Record<number, string> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === "object" && parsed !== null) {
      return Object.fromEntries(
        Object.entries(parsed).filter(([, value]) => typeof value === "string"),
      ) as Record<number, string>;
    }
  } catch {
    return { 0: raw };
  }
  return { 0: raw };
}

function serializeNotes(map: Record<number, string>): string {
  const entries = Object.entries(map).filter(([, value]) => value.trim());
  if (!entries.length) return "";
  if (entries.length === 1 && entries[0][0] === "0") return entries[0][1];
  return JSON.stringify(map);
}

export function useLookStagePage(props: LookStageProps) {
  const { lookNotes, currentPromptIdx, onUpdate, onAdvance, lookPrompts } = props;
  const [promptNotes, setPromptNotes] = useState<Record<number, string>>(() => parseNotes(lookNotes));
  const [currentText, setCurrentText] = useState(() => parseNotes(lookNotes)[currentPromptIdx] || "");
  const [saved, setSaved] = useState(false);
  const [expandedPrompts, setExpandedPrompts] = useState<Set<number>>(new Set([currentPromptIdx]));
  const syncToParent = useCallback((map: Record<number, string>) => {
    onUpdate({ lookNotes: serializeNotes(map) });
  }, [onUpdate]);
  const switchPrompt = useCallback((nextIdx: number) => {
    if (nextIdx < 0 || nextIdx >= lookPrompts.length) return;
    syncToParent(promptNotes);
    setCurrentText(promptNotes[nextIdx] || "");
    onUpdate({ currentPromptIdx: nextIdx });
  }, [lookPrompts.length, onUpdate, promptNotes, syncToParent]);
  const handleTextChange = useCallback((text: string) => {
    setCurrentText(text);
    setSaved(false);
    const newMap = { ...promptNotes, [currentPromptIdx]: text };
    setPromptNotes(newMap);
    // Continue can be clicked immediately after typing, so keep the parent
    // state current instead of waiting for a debounce that may still be pending.
    syncToParent(newMap);
  }, [promptNotes, currentPromptIdx, syncToParent]);
  const handleSave = useCallback(() => {
    syncToParent(promptNotes);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [promptNotes, syncToParent]);
  const handleAdvance = useCallback(() => {
    const notes = serializeNotes(promptNotes);
    onUpdate({ lookNotes: notes });
    onAdvance(notes);
  }, [onAdvance, onUpdate, promptNotes]);
  const completedCount = Object.values(promptNotes).filter((v) => v.trim().length > 0).length;
  const allDone = completedCount >= lookPrompts.length;
  return {
    promptNotes, currentText, saved, expandedPrompts, setExpandedPrompts,
    switchPrompt, handleTextChange, handleSave, handleAdvance, completedCount, allDone,
  };
}
