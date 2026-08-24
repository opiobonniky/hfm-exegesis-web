import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/Badge";
import { Eye, Ear, BookOpen, Heart, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface LabStage {
  type: string;
  title: string;
  description: string;
  completed: boolean;
}
const stageIcons: Record<string, any> = {
  look: Eye,
  listen: Ear,
  learn: BookOpen,
  abide: Heart,
};
const stageColors: Record<string, string> = {
  look: "blue",
  listen: "purple",
  learn: "amber",
  abide: "green",
interface LabStageCardProps {
  stage: LabStage;
  onClick: () => void;
export function LabStageCard({ stage, onClick }: LabStageCardProps) {
  const Icon = stageIcons[stage.type] || BookOpen;
  const color = stageColors[stage.type] || "blue";
  return (
    <Card className="bg-card border-border hover:border-primary/30 transition-all cursor-pointer" onClick={onClick}>
      <CardContent className="p-4 flex items-center gap-4">
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", `bg-${color}-500/10`)}>
          <Icon className={cn("w-6 h-6", `text-${color}-500`)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">{stage.title}</h3>
            {stage.completed && <Badge variant="success" className="text-xs">Done</Badge>}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-1">{stage.description}</p>
        <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
      </CardContent>
    </Card>
  );
