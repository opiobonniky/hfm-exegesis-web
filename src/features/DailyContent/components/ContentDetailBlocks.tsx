// Shared detail view blocks for content detail pages
import { GraduationCap } from "lucide-react";
import { parseWordStudies } from "../helpers/contentDetailHelpers";

// ── Section label ──
export function SectionLabel({ children, icon: Icon }: { children: React.ReactNode; icon?: any }) {
  return (
    <div className="flex items-center gap-1.5 mb-2">
      {Icon && <Icon className="w-3.5 h-3.5 text-primary" />}
      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{children}</h3>
    </div>
  );
}

// ── Text block ──
export function TextBlock({ label, value, icon }: { label: string; value?: string | null; icon?: any }) {
  if (!value?.trim()) return null;
  return (
    <div className="py-3 border-b border-border/30 last:border-0">
      <SectionLabel icon={icon}>{label}</SectionLabel>
      <p className="text-sm leading-relaxed text-foreground whitespace-pre-line">{value}</p>
    </div>
  );
}

// ── List block ──
export function ListBlock({ label, items, icon }: { label: string; items: string[]; icon?: any }) {
  if (items.length === 0) return null;
  return (
    <div className="py-3 border-b border-border/30 last:border-0">
      <SectionLabel icon={icon}>{label}</SectionLabel>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-foreground">
            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
            <span className="leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Word Studies block ──
export function WordStudiesBlock({ value }: { value?: string | null }) {
  const studies = parseWordStudies(value);
  if (studies.length === 0) return null;
  return (
    <div className="py-3 border-b border-border/30 last:border-0">
      <SectionLabel icon={GraduationCap}>Strong's Concordance Word Studies</SectionLabel>
      <div className="space-y-3">
        {studies.map((s, i) => (
          <div key={i} className="rounded-lg bg-muted/30 p-3 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-foreground">{s.word}</span>
              {s.strongs && <span className="text-xs font-mono text-primary/70 bg-primary/5 px-1.5 py-0.5 rounded">{s.strongs}</span>}
            </div>
            {s.definition && <p className="text-xs text-muted-foreground leading-relaxed">{s.definition}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Tags block ──
export function TagsBlock({ tags }: { tags?: string | null }) {
  if (!tags?.trim()) return null;
  const tagList = tags.split(",").map(t => t.trim()).filter(Boolean);
  if (tagList.length === 0) return null;
  return (
    <div className="py-3 border-b border-border/30 last:border-0">
      <SectionLabel>Tags</SectionLabel>
      <div className="flex items-center gap-2 flex-wrap">
        {tagList.map((tag, i) => (
          <span key={i} className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">{tag}</span>
        ))}
      </div>
    </div>
  );
}
