// ── LockedFeatureBadge ────────────────────────────────────────────────────────
// Displays a locked/paywalled state with a lock icon, feature name, description,
// and a "Become a Sower" button that navigates to the /sower pricing page.

import { useNavigate } from "react-router-dom";
import { Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { routes } from "@/components/Routes/routes";

export interface LockedFeatureBadgeProps {
  featureName?: string;
  featureDescription?: string;
  className?: string;
  /** Optional compact mode for small spaces (e.g. inside a card) */
  compact?: boolean;
}

export default function LockedFeatureBadge({
  featureName = "Premium Feature",
  featureDescription = "This feature is available for Legacy Sower and Covenant Sower subscribers.",
  className,
  compact = false,
}: LockedFeatureBadgeProps) {
  const navigate = useNavigate();

  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center justify-between gap-3 rounded-xl border border-violet-200 dark:border-violet-800/40 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 p-3",
          className,
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center shrink-0">
            <Lock className="w-4 h-4 text-violet-600 dark:text-violet-400" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-foreground truncate">{featureName}</p>
            <p className="text-[10px] text-muted-foreground leading-tight line-clamp-1">
              {featureDescription}
            </p>
          </div>
        </div>
        <Button
          size="sm"
          onClick={() => navigate(routes.sower.path)}
          className="shrink-0 gap-1.5 h-8 px-3 text-xs bg-violet-600 hover:bg-violet-700 text-white font-bold"
        >
          <Sparkles className="w-3 h-3" />
          Unlock
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-6 text-center",
        className,
      )}
    >
      <div className="w-16 h-16 rounded-2xl bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center mb-4">
        <Lock className="w-8 h-8 text-violet-600 dark:text-violet-400" />
      </div>
      <h3 className="text-lg font-bold text-foreground mb-2">{featureName}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">
        {featureDescription}
      </p>
      <Button
        onClick={() => navigate(routes.sower.path)}
        className="gap-2 bg-violet-600 hover:bg-violet-700 text-white font-bold shadow-lg shadow-violet-500/30"
      >
        <Sparkles className="w-4 h-4" />
        Become a Sower
      </Button>
      <p className="text-[11px] text-muted-foreground mt-3 max-w-xs">
        Bible reading across all translations is always free — subscription only
        gates advanced study tools.
      </p>
    </div>
  );
}
