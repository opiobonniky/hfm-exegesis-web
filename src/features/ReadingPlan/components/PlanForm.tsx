import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Save, ArrowLeft } from "lucide-react";

interface PlanFormProps {
  initialData?: any;
  saving: boolean;
  onSave: (data: any) => void;
  onBack?: () => void;
}

export function PlanForm({ initialData, saving, onSave, onBack }: PlanFormProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    onSave({
      title: fd.get("title"),
      description: fd.get("description"),
      duration: Number(fd.get("duration")),
      difficulty: fd.get("difficulty"),
      category: fd.get("category"),
      startDate: fd.get("startDate"),
    });
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <CardTitle>{initialData ? "Edit Reading Plan" : "Create Reading Plan"}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" defaultValue={initialData?.title || ""} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" defaultValue={initialData?.description || ""} rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (days)</Label>
              <Input id="duration" name="duration" type="number" min={1} defaultValue={initialData?.duration || 30} />
            </div>
            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select name="difficulty" defaultValue={initialData?.difficulty || "medium"}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select name="category" defaultValue={initialData?.category || "general"}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="gospels">Gospels</SelectItem>
                  <SelectItem value="epistles">Epistles</SelectItem>
                  <SelectItem value="old-testament">Old Testament</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input id="startDate" name="startDate" type="date" defaultValue={initialData?.startDate || ""} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            {onBack && <Button type="button" variant="outline" onClick={onBack}>Cancel</Button>}
            <Button type="submit" disabled={saving} className="bg-primary hover:bg-primary/90">
              <Save className="w-4 h-4 mr-2" /> {saving ? "Saving..." : initialData ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}