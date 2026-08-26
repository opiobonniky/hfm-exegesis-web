import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/LoadingState";
import { ArrowRight } from "lucide-react";
import type { LabStage } from "../hooks/useLabFlow";

interface StageContentProps {
  stage: LabStage;
  saving: boolean;
  onSave: (data: any) => void;
}
export function StageContent({ stage, saving, onSave }: StageContentProps) {
  if (!stage) return <LoadingState />;
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>{stage.title}</CardTitle>
        <p className="text-sm text-muted-foreground">{stage.description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="min-h-[200px] p-4 rounded-xl bg-muted/50 border border-border">
          <p className="text-sm text-muted-foreground">
            {stage.data ? "Stage completed - review your work" : "Complete this stage to continue"}
          </p>
        </div>
        <div className="flex justify-end">
          <Button
            onClick={() => onSave(stage.data)}
            disabled={saving || stage.completed}
            className="bg-primary hover:bg-primary/90"
          >
            {saving ? "Saving..." : stage.completed ? "Completed" : "Complete Stage"}
            {!stage.completed && !saving && <ArrowRight className="w-4 h-4 ml-2" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
