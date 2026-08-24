import { useLabReviewPage } from "../hooks/useLabReviewPage";
export default function LabReview() {
  const p = useLabReviewPage();
  const { navigate, sessionId, session, loading, error, activeStage, setActiveStage } = p;
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="flex-shrink-0 border-b bg-background/80 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 sm:px-6 h-14">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => navigate(-1)}
              className="w-8 h-8 rounded-xl bg-muted/40 flex items-center justify-center hover:bg-muted/60 active:scale-[0.93] transition-all shrink-0"
            >
              <ArrowLeft className="w-4 h-4 text-foreground" />
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
          <TierBadge />
        </div>
      </header>

      {/* Hero */}
      <div className="relative bg-gradient-to-b from-primary/[0.03] to-transparent border-b border-border/30">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-8 pb-10 text-center">
          <div className="relative inline-flex mb-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-500/5 flex items-center justify-center shadow-lg shadow-green-500/10 ring-1 ring-green-500/20">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/30">
              <Sparkles className="w-3 h-3 text-white" />
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight mb-2">
            {session.passageRef}
          </h2>
          <p className="text-sm text-muted-foreground/70 mb-4">
            Study completed &middot; {formatDate(session.updatedOn || session.createdOn)} &middot; {completedStages}/4 stages with content
          </p>
          {/* Meta chips */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-[11px] font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Completed
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/60 border border-border/50 text-muted-foreground text-[11px] font-semibold">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(session.createdOn)}
              <BookMarked className="w-3.5 h-3.5" />
              Ch. {session.chapter}
            {session.isPublic ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 text-[11px] font-semibold">
                <Globe className="w-3.5 h-3.5" />
                Public
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/60 border border-border/50 text-muted-foreground text-[11px] font-semibold">
                <Lock className="w-3.5 h-3.5" />
                Private
            )}
      </div>
      {/* Sticky stage nav */}
      <div className="sticky top-14 z-20 bg-background/80 backdrop-blur-md border-b border-border/30">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-1 py-2 overflow-x-auto scrollbar-none">
            {STAGES.map(({ key, icon: Icon, label, color, iconBg }) => (
              <button
                key={key}
                onClick={() => scrollToStage(key)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all shrink-0",
                  activeStage === key
                    ? `bg-${color}-500/10 text-${color}-600 shadow-sm`
                    : "text-muted-foreground/60 hover:text-foreground hover:bg-muted/50",
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
                {stageContent[key] && (
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              </button>
            ))}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-6 pb-20">
          <div className="space-y-6">
            {STAGES.map(({ key, icon: Icon, label, desc, gradient, border, iconBg }) => {
              const hasContent = stageContent[key];
              const renderLook = () => {
                if (!session.lookNotes) return <EmptyBlock icon={MessageSquareQuote} text="No observation notes recorded." />;
                try {
                  const parsed = JSON.parse(session.lookNotes);
                  if (typeof parsed === "object" && parsed !== null) {
                    const entries = Object.entries(parsed).filter(([_, v]) => (v as string).trim());
                    if (entries.length === 0) return <EmptyBlock icon={MessageSquareQuote} text="No observation notes recorded." />;
                    return (
                      <div className="space-y-4">
                        {entries.map(([key, val], i) => (
                          <div key={key} className="relative pl-4 border-l-2 border-amber-300/40">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-5 h-5 rounded-full bg-amber-500/10 flex items-center justify-center">
                                <span className="text-[9px] font-bold text-amber-600">{i + 1}</span>
                              </div>
                              <p className="text-[10px] font-semibold text-amber-600/70 uppercase tracking-wider">Prompt {Number(key) + 1}</p>
                            </div>
                            <ContentBlock>{val as string}</ContentBlock>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return <ContentBlock>{session.lookNotes}</ContentBlock>;
                } catch {
                }
              };
              const renderListen = () => {
                const duration = session.listenElapsed || session.listenDuration;
                if (!duration && !session.listenCompleted) return <EmptyBlock icon={Timer} text="No listening time recorded." />;
                return (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-500/5 border border-blue-500/15">
                        <Timer className="w-4 h-4 text-blue-500" />
                        <div>
                          <p className="text-[10px] font-semibold text-blue-500/70 uppercase tracking-wider">Duration</p>
                          <p className="text-sm font-bold text-foreground">{formatDuration(duration)}</p>
                        </div>
                      {session.listenCompleted && (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/5 border border-green-500/15">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <div>
                            <p className="text-[10px] font-semibold text-green-500/70 uppercase tracking-wider">Status</p>
                            <p className="text-sm font-bold text-green-600">Completed</p>
                      )}
                    </div>
                  </div>
                );
              const renderLearn = () => {
                const hasNotes = !!session.learnNotes;
                const hasWords = strongsWords.length > 0;
                const hasIds = strongsIds.length > 0;
                if (!hasNotes && !hasWords && !hasIds) return <EmptyBlock icon={GraduationCap} text="No study notes recorded." />;
                  <div className="space-y-4">
                    {hasNotes && (
                      <div>
                        <p className="text-[10px] font-bold text-purple-500/70 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <BookMarked className="w-3 h-3" />
                          Study Notes
                        </p>
                        <ContentBlock>{session.learnNotes}</ContentBlock>
                    )}
                    {hasWords && (
                          <BookText className="w-3 h-3" />
                          Strong's Words Studied
                        <div className="flex flex-wrap gap-1.5">
                          {strongsWords.map((sw, i) => (
                            <div key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/8 border border-amber-500/15 text-[11px] font-medium text-amber-700 dark:text-amber-300">
                              <BookText className="w-3 h-3" />
                              {sw.surfaceText || sw.strongsId}
                              {sw.lemma && <span className="italic opacity-70">({sw.lemma})</span>}
                          ))}
                    {hasIds && (
                        <p className="text-[10px] font-bold text-purple-500/70 uppercase tracking-wider mb-1.5">Strong's IDs</p>
                        <p className="text-xs font-mono text-muted-foreground/70">{strongsIds.join(" · ")}</p>
              const renderAbide = () => {
                const hasReflection = !!session.abideReflection;
                const hasPrayer = !!session.abidePrayer;
                const hasApp = !!session.abideApplication;
                const hasTags = tags.length > 0;
                if (!hasReflection && !hasPrayer && !hasApp && !hasTags) return <EmptyBlock icon={Sparkles} text="No abide content recorded." />;
                    {hasReflection && (
                        <p className="text-[10px] font-bold text-rose-500/70 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Quote className="w-3 h-3" />
                          Reflection
                        <ContentBlock>{session.abideReflection}</ContentBlock>
                    {hasPrayer && (
                          <Heart className="w-3 h-3" />
                          Prayer
                        <ContentBlock>{session.abidePrayer}</ContentBlock>
                    {hasApp && (
                          <Sparkles className="w-3 h-3" />
                          Application
                        <ContentBlock>{session.abideApplication}</ContentBlock>
                    {hasTags && (
                          <Tags className="w-3 h-3" />
                          Tags
                          {tags.map((tag, i) => (
                            <div key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/8 border border-primary/15 text-[11px] font-medium text-primary">
                              <Tags className="w-3 h-3" />
                              {tag}
              const renderContent = () => {
                switch (key) {
                  case "look": return renderLook();
                  case "listen": return renderListen();
                  case "learn": return renderLearn();
                  case "abide": return renderAbide();
                  default: return null;
              return (
                <div
                  id={`stage-${key}`}
                  key={key}
                  className={cn(
                    "rounded-2xl border overflow-hidden transition-shadow",
                    hasContent ? `${gradient} ${border} shadow-sm` : "border-border/40 bg-muted/20",
                  )}
                >
                  {/* Stage header */}
                  <div className={cn(
                    "px-5 py-4 flex items-center gap-3",
                    hasContent ? "border-b border-border/20" : "border-b border-border/10",
                  )}>
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                      hasContent ? iconBg : "bg-muted/50 text-muted-foreground/40",
                    )}>
                      <Icon className="w-5 h-5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={cn(
                          "text-sm font-bold",
                          hasContent ? "text-foreground" : "text-muted-foreground/50",
                        )}>
                          {label}
                        {!hasContent && (
                          <Badge variant="outline" className="text-[9px] px-1.5 py-0 text-muted-foreground/40 border-border/30">
                            No data
                          </Badge>
                        )}
                      <p className={cn(
                        "text-[10px] tracking-wider uppercase",
                        hasContent ? "text-muted-foreground/60" : "text-muted-foreground/30",
                      )}>
                        {desc}
                      </p>
                    {hasContent && (
                      <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                  {/* Stage content */}
                  {hasContent && (
                    <div className="px-5 py-4 space-y-1">
                      {renderContent()}
                </div>
              );
            })}
            {/* Session metadata */}
            <div className="rounded-2xl bg-gradient-to-b from-card to-card/80 border border-border/40 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-border/20">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-muted/60 flex items-center justify-center">
                    <Layers className="w-3.5 h-3.5 text-muted-foreground/60" />
                  <p className="text-xs font-bold text-foreground">Session Details</p>
              <div className="px-5 py-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-wider mb-1">Book</p>
                    <p className="text-sm font-medium text-foreground">{session.bookName}</p>
                    <p className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-wider mb-1">Chapter</p>
                    <p className="text-sm font-medium text-foreground">{session.chapter}</p>
                    <p className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-wider mb-1">Created</p>
                    <p className="text-sm font-medium text-foreground">{new Date(session.createdOn).toLocaleDateString()}</p>
                    <p className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-wider mb-1">Updated</p>
                    <p className="text-sm font-medium text-foreground">{new Date(session.updatedOn).toLocaleDateString()}</p>
            {/* Back link */}
            <div className="flex justify-center pt-2 pb-4">
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-border/40 hover:border-border/80 transition-all"
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Studies
    </div>
  );
}
