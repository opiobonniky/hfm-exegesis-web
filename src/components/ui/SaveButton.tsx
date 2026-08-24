"use client";

import { Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SaveButtonProps {
  saving: boolean;
  onClick?: () => void;
  disabled?: boolean;
  label?: string;
  savingLabel?: string;
  className?: string;
  size?: "default" | "sm" | "lg";
  variant?: "default" | "outline" | "destructive";
}

/**
 * Reusable save button with loading spinner.
 * Replaces the repeated pattern of `<Button disabled={saving}>{saving ? <Loader2 /> : <Save />} Save</Button>`.
 */
export function SaveButton({
  saving, onClick, disabled, label = "Save Changes", savingLabel = "Saving...",
  className, size = "default", variant = "default",
}: SaveButtonProps) {
  return (
    <Button size={size} variant={variant} onClick={onClick} disabled={saving || disabled} className={cn("gap-2", className)}>
      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
      {saving ? savingLabel : label}
    </Button>
  );
}

/**
 * Delete button with confirmation loading state.
 */
export function DeleteButton({
  deleting, onClick, disabled, label = "Delete", deletingLabel = "Deleting...",
  className,
}: Omit<SaveButtonProps, "variant" | "size"> & { deleting?: boolean }) {
  return (
    <Button variant="destructive" onClick={onClick} disabled={deleting || disabled} className={cn("gap-2", className)}>
      {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
      {deleting ? deletingLabel : label}
    </Button>
  );
}
