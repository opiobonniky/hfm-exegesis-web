// CollapsibleSection — reusable collapsible section wrapper for form pages
export function CollapsibleSection({
  title, defaultOpen = true, children,
}: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  return (
    <details open={defaultOpen} className="group">
      <summary className="cursor-pointer select-none flex items-center gap-2 py-2 text-sm font-semibold text-foreground/80 border-b border-border/40 mb-4">
        <span className="group-open:rotate-90 transition-transform text-xs">▶</span>
        {title}
      </summary>
      <div className="space-y-6">{children}</div>
    </details>
  );
}
