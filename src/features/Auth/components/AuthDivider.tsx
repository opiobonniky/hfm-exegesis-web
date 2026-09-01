/**
 * AuthDivider — horizontal divider with label text (e.g., "or continue with").
 */

interface Props {
  label: string;
}

export function AuthDivider({ label }: Props) {
  return (
    <div className="flex items-center gap-4 py-1">
      <div className="flex-1 h-[1px] bg-muted" />
      <span className="text-xs text-muted-foreground/70 font-medium">
        {label}
      </span>
      <div className="flex-1 h-[1px] bg-muted" />
    </div>
  );
}
