import { useListenStagePage } from "../hooks/useListenStagePage";
export default function ListenStage(props: any) {
  const p = useListenStagePage(props);
  const { audioVerses, audioLoading, audioError, playing, done, showSettings, setShowSettings, audio, speedText, handleStart, handleToggle, handleReset } = p;
  return (
    <div className="flex flex-col gap-3 pt-2">

      {/* ── HERO ── */}
      <section className="relative overflow-hidden rounded-[1.6rem] border border-blue-500/15 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.24),transparent_34%),linear-gradient(135deg,rgba(37,99,235,0.13),rgba(14,165,233,0.06),transparent)] shadow-sm">
        <div className="absolute -right-12 top-2 h-32 w-32 rounded-full bg-sky-400/10 blur-3xl" />
        <div className="absolute -left-10 bottom-0 h-28 w-28 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="relative px-4 py-4 sm:px-5">
          <CathedralArch />
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-500 text-white shadow-lg shadow-blue-500/25 ring-1 ring-white/20">
                <Ear className="h-6 w-6" />
              </div>
              <div>
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.22em] text-blue-700 dark:text-blue-300">
                    Step 2 of 4
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                    {stageLabel}
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-muted/50 border border-border/30">
                    <Timer className="w-2.5 h-2.5 text-muted-foreground/50" />
                    <span className="text-[8px] font-semibold text-muted-foreground/60">5–15 min</span>
                </div>
                <h2 className="text-2xl font-black tracking-tight text-foreground">Listen</h2>
                <p className="mt-0.5 max-w-md text-xs leading-5 text-muted-foreground/75">
                  Hear the passage repeated until its words settle into memory.
                </p>
            </div>
            {passageRef && (
              <Badge
                variant="outline"
                className="hidden shrink-0 rounded-full border-blue-500/20 bg-background/60 px-3 py-1 text-[10px] font-black text-blue-700 shadow-sm backdrop-blur sm:inline-flex dark:text-blue-300"
              >
                <BookOpen className="mr-1 h-3 w-3" />
                {passageRef}
              </Badge>
            )}
          </div>
        </div>
      </section>
      {!listenComplete && !done ? (
        <>
          {/* ── BEFORE PLAYING (repeat selection) ── */}
          {!playing && !audioLoading && (
            <section>
              <div className="rounded-[1.35rem] bg-gradient-to-br from-card via-card to-blue-500/5 border border-blue-500/15 shadow-sm overflow-hidden">
                {repeatCount > 0 ? (
                  <div className="flex flex-col items-center py-6 px-4 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-3 ring-1 ring-blue-500/15">
                      <Repeat className="w-5 h-5 text-blue-500" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Completed <span className="font-bold text-foreground">{repeatCount}</span> of{" "}
                      <span className="font-bold text-foreground">{selectedRepeats}</span> readings
                    </p>
                    <div className="flex items-center gap-1.5 mt-1 mb-3">
                      {Array.from({ length: selectedRepeats }, (_, i) => (
                        <div
                          key={i}
                          className={cn(
                            "w-7 h-7 rounded-lg border-2 flex items-center justify-center text-[9px] font-bold transition-all",
                            i < repeatCount
                              ? "bg-blue-500 border-blue-500 text-white shadow-sm shadow-blue-500/20"
                              : "border-border/40 text-muted-foreground/40",
                          )}
                        >
                          {i + 1}
                        </div>
                      ))}
                    <Button onClick={handleStart} className="gap-1.5 h-9 text-xs font-bold rounded-lg shadow shadow-blue-500/20 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 dark:from-blue-500 dark:to-blue-400 text-white border-0">
                      <Play className="w-3 h-3 fill-current" />
                      Resume Reading
                    </Button>
                  </div>
                ) : (
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center ring-1 ring-blue-500/15">
                        <Headphones className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-foreground">Number of Readings</p>
                        <p className="text-[11px] text-muted-foreground/65">How many times would you like to hear the passage?</p>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {listenOptions.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => onUpdate({ selectedRepeats: opt.value })}
                            "relative py-3 rounded-2xl text-sm font-black border transition-all active:scale-[0.97] [touch-action:manipulation] text-center shadow-sm",
                            selectedRepeats === opt.value
                              ? "bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-500/20"
                              : "bg-background/60 text-foreground border-border/50 hover:border-blue-300 dark:hover:border-blue-600/40 hover:bg-blue-50/40 dark:hover:bg-blue-950/20",
                          <span className="text-sm">{opt.label}</span>
                          <span className="block text-[8px] font-normal opacity-60 mt-px">
                            {opt.value === 1 ? "once" : opt.value === 2 ? "twice" : `${opt.value} times`}
                          </span>
                        </button>
                    <Button
                      onClick={handleStart}
                      className="gap-1.5 w-full h-10 text-xs font-black rounded-2xl shadow shadow-blue-500/20 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 dark:from-blue-500 dark:to-blue-400 text-white border-0"
                    >
                      Begin {listenOptions.find((o) => o.value === selectedRepeats)?.label || `${selectedRepeats}x`} Reading
                )}
            </section>
          )}
          {/* ── AUDIO PLAYER ── */}
          {playing && (
                <div className="p-4">
                  {/* Status with animated waveform */}
                  <div className="text-center mb-3">
                    <div className={cn(
                      "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all",
                      audio.isPlaying
                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 ring-1 ring-blue-200/50 dark:ring-blue-700/30"
                        : "bg-muted/50 text-muted-foreground",
                    )}>
                      <WaveformAnimation
                        active={audio.isPlaying}
                        activeColor="rgb(59, 130, 246)"
                        inactiveColor="rgb(156, 163, 175)"
                      />
                      <span>{audio.isPlaying ? "Listening" : "Paused"}</span>
                  {/* Verse progress */}
                  {audio.totalVerses > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-[9px] text-muted-foreground/60 mb-1">
                        <span className="tabular-nums font-medium">
                          Verse {Math.min(audio.currentVerseIdx + 1, audio.totalVerses)} of {audio.totalVerses}
                        </span>
                        <span className="tabular-nums font-mono text-blue-500 dark:text-blue-400 font-bold">{speedText}</span>
                      <div className="w-full h-1 rounded-full bg-muted/60 overflow-hidden">
                          className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-500 dark:from-blue-500 dark:to-blue-400 transition-all duration-300"
                          style={{
                            width: `${audio.totalVerses > 0 ? ((audio.currentVerseIdx + 1) / audio.totalVerses) * 100 : 0}%`,
                          }}
                        />
                  )}
                  {/* Repeat progress */}
                  <div className="flex flex-col items-center gap-1 mb-3">
                    <p className="text-[9px] font-black text-muted-foreground/55 uppercase tracking-[0.18em]">Readings</p>
                    <div className="flex items-center gap-1.5">
                            "w-8 h-8 rounded-lg border-2 flex items-center justify-center text-[10px] font-bold transition-all duration-300",
                              : i === repeatCount && audio.isPlaying
                                ? "border-blue-400 dark:border-blue-500 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 animate-pulse"
                                : "border-border/40 bg-transparent text-muted-foreground/40",
                  {/* Loading/error */}
                  {audioLoading && (
                    <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground py-1">
                      <span className="w-2.5 h-2.5 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
                      Loading passage audio...
                  {audioError && !audio.isPlaying && (
                    <div className="text-center py-1">
                      <p className="text-[11px] text-destructive font-medium">Could not load audio for this passage.</p>
                  {/* Play/Pause main button */}
                  <div className="flex items-center justify-center gap-3 my-3">
                    {audio.isPlaying && audio.totalVerses > 1 && (
                      <button
                        onClick={audio.skipBackward}
                        disabled={audio.currentVerseIdx === 0}
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all disabled:opacity-30 disabled:cursor-not-allowed [touch-action:manipulation] active:scale-90"
                      >
                        <SkipBack className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={handleToggle}
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-sky-400 dark:from-blue-500 dark:to-sky-400 flex items-center justify-center shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 active:scale-90 transition-all"
                      {audio.isPaused ? (
                        <Play className="w-6 h-6 text-white fill-current ml-0.5" />
                      ) : (
                        <Pause className="w-6 h-6 text-white fill-white" />
                      )}
                    </button>
                        onClick={audio.skipForward}
                        disabled={audio.currentVerseIdx >= audio.totalVerses - 1}
                        <SkipForward className="w-3.5 h-3.5" />
                  {/* Controls row */}
                  <div className="flex items-center justify-center gap-1.5 flex-wrap">
                      onClick={() => { audio.stopPlayback(); fetchAndPlayPassage(); }}
                      className="h-7 px-2.5 rounded-lg border border-border/50 text-[9px] font-bold text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all flex items-center gap-1 [touch-action:manipulation] active:scale-95"
                      <RotateCcw className="w-2.5 h-2.5" />
                      Restart
                      onClick={audio.cycleSpeed}
                      className="h-7 px-2.5 rounded-lg border border-border/50 text-[9px] font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all [touch-action:manipulation] active:scale-95"
                      title="Playback speed"
                      <Timer className="w-2.5 h-2.5 inline mr-0.5" />
                      {speedText}
                    {audio.voices.length > 0 && (
                      <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
                        {audio.voices.slice(0, 4).map((v) => (
                          <button
                            key={v.voiceId}
                            onClick={() => audio.setVoice(v)}
                            className={cn(
                              "shrink-0 text-[8px] font-bold h-7 px-2 rounded-lg border transition-all active:scale-95 [touch-action:manipulation]",
                              audio.selectedVoice?.voiceId === v.voiceId
                                ? "bg-blue-500 text-white border-blue-500 shadow-sm"
                                : "bg-card text-muted-foreground border-border/50 hover:border-blue-300 dark:hover:border-blue-600/40",
                            )}
                          >
                            {v.name.split(" ")[0]}
                          </button>
                        ))}
                      onClick={handleReset}
                      className="h-7 px-2.5 rounded-lg border border-border/50 text-[9px] font-bold text-destructive/70 hover:text-destructive hover:bg-destructive/5 transition-all [touch-action:manipulation] active:scale-95"
                      <RotateCcw className="w-2.5 h-2.5 inline mr-0.5" />
                      Reset
        </>
      ) : (
        /* ── COMPLETION STATE ── */
        <section>
          <div className="rounded-[1.35rem] bg-gradient-to-br from-card via-card to-blue-500/5 border border-blue-500/15 shadow-sm overflow-hidden">
            <div className="relative p-5 text-center">
              <div className="absolute inset-0 bg-gradient-to-b from-blue-50/30 to-transparent dark:from-blue-950/10 pointer-events-none" />
              <div className="relative">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-400/30 to-blue-400/5 dark:from-blue-500/20 dark:to-blue-500/5 flex items-center justify-center mx-auto mb-3 shadow-md ring-1 ring-blue-300/20 dark:ring-blue-600/10">
                  <CheckCircle2 className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                <h2 className="text-xl font-bold text-foreground tracking-tight mb-0.5">Amen</h2>
                <div className="w-10 h-0.5 bg-gradient-to-r from-transparent via-blue-400/50 to-transparent mx-auto mt-0.5 mb-2" />
                <p className="text-sm text-muted-foreground/80 max-w-xs mx-auto">
                  You have dwelled in the Word.
                <p className="text-[10px] text-muted-foreground/60 mt-1 mb-4">
                  The passage was read <span className="font-bold text-foreground">{repeatCount}</span> time{repeatCount !== 1 ? "s" : ""}.
                <div className="flex flex-col gap-1.5 max-w-[220px] mx-auto">
                  <Button
                    variant="outline"
                    onClick={handleStart}
                    className="gap-1.5 h-9 text-xs font-semibold rounded-lg border-border/60"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Listen Again
                  </Button>
                    onClick={onAdvance}
                    className="gap-1.5 h-9 text-xs font-bold rounded-lg shadow shadow-blue-500/20 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 dark:from-blue-500 dark:to-blue-400 text-white border-0"
                    Continue to Learn
                    <ChevronRight className="w-3 h-3" />
        </section>
      )}
      {/* ── CARRY FORWARD ── */}
      {!listenComplete && !done && (
        <section className="rounded-xl bg-gradient-to-r from-violet-500/[0.04] to-transparent border border-violet-500/20 p-3">
          <div className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0 mt-0.5">
              <Brain className="w-3 h-3 text-violet-500" />
            <div>
              <p className="text-[10px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-0.5">
                What you'll carry forward &rarr; Learn
              </p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                After hearing the Word, you'll move to the <strong className="text-foreground">Learn</strong> stage,
                where you'll explore original languages, commentaries, cross-references, and historical context.
    </div>
  );
}
