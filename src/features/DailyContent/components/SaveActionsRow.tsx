/**
 * SaveActionsRow — the save bar at the bottom of AddExplanation with info + button.
 */
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SaveActionsRowProps {
  infoText: string;
  infoIcon?: ReactNode;
  children: ReactNode;
  buttonClassName?: string;
}

export function SaveActionsRow({ infoText, infoIcon, children, buttonClassName }: SaveActionsRowProps) {
  return (
    <div className="flex items-center justify-between pt-2 pb-6">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {infoIcon}
        {infoText}
      </div>
      {children}
    </div>
  );
}
