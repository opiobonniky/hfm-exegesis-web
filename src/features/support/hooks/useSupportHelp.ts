// Search, topic filtering and expand/collapse state for the Support help centre.
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { routes } from "@/components/Routes/routes";
import {
  MAX_SUBJECT_LENGTH,
  SUPPORT_HELP_FEATURED_LIMIT,
  SUPPORT_HELP_ITEMS,
  SUPPORT_HELP_TOPICS,
} from "../constants";
import type { SupportCategory, SupportHelpItem } from "../types";
import {
  filterSupportHelp,
  groupSupportHelp,
  helpItemToSubject,
  pickFeaturedHelp,
  type SupportHelpTopicFilter,
} from "../utils";

export interface SupportHelpAskPrefill {
  category: SupportCategory;
  subject: string;
}

export function useSupportHelp(options?: {
  onAsk?: (prefill: SupportHelpAskPrefill) => void;
}) {
  const navigate = useNavigate();
  const onAsk = options?.onAsk;
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState<SupportHelpTopicFilter>("all");
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  const filtered = useMemo(
    () => filterSupportHelp(SUPPORT_HELP_ITEMS, query, topic),
    [query, topic],
  );
  const groups = useMemo(
    () => groupSupportHelp(filtered, SUPPORT_HELP_TOPICS),
    [filtered],
  );
  const featured = useMemo(
    () => pickFeaturedHelp(SUPPORT_HELP_ITEMS, SUPPORT_HELP_FEATURED_LIMIT),
    [],
  );
  const isSearching = query.trim().length > 0;

  const isExpanded = useCallback((id: string) => expandedIds.includes(id), [expandedIds]);

  const toggleItem = useCallback((id: string) => {
    setExpandedIds(current =>
      current.includes(id) ? current.filter(item => item !== id) : [...current, id],
    );
  }, []);

  const changeTopic = useCallback((next: SupportHelpTopicFilter) => setTopic(next), []);
  const clearQuery = useCallback(() => setQuery(""), []);
  const openHelpCenter = useCallback(() => setOpen(true), []);
  const closeHelpCenter = useCallback(() => setOpen(false), []);

  /** Follow the "Open ..." link under an answer. */
  const openLink = useCallback(
    (item: SupportHelpItem) => {
      if (!item.link) return;
      const route = routes[item.link.route as keyof typeof routes];
      if (route) navigate(route.path);
    },
    [navigate],
  );

  /** Reader still needs help — open the composer prefilled with the question. */
  const askAbout = useCallback(
    (item: SupportHelpItem) => {
      onAsk?.({
        category: item.category,
        subject: helpItemToSubject(item, MAX_SUBJECT_LENGTH),
      });
    },
    [onAsk],
  );

  return {
    topics: SUPPORT_HELP_TOPICS,
    allItems: SUPPORT_HELP_ITEMS,
    featured,
    filtered,
    groups,
    query,
    topic,
    isSearching,
    resultCount: filtered.length,
    open,
    setQuery,
    clearQuery,
    changeTopic,
    isExpanded,
    toggleItem,
    openLink,
    askAbout,
    openHelpCenter,
    closeHelpCenter,
  };
}

export type SupportHelpController = ReturnType<typeof useSupportHelp>;