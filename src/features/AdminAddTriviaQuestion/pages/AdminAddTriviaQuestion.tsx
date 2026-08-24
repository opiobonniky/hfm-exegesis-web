"use client";

import { useAdminAddTriviaQuestionPage } from "../hooks/useAdminAddTriviaQuestionPage";
import {
  ArrowLeft,
  Save,
  Loader2,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { sendPostRequest } from "@/services/api";
import { routes } from "@/components/Routes/routes";
import { BIBLE_BOOKS } from "../DailyContent/constants";
interface TriviaFormData {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: string;
  difficulty: string;
  bookName: string;
  chapter: string;
  verseNumber: string;
  isActive: boolean;
}
const DIFFICULTY_OPTIONS = ["easy", "medium", "hard"];
export default function AdminAddTriviaQuestionPage() {
  const h = useAdminAddTriviaQuestionPage();
        question: form.question.trim(),
        optionsJson: JSON.stringify(form.options),
        correctAnswer: form.correctAnswer,
        explanation: form.explanation.trim(),
        category: form.category.trim(),
        difficulty: form.difficulty,
        bookName: form.bookName || null,
        chapter: form.chapter ? Number(form.chapter) : null,
        verseNumber: form.verseNumber ? Number(form.verseNumber) : null,
        isActive: form.isActive,
      };
      const endpoint = isEditing
        ? "/admin/trivia/update-question"
        : "/admin/trivia/add-question";
      const res = await sendPostRequest(endpoint, payload);
      if (res.data?.returnCode === 200) {
        toast({
          title: isEditing ? "Question Updated" : "Question Created",
          description: "Trivia question saved successfully",
        });
        navigate(routes.adminTrivia.path);
      } else {
        throw new Error(res.data?.returnMessage || "Failed to save");
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to save question",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }, [canSave, form, isEditing, questionId, navigate, toast]);
  if (loading) {
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
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">
            {isEditing ? "Edit Trivia Question" : "Add Trivia Question"}
          </h1>
        </div>
        <Button onClick={handleSave} disabled={!canSave || saving}>
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {isEditing ? "Update" : "Save"}
        </Button>
      {/* Question */}
      <Card>
        <CardHeader>
          <CardTitle>Question</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Question *</Label>
            <Textarea
              value={form.question}
              onChange={(e) => setForm((p) => ({ ...p, question: e.target.value }))}
              placeholder="Who built the ark?"
              rows={2}
            />
          </div>
          {/* Answer Options */}
            <Label className="mb-2 block">Answer Options *</Label>
            <div className="space-y-2">
              {form.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, correctAnswer: i }))}
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors",
                      form.correctAnswer === i
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-muted-foreground/30 text-muted-foreground hover:border-primary"
                    )}
                    title="Mark as correct answer"
                  >
                    {String.fromCharCode(65 + i)}
                  </button>
                  <Input
                    value={opt}
                    onChange={(e) => updateOption(i, e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + i)}`}
                  />
                  {form.options.length > 4 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeOption(i)}
                      className="h-8 w-8 text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" className="mt-2" onClick={addOption}>
              <Plus className="mr-1 h-3 w-3" />
              Add Option
            </Button>
            <p className="text-xs text-muted-foreground mt-1">
              Click the letter to mark the correct answer.
            </p>
          {/* Explanation */}
            <Label>Explanation</Label>
              value={form.explanation}
              onChange={(e) => setForm((p) => ({ ...p, explanation: e.target.value }))}
              placeholder="Why this answer is correct..."
              rows={3}
        </CardContent>
      </Card>
      {/* Metadata */}
          <CardTitle>Details</CardTitle>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Category *</Label>
              <Input
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                placeholder="e.g. creation, gospel, prophets"
              />
              <Label>Difficulty</Label>
              <Select
                value={form.difficulty}
                onValueChange={(v) => setForm((p) => ({ ...p, difficulty: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTY_OPTIONS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d.charAt(0).toUpperCase() + d.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
          <div className="grid grid-cols-3 gap-4">
              <Label>Book</Label>
                value={form.bookName}
                onValueChange={(v) => setForm((p) => ({ ...p, bookName: v }))}
                  <SelectValue placeholder="Select book" />
                  {BIBLE_BOOKS.map((book) => (
                    <SelectItem key={book} value={book}>
                      {book}
              <Label>Chapter</Label>
                type="number"
                min="1"
                value={form.chapter}
                onChange={(e) => setForm((p) => ({ ...p, chapter: e.target.value }))}
                placeholder="1"
              <Label>Verse</Label>
                value={form.verseNumber}
                onChange={(e) => setForm((p) => ({ ...p, verseNumber: e.target.value }))}
                placeholder="16"
          <div className="flex items-center justify-between border-t pt-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={form.isActive}
                onCheckedChange={(checked) => setForm((p) => ({ ...p, isActive: checked }))}
              <Label>Active (visible to users)</Label>
    </div>
  );
