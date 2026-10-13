import {
  ArrowRight,
  ChevronDown,
  HelpCircle,
  MessageSquarePlus,
  Search,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { tt } from "@/components/languages/hardcodedTranslate";
import { useSupportHelp, type SupportHelpAskPrefill } from "../hooks/useSupportHelp";
import type { SupportHelpItem } from "../types";

interface Props {
  /** Seed the composer with a question the reader still needs help with. */
  onAsk: (prefill: SupportHelpAskPrefill) => void;
}

/** One collapsible question with its answer, steps and follow-up actions. */
function FaqEntry({
  item,
  expanded,
  onToggle,
  onOpenLink,
  onAsk,
}: {
  item: SupportHelpItem;
  expanded: boolean;
  onToggle: (id: string) => void;
  onOpenLink: (item: SupportHelpItem) => void;
  onAsk: (item: SupportHelpItem) => void;
}) {
  const panelId = `support-faq-${item.id}`;

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        type="button"
        onClick={() => onToggle(item.id)}
        aria-expanded={expanded}
        aria-controls={panelId}
        className="flex w-full items-center justify-between gap-3 py-3.5 text-left"
      >
        <span
          className={cn(
            "text-sm font-semibold text-foreground",
            expanded && "text-primary",
          )}
        >
          {item.question}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            expanded && "rotate-180 text-primary",
          )}
        />
      </button>

      {expanded && (
        <div id={panelId} className="pb-4">
          <p className="text-sm leading-relaxed text-muted-foreground">{item.answer}</p>

          {!!item.steps?.length && (
            <ol className="mt-3 space-y-2">
              {item.steps.map((step, index) => (
                <li key={`${item.id}-step-${index}`} className="flex items-start gap-2">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[11px] font-bold text-primary">
                    {index + 1}
                  </span>
                  <span className="text-sm leading-relaxed text-foreground">{step}</span>
                </li>
              ))}
            </ol>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {!!item.link && (
              <button
                type="button"
                onClick={() => onOpenLink(item)}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:opacity-90"
              >
                {item.link.label}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => onAsk(item)}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
            >
              <MessageSquarePlus className="h-3.5 w-3.5" />
              {tt("Still need help?")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Frequently asked questions with search, topic chips and collapsible answers.
 * Renders inline on the Support page; the same hook drives both features.
 */
export function SupportFaq({ onAsk }: Props) {
  const help = useSupportHelp({ onAsk });

  if (help.groups.length === 0 && !help.isSearching) return null;

  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15">
          <HelpCircle className="h-4.5 w-4.5 text-primary" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold text-foreground">
            {tt("Frequently asked questions")}
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {tt("Quick answers before you message the team")}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          value={help.query}
          onChange={event => help.setQuery(event.target.value)}
          placeholder={tt("Search help")}
          className="h-11 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
        {help.isSearching && (
          <button
            type="button"
            onClick={help.clearQuery}
            className="rounded-full p-1 text-muted-foreground hover:bg-muted"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => help.changeTopic("all")}
          className={cn(
            "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
            help.topic === "all"
              ? "border-primary bg-primary/10 text-primary"
              : "border-border text-muted-foreground hover:bg-muted/60",
          )}
        >
          {tt("All")}
        </button>
        {help.topics.map(topic => (
          <button
            key={topic.id}
            type="button"
            onClick={() => help.changeTopic(topic.id)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
              help.topic === topic.id
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:bg-muted/60",
            )}
          >
            {topic.label}
          </button>
        ))}
      </div>

      {help.isSearching && (
        <p className="mt-3 text-xs text-muted-foreground">
          {help.resultCount} {help.resultCount === 1 ? tt("result") : tt("results")}
        </p>
      )}

      {help.groups.length === 0 ? (
        <div className="mt-3 rounded-xl border border-primary/30 bg-primary/5 p-4 text-center">
          <p className="text-sm font-semibold text-foreground">
            {tt("No answers match your search")}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {tt("Send us a message and the team will get back to you.")}
          </p>
        </div>
      ) : (
        <div className="mt-3">
          {help.groups.map(group => (
            <div key={group.topic.id} className="mt-2 first:mt-0">
              <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                {group.topic.label}
              </p>
              <p className="mb-1 mt-0.5 text-xs text-muted-foreground">
                {group.topic.description}
              </p>
              {group.items.map(item => (
                <FaqEntry
                  key={item.id}
                  item={item}
                  expanded={help.isExpanded(item.id)}
                  onToggle={help.toggleItem}
                  onOpenLink={help.openLink}
                  onAsk={help.askAbout}
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}