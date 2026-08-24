import { Keyboard, X, Command } from "lucide-react";
import { cn } from "@/lib/utils";
import { STAGE_ORDER } from "@/hooks/useLabFlow";

function ShortcutRow({ keys, label, available }: { keys: string[]; label: string; available: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className={cn("text-xs font-medium", available ? "text-foreground/80" : "text-muted-foreground/40")}>{label}</span>
      <div className="flex items-center gap-1">
        {keys.map((key, i) => (
          <span key={i} className={cn("inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-md text-[10px] font-bold", available ? "bg-muted text-foreground/80 border border-border/50 shadow-sm" : "bg-muted/30 text-muted-foreground/30 border border-border/30")}>
            {key === "Ctrl" ? <span className="flex items-center gap-0.5"><Command className="w-2.5 h-2.5" /><span>Ctrl</span></span> : key}
          </span>
        ))}
      </div>
    </div>
  );
}
function Divider() {
  return <div className="h-px bg-border/30 my-1" />;
interface Props {
  open: boolean;
  onClose: () => void;
  stage: string;
  saving: boolean;
export default function LabFlowShortcuts({ open, onClose, stage, saving }: Props) {
  const currentIdx = STAGE_ORDER.indexOf(stage as any);
    <>
      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
          <div className="relative w-full max-w-md rounded-2xl bg-card border border-border/60 shadow-2xl p-6 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <button onClick={onClose} className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-muted/30 flex items-center justify-center hover:bg-muted/60 active:scale-[0.93] transition-all">
              <X className="w-3.5 h-3.5 text-muted-foreground/60" />
            </button>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center"><Keyboard className="w-5 h-5 text-primary" /></div>
              <h3 className="text-lg font-bold text-foreground">Keyboard Shortcuts</h3>
            </div>
            <div className="space-y-3">
              <ShortcutRow keys={["Ctrl", "Enter"]} label="Advance to next stage" available={(stage === "look" || stage === "listen" || stage === "learn" || stage === "abide") && !saving} />
              <ShortcutRow keys={["Ctrl", "S"]} label="Save current progress" available={stage !== "passage" && stage !== "completed"} />
              <ShortcutRow keys={["?"]} label="Toggle keyboard shortcuts" available={true} />
              <Divider />
              <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-wider">Jump to stage</p>
              {STAGE_ORDER.map((s, idx) => (
                <ShortcutRow key={s} keys={[String(idx + 1)]} label={`Go to ${s.charAt(0).toUpperCase() + s.slice(1)}`} available={idx < currentIdx} />
              ))}
              <ShortcutRow keys={["R"]} label="Start a new study" available={stage === "completed"} />
            <p className="text-[10px] text-muted-foreground/50 text-center mt-5 pt-4 border-t border-border/30">Shortcuts are disabled while typing in text fields.</p>
          </div>
        </div>
      )}
    </>
export function LabFlowShortcutHint({ text }: { text: string | null }) {
  if (!text) return null;
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-foreground/10 backdrop-blur-md border border-border/40 shadow-lg">
        <Command className="w-3.5 h-3.5 text-muted-foreground/70" />
        <span className="text-xs font-semibold text-foreground/80">{text}</span>
export function LabFlowShortcutToggle({ onClick }: { onClick: () => void }) {
    <button onClick={onClick} className="fixed bottom-6 right-6 z-50 w-9 h-9 rounded-xl bg-background/80 backdrop-blur-md border border-border/40 shadow-md flex items-center justify-center hover:bg-muted/50 active:scale-[0.93] transition-all" title="Keyboard shortcuts (?)" aria-label="Keyboard shortcuts">
      <Keyboard className="w-4 h-4 text-muted-foreground/70" />
    </button>
