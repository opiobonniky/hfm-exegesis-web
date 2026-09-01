// DetailSection — reusable card section with icon + title for detail pages
"use client";

import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DetailSection({
  icon,
  title,
  children,
}: {
  icon?: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          {icon} {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

/* ─── DetailMetadataGrid — date/created/updated info ─── */
export interface MetaField {
  label: string;
  value?: string | null;
  format?: "date" | "datetime";
}

export function DetailMetadataGrid({ fields }: { fields: MetaField[] }) {
  const visible = fields.filter(
    (f) => f.value && f.value !== "\u2014" && f.value !== "null",
  );
  if (visible.length === 0) return null;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
          {visible.map((f) => (
            <div key={f.label}>
              <p className="font-semibold mb-1">{f.label}</p>
              <p>
                {f.format === "datetime" && f.value
                  ? new Date(f.value).toLocaleString()
                  : f.format === "date" && f.value
                    ? new Date(f.value).toLocaleDateString()
                    : f.value}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
