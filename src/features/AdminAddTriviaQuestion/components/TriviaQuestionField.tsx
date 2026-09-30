import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { TriviaFormData } from "../hooks/useAdminAddTriviaQuestionPage";
import { tt } from '@/components/languages/hardcodedTranslate';

interface TriviaQuestionFieldProps {
  form: TriviaFormData;
  onFormChange: React.Dispatch<React.SetStateAction<TriviaFormData>>;
}

export function TriviaQuestionField({ form, onFormChange }: TriviaQuestionFieldProps) {
  return (
    <Card>
      <CardHeader><CardTitle>{tt("Question")}</CardTitle></CardHeader>
      <CardContent>
        <Label>{tt("Question *")}</Label>
        <Textarea
          value={form.question}
          onChange={(e) => onFormChange((p) => ({ ...p, question: e.target.value }))}
          placeholder={tt("Who built the ark?")}
          rows={2}
        />
      </CardContent>
    </Card>
  );
}
