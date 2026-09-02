import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  goBack: () => void;
  handleSave: () => void;
  saving: boolean;
}

export function PageHeader({ goBack, handleSave, saving }: Props) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={goBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Additional Information</h1>
          <p className="text-sm text-muted-foreground">Ministry details and emergency contacts</p>
        </div>
      </div>
      <Button onClick={handleSave} disabled={saving}>
        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
        Save
      </Button>
    </div>
  );
}
