/**
 * FormSectionCard — a single Card block used in forms (Verse Reference, Explanation, etc).
 * Replaces repeated `<Card><CardHeader>...<CardContent>...` patterns in Add* pages.
 */
import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface FormSectionCardProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  variant?: "default" | "amber";
  children: ReactNode;
  headerClassName?: string;
}

export function FormSectionCard({
  icon: Icon,
  title,
  description,
  variant = "default",
  children,
  headerClassName,
}: FormSectionCardProps) {
  const headerBg = variant === "amber"
    ? "bg-gradient-to-r from-amber-500/5 to-amber-400/5"
    : "bg-gradient-to-r from-primary/5 to-accent/5";

  return (
    <Card className="border-border/40 shadow-sm">
      <CardHeader className={cn(headerBg, "pb-4", headerClassName)}>
        <CardTitle className="flex items-center gap-2 text-base">
          {Icon && <Icon className="w-4 h-4 text-primary" />}
          {title}
        </CardTitle>
        {description && <CardDescription className="mt-1">{description}</CardDescription>}
      </CardHeader>
      <CardContent className="pt-5 space-y-4">
        {children}
      </CardContent>
    </Card>
  );
}
