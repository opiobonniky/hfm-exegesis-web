// Suggested passage cards for when no book is selected
import { Sparkles } from "lucide-react";

const PASSAGES = [
  { ref: "John 3:16", label: "God's Love", desc: "The Gospel in one verse" },
  { ref: "Psalm 23:1", label: "The Shepherd", desc: "Trust and provision" },
  { ref: "Philippians 4:13", label: "Strength", desc: "Contentment in Christ" },
  { ref: "Romans 8:28", label: "God's Purpose", desc: "Hope in all things" },
  { ref: "Matthew 5:3", label: "Beatitudes", desc: "Kingdom living" },
];
interface SuggestedPassagesProps {
  onSelect: (ref: string) => void;
}
export function SuggestedPassages({ onSelect }: SuggestedPassagesProps) {
  return (
    <div className="-mt-2">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center">
          <Sparkles className="w-3 h-3 text-primary" />
        </div>
        <p className="text-xs font-bold text-foreground">Not sure where to start?</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {PASSAGES.map((p) => (
          <button
            key={p.ref}
            onClick={() => onSelect(p.ref)}
            className="text-left p-3 rounded-xl border border-border/60 hover:border-primary/30 bg-card/50 hover:bg-card transition-all group"
          >
            <p className="text-xs font-bold text-primary group-hover:text-primary/80">{p.label}</p>
            <p className="text-[10px] text-muted-foreground">{p.ref} — {p.desc}</p>
          </button>
        ))}
    </div>
  );
