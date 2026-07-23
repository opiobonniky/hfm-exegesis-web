import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function ExpandableText({
  text,
  initialLines = 4,
  expandLabel = "Read more",
  closeLabel = "Close",
}: {
  text?: string | null;
  initialLines?: number;
  expandLabel?: string;
  closeLabel?: string;
}) {
  const [expanded, setExpanded] = useState(false);

  if (!text) return null;

  return (
    <div>
      <div
        className={cn(
          "text-sm text-muted-foreground leading-6 overflow-hidden transition-all duration-200",
          !expanded && "line-clamp-4",
        )}
        style={!expanded ? { WebkitLineClamp: initialLines } : undefined}
      >
        {text}
      </div>
      <button
        onClick={() => setExpanded((p) => !p)}
        className="inline-flex items-center gap-1 mt-1.5 text-xs font-bold text-primary hover:text-primary/80 transition-colors"
      >
        {expanded ? closeLabel : expandLabel}
        <ChevronDown
          className={cn("w-3 h-3 transition-transform duration-200", expanded && "rotate-180")}
          strokeWidth={2.5}
        />
      </button>
    </div>
  );
}
