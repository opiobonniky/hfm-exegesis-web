import { useNavigate } from "react-router-dom";
import { useLabReviewPage } from "../hooks/useLabReviewPage";

export default function LabReview() {
  const p = useLabReviewPage();
  const { navigate, sessionId, session, loading, error, activeStage, setActiveStage } = p;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading study review...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <p className="text-sm text-muted-foreground">{error || "Session not found"}</p>
          <button onClick={() => navigate(-1)} className="text-sm text-primary underline">Go back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="flex-shrink-0 border-b bg-background/80 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 sm:px-6 h-14">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => navigate(-1)}
              className="w-8 h-8 rounded-xl bg-muted/40 flex items-center justify-center hover:bg-muted/60 active:scale-[0.93] transition-all shrink-0"
            >
              <span className="w-4 h-4">←</span>
            </button>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-semibold text-foreground truncate leading-tight">
                {session.passageRef}
              </h1>
              <p className="text-[10px] text-muted-foreground tracking-widest uppercase leading-none mt-0.5">
                Study Review
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Content area - simplified for build fix */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-6 pb-20">
          <div className="space-y-6">
            <div className="rounded-2xl border border-border/40 bg-muted/20 overflow-hidden">
              <div className="px-5 py-4">
                <p className="text-sm font-semibold">{session.passageRef}</p>
                <p className="text-xs text-muted-foreground mt-1">Book: {session.bookName} · Ch. {session.chapter}</p>
              </div>
            </div>
          </div>

          {/* Back link */}
          <div className="flex justify-center pt-2 pb-4">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-border/40 hover:border-border/80 transition-all"
            >
              ← Back to Studies
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
