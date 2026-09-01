/**
 * AuthBadge — styled badge for Auth page headers.
 */
interface AuthBadgeProps {
  label: string;
}

export function AuthBadge({ label }: AuthBadgeProps) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/10 mb-2">
      {label}
    </div>
  );
}
