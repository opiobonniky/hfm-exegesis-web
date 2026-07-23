// ── TierBadge ─────────────────────────────────────────────────────────────────
// Reusable subscription-tier badge showing the user's current plan with a
// colored status dot and optional "Upgrade" CTA for free users.
//
// Variants:
//   default — compact badge (emerald for paying, violet for free)
//   sidebar — sidebar-styled badge (sidebar-accent colors, expiry label support)

import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { routes } from "@/components/Routes/routes";
import { cn } from "@/lib/utils";

export interface TierBadgeProps {
  /** Custom click handler. Defaults to navigating to /sower for all users. */
  onClick?: () => void;
  /** Loading state — shows a spinner in place of the label text. */
  loading?: boolean;
  /** Sidebar variant with sidebar-accent colors and full-width layout. */
  sidebar?: boolean;
  /** Show the subscription expiry date next to the label (sidebar only). */
  showExpiry?: boolean;
  /** Extra classes forwarded to the root element. */
  className?: string;
}

export default function TierBadge({
  onClick,
  loading = false,
  sidebar = false,
  showExpiry = false,
  className,
}: TierBadgeProps) {
  const navigate = useNavigate();
  const { isPayingUser, tierLabel, expiresLabel } = useSubscription();

  const handleClick = onClick ?? (() => navigate(routes.sower.path));

  // ── Sidebar variant ──
  if (sidebar) {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          "group flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 transition-all duration-200",
          isPayingUser
            ? "bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/30"
            : "bg-sidebar-accent/40 hover:bg-sidebar-accent/60 border border-transparent hover:border-sidebar-foreground/10",
          className,
        )}
      >
        {/* Status dot */}
        <span
          className={cn(
            "w-2 h-2 rounded-full shrink-0",
            isPayingUser ? "bg-emerald-400" : "bg-sidebar-foreground/30",
          )}
        />
        {/* Label */}
        <span
          className={cn(
            "text-[11px] font-medium tracking-wide truncate flex-1 text-start",
            isPayingUser
              ? "text-emerald-300"
              : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground/70",
          )}
        >
          {tierLabel}
        </span>
        {/* Expiry hint */}
        {isPayingUser && showExpiry && expiresLabel && (
          <span className="text-[10px] text-emerald-300/50 group-hover:text-emerald-300/70 truncate max-w-[80px] shrink-0">
            {expiresLabel}
          </span>
        )}
        {/* Upgrade CTA */}
        {!isPayingUser && (
          <span className="text-[10px] font-semibold text-violet-400/70 group-hover:text-violet-300 shrink-0">
            Upgrade
          </span>
        )}
      </button>
    );
  }

  // ── Default (compact) variant ──
  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={cn(
        "group flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 border shrink-0",
        isPayingUser
          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-60"
          : "bg-violet-500/10 border-violet-500/20 text-violet-600 dark:text-violet-400 hover:bg-violet-500/20",
        className,
      )}
    >
      {/* Status dot */}
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full shrink-0",
          isPayingUser ? "bg-emerald-500" : "bg-violet-500",
        )}
      />
      {/* Label or loading spinner */}
      {loading ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : (
        <span className="truncate max-w-[100px]">{tierLabel}</span>
      )}
      {/* Upgrade CTA */}
      {!isPayingUser && (
        <span className="text-[10px] font-bold text-violet-500/70 group-hover:text-violet-500 underline underline-offset-2 shrink-0">
          Upgrade
        </span>
      )}
    </button>
  );
}
