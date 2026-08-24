import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/Badge";
import { ExternalLink, BookOpen, FileText, Video } from "lucide-react";
import type { Resource } from "../types";

const typeIcons: Record<string, any> = {
  article: FileText,
  video: Video,
  commentary: BookOpen,
};
interface ResourceCardProps {
  resource: Resource;
}
export function ResourceCard({ resource }: ResourceCardProps) {
  const Icon = typeIcons[resource.type] || FileText;
  return (
    <Card className="bg-card border-border hover:border-primary/30 transition-all">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-foreground text-sm line-clamp-1">{resource.title}</h3>
              <Badge variant="outline" className="shrink-0 text-xs">{resource.type}</Badge>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">{resource.description}</p>
            {resource.source && <p className="text-xs text-muted-foreground mt-1">Source: {resource.source}</p>}
          {resource.url && (
            <a href={resource.url} target="_blank" rel="noopener noreferrer" className="shrink-0">
              <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-primary" />
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
