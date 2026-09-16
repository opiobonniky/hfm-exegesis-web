import type { ApiBaseUrlIndicatorProps } from "../types";

export default function ApiBaseUrlIndicator({
  apiBaseUrl,
  visible,
}: ApiBaseUrlIndicatorProps) {
  if (!visible || !apiBaseUrl) return null;

  return (
    <div className="pointer-events-none fixed bottom-2 right-2 z-50 rounded-lg border border-border/70 bg-background/90 px-2.5 py-1 text-[10px] text-muted-foreground shadow-sm backdrop-blur-sm sm:bottom-3 sm:right-3 sm:text-xs">
      API: {apiBaseUrl}
    </div>
  );
}
