// Support — reader-facing complaints / messages to the team (thin page).
"use client";

import { ArrowLeft, LifeBuoy, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { tt } from "@/components/languages/hardcodedTranslate";
import { useSupportPage } from "../hooks/useSupportPage";
import {
  SupportComposer,
  SupportFaq,
  SupportThread,
  SupportTicketList,
} from "../components";
import { SUPPORT_EXPECTED_REPLY_WINDOW, SUPPORT_FILTERS } from "../constants";
import { SupportPushBanner } from '../components/SupportPushBanner';

export default function Support() {
  const { data, actions } = useSupportPage();
  const h = { ...data, ...actions };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {tt("Back")}
        </button>

        <div className="flex items-start gap-3 rounded-2xl border border-border bg-muted/30 p-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/15">
            <LifeBuoy className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-bold text-foreground">{tt("Support")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {SUPPORT_EXPECTED_REPLY_WINDOW}
              {h.unreadCount > 0 && ` · ${h.unreadCount} ${tt("unread replies")}`}
            </p>
          </div>
          <button
            type="button"
            onClick={h.openComposer}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            {tt("New message")}
          </button>
        </div>

        <SupportPushBanner audience="user" />

        {h.composerOpen && (
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">{tt("New message")}</h2>
              <button
                type="button"
                onClick={h.closeComposer}
                className="rounded-full p-1.5 text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <SupportComposer
              subject={h.subject}
              message={h.message}
              category={h.category}
              priority={h.priority}
              submitting={h.submitting}
              canSubmit={h.canSubmit}
              onChangeSubject={h.setSubject}
              onChangeMessage={h.setMessage}
              onChangeCategory={h.setCategory}
              onChangePriority={h.setPriority}
              attachment={h.attachment}
              uploadingAttachment={h.uploadingAttachment}
              onSelectFile={h.selectAttachment}
              onClearAttachment={h.clearAttachment}
              onSubmit={h.submit}
              onCancel={h.closeComposer}
            />
          </div>
        )}

        <SupportFaq
          onAsk={prefill => {
            h.openComposerWith(prefill);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {SUPPORT_FILTERS.map(filter => (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => h.changeFilter(filter.id)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                    h.filter === filter.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:bg-muted/60",
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {h.loading ? (
              <div className="py-14 text-center text-sm text-muted-foreground">
                {tt("Loading your messages…")}
              </div>
            ) : h.error && h.tickets.length === 0 ? (
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                {h.error}
                <button
                  type="button"
                  onClick={h.refresh}
                  className="ml-2 font-semibold underline"
                >
                  {tt("Try again")}
                </button>
              </div>
            ) : (
              <SupportTicketList
                tickets={h.tickets}
                onSelect={h.openThread}
                emptyMessage={tt("Send us a message about anything that is not working.")}
              />
            )}
          </div>

          <div className="min-h-[320px]">
            {h.loadingThread ? (
              <div className="flex h-full items-center justify-center rounded-2xl border border-border text-sm text-muted-foreground">
                {tt("Loading conversation…")}
              </div>
            ) : h.activeTicket ? (
              <div className="rounded-2xl border border-border bg-card p-4">
                <SupportThread
                  ticket={h.activeTicket}
                  reply={h.reply}
                  sending={h.sending}
                  attachment={h.attachment}
                  uploadingAttachment={h.uploadingAttachment}
                  onChangeReply={h.setReply}
                  onSend={h.sendReply}
                  onSelectFile={h.selectAttachment}
                  onClearAttachment={h.clearAttachment}
                  onMessagesVisible={h.markThreadRead}
                />
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-border p-8 text-center">
                <LifeBuoy className="mb-3 h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-semibold text-foreground">
                  {tt("Select a conversation")}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {tt("Or start a new message to reach our team.")}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
