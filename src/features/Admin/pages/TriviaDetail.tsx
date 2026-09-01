// TriviaDetail — thin page composing hook + components (no inline HTML)
"use client";

import { DetailLoading, DetailPageHeader, DetailContent, DetailBackButton } from "../components/DetailPageLayout";
import { DetailMetadataGrid } from "../components/DetailSection";
import { TriviaDetailContent, TriviaDetailActions } from "../components/TriviaDetailContent";
import { useTriviaDetail } from "../hooks/useTriviaDetail";

export default function TriviaDetail() {
  const h = useTriviaDetail();

  if (h.loading) return <DetailLoading />;
  if (!h.question) return null;

  return (
    <div className="min-h-screen bg-background">
      <DetailPageHeader
        icon={null}
        title="Trivia Question Detail"
        subtitle={`Question #${h.question.id}`}
        onBack={() => h.navigate("/admin/trivia")}
      />

      <DetailContent>
        <TriviaDetailContent question={h.question} />

        <DetailMetadataGrid
          fields={[
            { label: "Created", value: h.question.createdOn, format: "datetime" },
            { label: "Updated", value: h.question.updatedOn, format: "datetime" },
          ]}
        />

        <TriviaDetailActions
          onEdit={() => h.navigate(`/admin/trivia/edit/${h.question!.id}`)}
          onBack={() => h.navigate("/admin/trivia")}
        />
      </DetailContent>
    </div>
  );
}
