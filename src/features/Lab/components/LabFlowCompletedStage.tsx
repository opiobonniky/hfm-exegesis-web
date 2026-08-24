import { PartyPopper, RotateCcw, Copy, Share2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface Props {
  passageRef: string;
  onCopy: () => void;
  onShare: () => void;
  onReset: () => void;
  copied: boolean;
  sharing: boolean;
}
export default function LabFlowCompletedStage({ passageRef, onCopy, onShare, onReset, copied, sharing }: Props) {
  return (
    <div className="flex flex-col items-center py-12 gap-6 text-center">
      <div className="relative">
        <div className="absolute inset-0 rounded-full blur-2xl opacity-30 bg-primary" />
        <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-xl" style={{ boxShadow: "0 0 30px hsl(var(--primary)/0.3)" }}>
          <PartyPopper className="w-10 h-10 text-card" />
        </div>
      </div>
      <div>
        <h2 className="text-2xl font-black text-foreground" style={{ fontFamily: "'Cinzel', serif" }}>Study Complete!</h2>
        <p className="text-sm text-muted-foreground mt-2">You've journeyed through {passageRef} with the LOOK, LISTEN, LEARN, ABIDE method.</p>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onCopy} className="gap-1.5"><Copy className="w-3.5 h-3.5" /> {copied ? "Copied!" : "Copy"}</Button>
        <Button variant="outline" size="sm" onClick={onShare} disabled={sharing} className="gap-1.5"><Share2 className="w-3.5 h-3.5" /> Share</Button>
      <Button onClick={onReset} className="gap-2"><RotateCcw className="w-4 h-4" /> Start New Study</Button>
    </div>
  );
