// TriviaDetail — thin page composing hook + components (no inline HTML)
"use client";

import { DetailLoading, DetailPageHeader, DetailContent, DetailBackButton } from "../components/DetailPageLayout";
import { DetailMetadataGrid } from "../components/DetailSection";
import { TriviaDetailContent, TriviaDetailActions } from "../components/TriviaDetailContent";
import { useTriviaDetail } from "../hooks/useTriviaDetail";

export default function TriviaDetail() {
  const { data, actions } = useTriviaDetail();

  if (data.loading) return <DetailLoading />;
  if (!data.question) return null;

  return (
    <div className="min-h-screen bg-background">
      <DetailPageHeader
        icon={null}
        title="Trivia Question Detail"
        subtitle={`Question #${data.question.id}`}
        onBack={() => actions.navigate("/admin/trivia")}
      />

      <DetailContent>
        <TriviaDetailContent question={data.question} />

        <DetailMetadataGrid
          fields={[
            { label: "Created", value: data.question.createdOn, format: "datetime" },
            { label: "Updated", value: data.question.updatedOn, format: "datetime" },
          ]}
        />

        <TriviaDetailActions
          onEdit={() => actions.navigate(`/admin/trivia/edit/${data.question!.id}`)}
          onBack={() => actions.navigate("/admin/trivia")}
        />
      </DetailContent>
    </div>
  );
}
