import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Save } from "lucide-react";

interface ReadingSectionProps {
  settings: any;
  saving: boolean;
  onSave: (data: any) => void;
}
export function ReadingSection({ settings, saving, onSave }: ReadingSectionProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    onSave({
      fontSize: fd.get("fontSize"),
      theme: fd.get("theme"),
      showVerseNumbers: fd.get("showVerseNumbers") === "on",
      autoPlayAudio: fd.get("autoPlayAudio") === "on",
    });
  };
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Reading Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Font Size</Label>
            <Select name="fontSize" defaultValue={settings?.fontSize || "medium"}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>
            <Label>Theme</Label>
            <Select name="theme" defaultValue={settings?.theme || "system"}>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
          <div className="flex items-center justify-between">
            <Label>Show Verse Numbers</Label>
            <Switch name="showVerseNumbers" defaultChecked={settings?.showVerseNumbers ?? true} />
            <Label>Auto-play Audio</Label>
            <Switch name="autoPlayAudio" defaultChecked={settings?.autoPlayAudio ?? false} />
          <Button type="submit" disabled={saving} className="bg-primary hover:bg-primary/90">
            <Save className="w-4 h-4 mr-2" /> {saving ? "Saving..." : "Save"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
