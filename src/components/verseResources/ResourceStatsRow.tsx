import React from "react";
import { Badge } from "@/components/ui/badge";
import type { VerseResourceData } from "@/services/verseResourcesApi";

export function ResourceStatsRow({
  data,
}: {
  data: VerseResourceData;
}) {
  const stats = [
    { label: "Commentaries", count: data.commentaries?.length || 0, color: "#4F6EF7" },
    { label: "Cross Refs", count: data.crossReferences?.length || 0, color: "#0EA5E9" },
    { label: "Word Studies", count: data.wordStudies?.length || 0, color: "#8B5CF6" },
    { label: "Dictionary", count: data.dictionaryTerms?.length || 0, color: "#10B981" },
    { label: "Topics", count: data.relatedTopics?.length || 0, color: "#6366F1" },
  ];

  const visibleStats = stats.filter((s) => s.count > 0);

  if (visibleStats.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 mb-2.5">
      {visibleStats.map((stat) => (
        <Badge
          key={stat.label}
          variant="secondary"
          className="text-[10px] font-semibold px-2 py-0.5 gap-1"
        >
          <span style={{ color: stat.color }} className="font-extrabold">
            {stat.count}
          </span>
          <span className="text-muted-foreground">{stat.label}</span>
        </Badge>
      ))}
    </div>
  );
}
