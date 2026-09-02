import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { TriviaFormData } from "../hooks/useAdminAddTriviaQuestionPage";

interface TriviaQuestionFieldProps {
  form: TriviaFormData;
  onFormChange: React.Dispatch<React.SetStateAction<TriviaFormData>>;
}

export function TriviaQuestionField({ form, onFormChange }: TriviaQuestionFieldProps) {
  return (
    <Card>
      <CardHeader><CardTitle>Question</CardTitle></CardHeader>
      <CardContent>
        <Label>Question *</Label>
        <Textarea
          value={form.question}
          onChange={(e) => onFormChange((p) => ({ ...p, question: e.target.value }))}
          placeholder="Who built the ark?"
          rows={2}
        />
      </CardContent>
    </Card>
  );
}
