// AdminSupport — admin inbox for reader complaints / messages (thin page).
"use client";

import {
  Inbox,
  LifeBuoy,
  MessageSquareText,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { tt } from "@/components/languages/hardcodedTranslate";
import { API_BASE_URL } from '@/services/api';
import { SupportPushBanner } from '../components/SupportPushBanner';
import { useAdminSupportPage } from "../hooks/useAdminSupportPage";
import { SupportThread, SupportTicketList } from "../components";
import {
  SUPPORT_CATEGORY_OPTIONS,
  SUPPORT_FILTERS,
  SUPPORT_STATUS_OPTIONS,
} from "../constants";

const STATUS_TONES = {
  open: "bg-sky-500",
  in_progress: "bg-amber-500",
  resolved: "bg-emerald-500",
  closed: "bg-slate-400",
} as const;

export default function AdminSupport() {
  const { data, actions } = useAdminSupportPage();
  const h = { ...data, ...actions };

  return (
    <div className="min-h-full bg-gradient-to-b from-primary/[0.04] via-background to-background p-4 md:p-6">
      <div className="mx-auto w-full max-w-7xl space-y-5">
        <section className="relative overflow-hidden rounded-3xl border border-border/80 bg-card p-5 shadow-sm md:p-6">
          <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative flex flex-wrap items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
              <Inbox className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
                  {tt("Support Inbox")}
                </h1>
                <span className={cn('rounded-full px-2 py-1 text-xs font-semibold', h.connected ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600')}>
                  {h.connected ? 'Chat connected' : 'Reconnecting · automatic sync enabled'}
                </span>
                {!!h.stats?.unreadCount && (
                  <span className="rounded-full bg-destructive px-2.5 py-1 text-xs font-bold text-destructive-foreground">
                    {h.stats.unreadCount} {tt("unread")}
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {h.totalCount} {tt("conversations")} · {tt("Reader questions and issue reports")}
              </p>
              <p className="mt-1 break-all text-xs text-muted-foreground" title={API_BASE_URL}>
                Backend: {API_BASE_URL}
              </p>
            </div>
            <button
              type="button"
              onClick={h.refresh}
              disabled={h.loading}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-background px-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-50"
            >
              <RefreshCw className={cn("h-4 w-4", h.loading && "animate-spin")} />
              <span className="hidden sm:inline">{tt("Refresh")}</span>
            </button>
          </div>
        </section>

        <SupportPushBanner audience="admin" />

        {h.stats && (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {SUPPORT_STATUS_OPTIONS.map(option => (
              <button
                key={option.id}
                type="button"
                onClick={() => h.changeFilter(option.id)}
                className={cn(
                  "group rounded-2xl border bg-card p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md",
                  h.filter === option.id
                    ? "border-primary ring-2 ring-primary/10"
                    : "border-border/80",
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {option.label}
                  </span>
                  <span className={cn("h-2.5 w-2.5 rounded-full", STATUS_TONES[option.id])} />
                </div>
                <div className="mt-3 text-3xl font-bold tracking-tight text-foreground">
                  {h.stats?.counts?.[option.id] ?? 0}
                </div>
              </button>
            ))}
          </div>
        )}

        <section className="rounded-2xl border border-border/80 bg-card p-3 shadow-sm md:p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[240px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={h.search}
                onChange={e => h.setSearch(e.target.value)}
                onKeyDown={e => e.key === "Enter" && h.runSearch()}
                placeholder={tt("Search subject, code or email…")}
                aria-label={tt("Search support conversations")}
                className="min-h-11 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm outline-none transition-shadow focus:ring-2 focus:ring-ring"
              />
            </div>
            <select
              value={h.category}
              onChange={e => h.changeCategory(e.target.value as never)}
              aria-label={tt("Filter by category")}
              className="min-h-11 rounded-xl border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">{tt("All categories")}</option>
              {SUPPORT_CATEGORY_OPTIONS.map(option => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {SUPPORT_FILTERS.map(filter => (
              <button
                key={filter.id}
                type="button"
                onClick={() => h.changeFilter(filter.id)}
                className={cn(
                  "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
                  h.filter === filter.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:bg-muted",
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </section>

        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)]">
          <section className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <MessageSquareText className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-bold text-foreground">{tt("Conversations")}</h2>
              </div>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                {h.totalCount}
              </span>
            </div>
            <div className="max-h-[62vh] overflow-y-auto p-3 lg:max-h-[calc(100dvh-13rem)]">
            {h.loading ? (
              <div className="py-14 text-center text-sm text-muted-foreground">
                {tt("Loading conversations…")}
              </div>
            ) : h.error ? (
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                {h.error}
                <button type="button" onClick={h.refresh} className="ml-2 font-semibold underline">
                  {tt("Try again")}
                </button>
              </div>
            ) : (
              <SupportTicketList
                tickets={h.tickets}
                onSelect={h.openThread}
                showUser
                emptyMessage={tt("No conversations match these filters.")}
              />
            )}
            </div>
          </section>

          <section className="min-h-[360px] lg:sticky lg:top-4 lg:h-[calc(100dvh-7rem)]">
            {h.loadingThread ? (
              <div className="flex h-full items-center justify-center rounded-2xl border border-border bg-card text-sm text-muted-foreground shadow-sm">
                {tt("Loading conversation…")}
              </div>
            ) : h.activeTicket ? (
              <div className="h-full overflow-hidden rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
                <p className="mb-2 text-xs text-muted-foreground" role="status">
                  {h.connected && h.peerOnline ? 'Reader online' : 'Reader offline'}
                </p>
                <SupportThread
                  ticket={h.activeTicket}
                  viewerRole="admin"
                  reply={h.reply}
                  sending={h.sending}
                  attachment={h.attachment}
                  uploadingAttachment={h.uploadingAttachment}
                  onChangeReply={h.setReply}
                  onSend={h.sendReply}
                  onSelectFile={h.selectAttachment}
                  onClearAttachment={h.clearAttachment}
                  onMessagesVisible={h.markThreadRead}
                  footer={
                    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
                      {SUPPORT_STATUS_OPTIONS.map(option => (
                        <button
                          key={option.id}
                          type="button"
                          disabled={h.updatingStatus || h.activeTicket?.status === option.id}
                          onClick={() => h.changeStatus(option.id)}
                          className={cn(
                            "rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
                            h.activeTicket?.status === option.id
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border text-muted-foreground hover:bg-muted/60",
                            "disabled:opacity-60",
                          )}
                        >
                          {option.label}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={h.closeThread}
                        className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3.5 w-3.5" />
                        {tt("Close panel")}
                      </button>
                    </div>
                  }
                />
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/60 p-8 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                  <LifeBuoy className="h-7 w-7 text-primary" />
                </div>
                <p className="text-sm font-semibold text-foreground">
                  {tt("Select a conversation")}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {tt("Reply to a reader or update the ticket status.")}
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
