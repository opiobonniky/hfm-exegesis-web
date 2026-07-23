import React from "react";
import { FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ResourceCard, SectionLabel } from "./shared";
import { STUDY_TOOL_LABELS, STUDY_TOOL_COLORS } from "./constants";
import type { StudyToolResource } from "@/services/verseResourcesApi";

export function StudyToolsSection({
  tools,
}: {
  tools: StudyToolResource[];
}) {
  if (!tools || tools.length === 0) return null;

  return (
    <div className="mb-6">
      <SectionLabel
        icon={<FileText className="w-3.5 h-3.5" />}
        label="Study Tools"
        color="#8B5CF6"
        count={tools.length}
      />
      <div className="space-y-2.5">
        {tools.map((tool) => {
          const toolColor = STUDY_TOOL_COLORS[tool.toolType] || "#8B5CF6";
          return (
            <ResourceCard key={tool.id} accentColor={toolColor}>
              <div className="flex items-start gap-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${toolColor}14` }}
                >
                  <FileText className="w-3.5 h-3.5" style={{ color: toolColor }} strokeWidth={2.2} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className="text-[10px] font-extrabold uppercase tracking-wider"
                      style={{ color: toolColor }}
                    >
                      {STUDY_TOOL_LABELS[tool.toolType] || tool.toolType}
                    </span>
                    {tool.bookName && (
                      <span className="text-[10px] font-medium text-muted-foreground">
                        {tool.bookName} {tool.chapter}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-bold text-foreground">{tool.label}</p>
                </div>
              </div>

              {tool.description && (
                <p className="text-sm text-muted-foreground leading-6 mt-2">{tool.description}</p>
              )}

              {tool.verseRefs && tool.verseRefs.length > 0 && (
                <div className="mt-2 rounded-lg bg-muted/30 border border-border/40 p-3 space-y-1.5">
                  {tool.verseRefs.map((ref, i) => (
                    <p key={i} className="text-xs text-foreground/70 leading-5">
                      <span className="font-bold text-foreground">{ref.verse}.</span> {ref.excerpt || ""}
                    </p>
                  ))}
                </div>
              )}

              {tool.studyToolWords && tool.studyToolWords.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {tool.studyToolWords.map((word) => {
                    const strongs = word.strongs;
                    const explanation = word.adminExplanation || strongs?.adminExplanation;
                    return (
                      <div
                        key={word.id}
                        className="rounded-lg bg-card border border-border p-3"
                      >
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-foreground">{word.surfaceText}</span>
                          {word.strongsId && (
                            <Badge
                              variant="outline"
                              className="text-[9px] font-bold px-1 py-0 font-mono"
                              style={{ color: toolColor, borderColor: `${toolColor}30`, backgroundColor: `${toolColor}08` }}
                            >
                              {word.strongsId}
                            </Badge>
                          )}
                          {strongs?.originalWord && (
                            <span className="text-[11px] font-semibold italic text-muted-foreground">
                              {strongs.originalWord}
                            </span>
                          )}
                        </div>
                        {(strongs?.transliteration || strongs?.shortDefinition) && (
                          <p className="text-[11px] text-muted-foreground mt-1">
                            {strongs?.transliteration ? `${strongs.transliteration} · ` : ""}
                            {strongs?.shortDefinition || ""}
                          </p>
                        )}
                        {explanation && (
                          <p className="text-[11px] text-muted-foreground italic mt-1 leading-relaxed">
                            {explanation}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </ResourceCard>
          );
        })}
      </div>
    </div>
  );
}
