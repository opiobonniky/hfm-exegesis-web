import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { TriviaFormData } from "../hooks/useAdminAddTriviaQuestionPage";
import { tt } from '@/components/languages/hardcodedTranslate';

interface TriviaExplanationSectionProps {
  form: TriviaFormData;
  onFormChange: React.Dispatch<React.SetStateAction<TriviaFormData>>;
}

export function TriviaExplanationSection({ form, onFormChange }: TriviaExplanationSectionProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <Label>{tt("Explanation")}</Label>
        <Textarea
          value={form.explanation}
          onChange={(e) => onFormChange((p) => ({ ...p, explanation: e.target.value }))}
          placeholder={tt("Why this answer is correct...")}
          rows={3}
        />
      </CardContent>
    </Card>
  );
}
