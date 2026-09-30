import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TriviaFormData } from "../hooks/useAdminAddTriviaQuestionPage";
import { tt } from '@/components/languages/hardcodedTranslate';

interface TriviaQuestionHeaderProps {
  isEditing: boolean;
  form: TriviaFormData;
  saving: boolean;
  onGoBack: () => void;
  onSave: () => void;
}

export function TriviaQuestionHeader({ isEditing, form, saving, onGoBack, onSave }: TriviaQuestionHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onGoBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">{isEditing ? tt("Edit Trivia Question") : tt("Add Trivia Question")}</h1>
      </div>
      <Button onClick={onSave} disabled={!form.question.trim() || saving}>
        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
        {isEditing ? tt("Update") : tt("Save")}
      </Button>
    </div>
  );
}
