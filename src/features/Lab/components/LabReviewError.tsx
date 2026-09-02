interface Props {
  error: string | null;
  onGoBack: () => void;
}

export function LabReviewError({ error, onGoBack }: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-3">
        <p className="text-sm text-muted-foreground">{error || "Session not found"}</p>
        <button onClick={onGoBack} className="text-sm text-primary underline">Go back</button>
      </div>
    </div>
  );
}
