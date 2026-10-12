import { Loader2, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { tt } from "@/components/languages/hardcodedTranslate";
import {
  MAX_MESSAGE_LENGTH,
  MAX_SUBJECT_LENGTH,
  MIN_MESSAGE_LENGTH,
  SUPPORT_CATEGORY_OPTIONS,
  SUPPORT_PRIORITIES,
  SUPPORT_QUICK_PROMPTS,
} from "../constants";
import type { SupportComposerProps } from "../types";

export function SupportComposer({
  subject,
  message,
  category,
  priority,
  submitting,
  canSubmit,
  onChangeSubject,
  onChangeMessage,
  onChangeCategory,
  onChangePriority,
  onSubmit,
  onCancel,
}: SupportComposerProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {tt("What is this about?")}
        </label>
        <div className="flex flex-wrap gap-2">
          {SUPPORT_CATEGORY_OPTIONS.map(option => (
            <button
              key={option.id}
              type="button"
              onClick={() => onChangeCategory(option.id)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                category === option.id
                  ? option.className
                  : "border-border text-muted-foreground hover:bg-muted/60",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {tt("Subject")}
        </label>
        <input
          type="text"
          value={subject}
          onChange={e => onChangeSubject(e.target.value)}
          maxLength={MAX_SUBJECT_LENGTH}
          placeholder={tt("Short summary of the issue")}
          className="min-h-11 w-full rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {tt("Tell us more")}
        </label>
        <textarea
          value={message}
          onChange={e => onChangeMessage(e.target.value)}
          maxLength={MAX_MESSAGE_LENGTH}
          rows={6}
          placeholder={tt("What happened? What did you expect instead?")}
          className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <div className="mt-1 text-right text-xs text-muted-foreground">
          {message.trim().length}/{MAX_MESSAGE_LENGTH}
        </div>

        {message.trim().length < MIN_MESSAGE_LENGTH && (
          <div className="mt-2 flex flex-wrap gap-2">
            {SUPPORT_QUICK_PROMPTS.map(prompt => (
              <button
                key={prompt}
                type="button"
                onClick={() => onChangeMessage(prompt)}
                className="rounded-full bg-muted px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted/70"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {tt("How urgent is it?")}
        </label>
        <div className="flex flex-wrap gap-2">
          {SUPPORT_PRIORITIES.map(option => (
            <button
              key={option.id}
              type="button"
              onClick={() => onChangePriority(option.id)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                priority === option.id
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border text-muted-foreground hover:bg-muted/60",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted/60"
        >
          {tt("Cancel")}
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          {tt("Send to support")}
        </button>
      </div>
    </div>
  );
}
