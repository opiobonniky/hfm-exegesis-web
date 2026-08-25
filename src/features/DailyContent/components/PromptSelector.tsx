// PromptSelector — select related journal prompts for a verse explanation
import { Loader2, Check, Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Prompt { id: number; prompt: string; category: string }
interface Props {
  prompts: Prompt[];
  loading: boolean;
  selectedIds: number[];
  onToggle: (id: number) => void;
  t: any;
}
export function PromptSelector({ prompts, loading, selectedIds, onToggle, t }: Props) {
  if (!loading && prompts.length === 0) return null;
  return (
    <Card className="border-amber-200/50 bg-amber-50/30 dark:bg-amber-950/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Lightbulb className="w-4 h-4 text-amber-500" />
          {t.verseExplanations.relatedPrompts}
        </CardTitle>
        <CardDescription className="text-xs">{t.verseExplanations.promptsDesc}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" /> {t.verseExplanations.loadingPrompts}
          </div>
        ) : (
          <>
            {prompts.map((p) => {
              const sel = selectedIds.includes(p.id);
              return (
                <div
                  key={p.id}
                  onClick={() => onToggle(p.id)}
                  className={cn(
                    "bg-card dark:bg-background rounded-lg p-3 border text-sm cursor-pointer transition-all",
                    sel ? "border-amber-500 bg-amber-50/50 dark:bg-amber-950/30" : "border-amber-100/50 dark:border-amber-900/30 hover:border-amber-300",
                  )}
                >
                  <div className="flex items-start gap-2">
                    <div className={cn("w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 mt-0.5", sel ? "bg-amber-500 border-amber-500" : "border-amber-300")}>
                      {sel && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-foreground/80">{p.prompt}</span>
                  </div>
                  <div className="ml-7 mt-2"><Badge variant="outline" className="text-xs">{p.category}</Badge></div>
                </div>
              );
            })}
            {selectedIds.length > 0 && (
              <div className="text-xs text-muted-foreground pt-2">
                {t.verseExplanations.promptsSelected.replace("{n}", String(selectedIds.length))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
