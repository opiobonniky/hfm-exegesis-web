// VerseExplanationDetail — thin page composing hook + components (no inline HTML)
"use client";

import { useVerseExplanationDetail } from "../hooks/useVerseExplanationDetail";
import VerseExplanationDetailHeader from "../components/VerseExplanationDetailHeader";
import { VerseExplanationDetailContent } from "../components/VerseExplanationDetailContent";
import BookOverviewLoading from "../../Bible/components/BookOverviewLoading";
import BookOverviewEmpty from "../../Bible/components/BookOverviewEmpty";
import '../../Bible/theme/bookOverview.css';

export default function VerseExplanationDetail() {
  const { data, actions } = useVerseExplanationDetail();
  const item = data.item;
  const reference = item
    ? `${item.bookName} ${item.chapter}:${item.verseNumber}${item.verseEnd ? `–${item.verseEnd}` : ''}`
    : "";

  return (
    <div className="book-prologue-view consumer-book-overview h-full flex flex-col">
      <VerseExplanationDetailHeader
        reference={reference}
        onBack={actions.backToList}
        onEdit={() =>
          actions.navigate("/admin/add-verse-explanation", {
            state: { explanationId: item?.id },
          })
        }
      />

      <main className="flex-1 min-h-0 overflow-y-auto">
        {data.loading ? (
          <BookOverviewLoading />
        ) : item ? (
          <VerseExplanationDetailContent item={item} />
        ) : (
          <BookOverviewEmpty />
        )}
      </main>
    </div>
  );
}
