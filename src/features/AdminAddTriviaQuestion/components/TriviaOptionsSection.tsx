import { Plus, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { TriviaFormData } from "../hooks/useAdminAddTriviaQuestionPage";

interface TriviaOptionsSectionProps {
  form: TriviaFormData;
  onFormChange: React.Dispatch<React.SetStateAction<TriviaFormData>>;
  updateOption: (index: number, value: string) => void;
  addOption: () => void;
  removeOption: (index: number) => void;
}

export function TriviaOptionsSection({ form, onFormChange, updateOption, addOption, removeOption }: TriviaOptionsSectionProps) {
  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <Label className="mb-2 block">Answer Options *</Label>
        <div className="space-y-2">
          {form.options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onFormChange((p) => ({ ...p, correctOptionIndex: i }))}
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors",
                  form.correctOptionIndex === i
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : "border-muted-foreground/30 text-muted-foreground hover:border-primary"
                )}
                title="Mark as correct answer"
              >
                {String.fromCharCode(65 + i)}
              </button>
              <Input value={opt} onChange={(e) => updateOption(i, e.target.value)} placeholder={`Option ${String.fromCharCode(65 + i)}`} />
              {form.options.length > 4 && (
                <Button variant="ghost" size="icon" onClick={() => removeOption(i)} className="h-8 w-8 text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" className="mt-2" onClick={addOption}>
          <Plus className="mr-1 h-3 w-3" /> Add Option
        </Button>
        <p className="text-xs text-muted-foreground mt-1">Click the letter to mark the correct answer.</p>
      </CardContent>
    </Card>
  );
}
