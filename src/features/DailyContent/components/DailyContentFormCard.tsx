/**
 * DailyContentFormCard — replaces the repeated Card + CardHeader + CardContent pattern.
 */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { DailyContentFormCardProps } from "../types";

export function DailyContentFormCard({
  icon: Icon,
  title,
  description,
  children,
  contentClassName,
  onSubmit,
}: DailyContentFormCardProps) {
  return (
    <Card className="border-border/40 shadow-md">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 pb-6">
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className={contentClassName ?? "pt-6 space-y-6"}>
        {onSubmit ? <form onSubmit={onSubmit}>{children}</form> : children}
      </CardContent>
    </Card>
  );
}
