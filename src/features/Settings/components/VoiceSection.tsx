import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Volume2, Save, Play } from "lucide-react";

interface VoiceSectionProps {
  settings: any;
  saving: boolean;
  onSave: (data: any) => void;
}
export function VoiceSection({ settings, saving, onSave }: VoiceSectionProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    onSave({
      voiceId: fd.get("voiceId"),
      rate: Number(fd.get("rate")),
      pitch: Number(fd.get("pitch")),
    });
  };
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="w-5 h-5" />
          Voice Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Voice</Label>
            <Select name="voiceId" defaultValue={settings?.voiceId || "default"}>
              <SelectTrigger><SelectValue placeholder="Select a voice" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default Voice</SelectItem>
                <SelectItem value="male1">Male Voice 1</SelectItem>
                <SelectItem value="female1">Female Voice 1</SelectItem>
              </SelectContent>
            </Select>
          </div>
            <Label>Rate: {settings?.rate || 1.0}</Label>
            <input name="rate" type="range" min="0.5" max="2" step="0.1" defaultValue={settings?.rate || 1.0} className="w-full" />
            <Label>Pitch: {settings?.pitch || 1.0}</Label>
            <input name="pitch" type="range" min="0.5" max="2" step="0.1" defaultValue={settings?.pitch || 1.0} className="w-full" />
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex items-center gap-2">
              <Play className="w-4 h-4" /> Preview
            </Button>
            <Button type="submit" disabled={saving} className="bg-primary hover:bg-primary/90">
              <Save className="w-4 h-4 mr-2" /> {saving ? "Saving..." : "Save"}
        </form>
      </CardContent>
    </Card>
  );
