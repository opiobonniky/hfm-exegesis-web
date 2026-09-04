// DetailPageLayout — reusable wrapper for all admin detail pages
"use client";

import { ArrowLeft, Loader2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ReactNode } from "react";

/* ─── Loading state ─── */
export function DetailLoading() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
    </div>
  );
}

/* ─── Page header (top bar with back + title + optional badge) ─── */
export interface DetailPageHeaderProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  badge?: { label: string; variant?: "default" | "secondary" | "outline" };
  onBack: () => void;
  actions?: ReactNode;
}

export function DetailPageHeader({
  icon,
  title,
  subtitle,
  badge,
  onBack,
  actions,
  containerClassName,
}: DetailPageHeaderProps & { containerClassName?: string }) {
  const containerClass = containerClassName || 'max-w-3xl mx-auto px-3 sm:px-4 lg:px-6';
  return (
    <div className="border-b bg-card">
      <div className={containerClass}>
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold flex items-center gap-2">
                {icon} {title}
              </h1>
              {subtitle && (
                <p className="text-xs text-muted-foreground">{subtitle}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {badge && (
              <Badge variant={badge.variant || "default"}>{badge.label}</Badge>
            )}
            {actions}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Content container ─── */
export function DetailContent({ children, className = "" }: { children: ReactNode; className?: string }) {
  const base = className || 'max-w-3xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6';
  return (
    <div className={base}>
      {children}
    </div>
  );
}

/* ─── Back button row ─── */
export function DetailBackButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <div className="flex gap-2 pb-8">
      <Button
        variant="outline"
        onClick={onClick}
        className="gap-1.5"
      >
        <ArrowLeft className="w-4 h-4" /> {label}
      </Button>
    </div>
  );
}

/* ─── Edit button (header action) ─── */
export function DetailEditButton({
  label = "Edit",
  onClick,
}: {
  label?: string;
  onClick: () => void;
}) {
  return (
    <Button variant="outline" size="sm" onClick={onClick} className="gap-1.5">
      <Pencil className="w-3.5 h-3.5" /> {label}
    </Button>
  );
}
