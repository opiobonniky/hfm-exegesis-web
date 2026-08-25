"use client";

import { ArrowLeft, Save, Loader2, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useAdminAddTriviaQuestionPage } from "../hooks/useAdminAddTriviaQuestionPage";

const DIFFICULTY_OPTIONS = ["easy", "medium", "hard"];

export default function AdminAddTriviaQuestionPage() {
  const h = useAdminAddTriviaQuestionPage();

  if (h.loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => h.navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">{h.isEditing ? "Edit Trivia Question" : "Add Trivia Question"}</h1>
        </div>
        <Button onClick={h.handleSave} disabled={!h.form.question.trim() || h.saving}>
          {h.saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {h.isEditing ? "Update" : "Save"}
        </Button>
      </div>

      {/* Question */}
      <Card>
        <CardHeader><CardTitle>Question</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Question *</Label>
            <Textarea value={h.form.question} onChange={(e) => h.setForm((p) => ({ ...p, question: e.target.value }))}
              placeholder="Who built the ark?" rows={2} />
          </div>
          <div>
            <Label className="mb-2 block">Answer Options *</Label>
            <div className="space-y-2">
              {h.form.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <button type="button" onClick={() => h.setForm((p) => ({ ...p, correctOptionIndex: i }))}
                    className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors",
                      h.form.correctOptionIndex === i ? "border-emerald-500 bg-emerald-500 text-white" : "border-muted-foreground/30 text-muted-foreground hover:border-primary")}
                    title="Mark as correct answer">
                    {String.fromCharCode(65 + i)}
                  </button>
                  <Input value={opt} onChange={(e) => h.updateOption(i, e.target.value)} placeholder={`Option ${String.fromCharCode(65 + i)}`} />
                  {h.form.options.length > 4 && (
                    <Button variant="ghost" size="icon" onClick={() => h.removeOption(i)} className="h-8 w-8 text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" className="mt-2" onClick={h.addOption}>
              <Plus className="mr-1 h-3 w-3" /> Add Option
            </Button>
            <p className="text-xs text-muted-foreground mt-1">Click the letter to mark the correct answer.</p>
          </div>
          <div>
            <Label>Explanation</Label>
            <Textarea value={h.form.explanation} onChange={(e) => h.setForm((p) => ({ ...p, explanation: e.target.value }))}
              placeholder="Why this answer is correct..." rows={3} />
          </div>
        </CardContent>
      </Card>

      {/* Metadata */}
      <Card>
        <CardHeader><CardTitle>Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Category *</Label>
              <Input value={h.form.category} onChange={(e) => h.setForm((p) => ({ ...p, category: e.target.value }))}
                placeholder="e.g. creation, gospel, prophets" />
            </div>
            <div>
              <Label>Difficulty</Label>
              <Select value={h.form.difficulty} onValueChange={(v) => h.setForm((p) => ({ ...p, difficulty: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DIFFICULTY_OPTIONS.map((d) => (<SelectItem key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-between border-t pt-4">
            <div className="flex items-center gap-2">
              <Switch checked={h.form.isActive} onCheckedChange={(checked) => h.setForm((p) => ({ ...p, isActive: checked }))} />
              <Label>Active (visible to users)</Label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
