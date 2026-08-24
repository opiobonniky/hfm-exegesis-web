import { useState, useEffect, useRef } from "react";

type ResourceKey = "wordStudy" | "commentary" | "crossRef" | "prologue";

export function useLearnStagePage() {
  const [copiedCommentaryIdx, setCopiedCommentaryIdx] = useState<number | null>(null);
  const [activeResource, setActiveResource] = useState<ResourceKey>("wordStudy");
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (copiedCommentaryIdx !== null) {
      const timer = setTimeout(() => setCopiedCommentaryIdx(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [copiedCommentaryIdx]);

  return { copiedCommentaryIdx, setCopiedCommentaryIdx, activeResource, setActiveResource, sectionRef };
}
