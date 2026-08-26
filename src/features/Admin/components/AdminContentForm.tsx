import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, ArrowLeft } from "lucide-react";

interface AdminContentFormProps {
  type: "verse" | "devotion" | "exegesis";
  initialData?: Record<string, string | undefined>;
  saving: boolean;
  onSave: (data: Record<string, FormDataEntryValue>) => void;
  onBack?: () => void;
}
export function AdminContentForm({ type, initialData, saving, onSave, onBack }: AdminContentFormProps) {
  const title = type === "verse" ? "Daily Verse" : type === "devotion" ? "Daily Devotion" : "Daily Exegesis";
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data: Record<string, FormDataEntryValue> = {
      title: fd.get("title"),
      description: fd.get("description"),
      reference: fd.get("reference"),
      status: fd.get("status"),
      date: fd.get("date"),
    };
    if (type === "verse") {
      data.verseText = fd.get("verseText");
    } else if (type === "devotion") {
      data.content = fd.get("content");
    } else {
      data.exegesis = fd.get("exegesis");
    }
    onSave(data);
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
          <CardTitle>{initialData ? `Edit ${title}` : `Add ${title}`}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" defaultValue={initialData?.title || ""} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reference">Reference</Label>
              <Input id="reference" name="reference" defaultValue={initialData?.reference || ""} placeholder="e.g. John 3:16" />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select name="status" defaultValue={initialData?.status || "draft"}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input id="date" name="date" type="date" defaultValue={initialData?.date || ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" defaultValue={initialData?.description || ""} rows={2} />
          </div>
          {type === "verse" && (
            <div className="space-y-2">
              <Label htmlFor="verseText">Verse Text</Label>
              <Textarea id="verseText" name="verseText" defaultValue={initialData?.verseText || ""} rows={3} />
            </div>
          )}
          {type === "devotion" && (
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea id="content" name="content" defaultValue={initialData?.content || ""} rows={8} />
            </div>
          )}
          {type === "exegesis" && (
            <div className="space-y-2">
              <Label htmlFor="exegesis">Exegesis</Label>
              <Textarea id="exegesis" name="exegesis" defaultValue={initialData?.exegesis || ""} rows={8} />
            </div>
          )}
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
