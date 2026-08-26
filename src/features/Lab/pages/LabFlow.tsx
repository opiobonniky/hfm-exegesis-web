/**
 * LabFlow — thin page composing extracted components.
 * Uses useLabFlowPage which wraps useLabFlow for session management
 * plus passage data fetching.
 */
import Gate from "@/components/Gate";
import { useLabFlowPage } from "../hooks/useLabFlowPage";
import { useRTL } from "@/providers/RTLProvider";

export default function LabFlow() {
  const { isRtl } = useRTL();
  const h = useLabFlowPage();
  const { lab } = h;

  if (lab.loading) return <div className="flex items-center justify-center p-12 text-muted-foreground">Loading study session...</div>;

  return (
    <Gate>
      <div dir={isRtl ? "rtl" : "ltr"} className="min-h-screen flex flex-col bg-background">
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
            {/* Passage selector stage */}
            {lab.stage === "passage" && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl border bg-card">
                  <p className="text-sm font-medium">Select a Bible passage for your study</p>
                  {h.previewText && (
                    <pre className="mt-2 text-xs text-muted-foreground whitespace-pre-wrap max-h-48 overflow-y-auto">{h.previewText}</pre>
                  )}
                </div>
              </div>
            )}

            {/* Look stage */}
            {lab.stage === "look" && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl border bg-card">
                  <p className="text-sm font-medium mb-2">📖 Look — Read and Observe</p>
                  {h.versesLoading ? (
                    <p className="text-xs text-muted-foreground">Loading passage...</p>
                  ) : (
                    <div className="text-sm leading-7">
                      {h.passageVerses.map((v) => (
                        <span key={v.verse}>
                          <sup className="text-[9px] font-bold text-amber-500 mr-px">{v.verse}</sup>
                          {v.text}{" "}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Listen stage */}
            {lab.stage === "listen" && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl border bg-card">
                  <p className="text-sm font-medium mb-2">🎧 Listen — Hear the Word</p>
                  <p className="text-xs text-muted-foreground">Listen to the passage and let it sink deep into your heart.</p>
                </div>
              </div>
            )}

            {/* Learn stage */}
            {lab.stage === "learn" && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl border bg-card">
                  <p className="text-sm font-medium mb-2">📝 Learn — Study the Word</p>
                  {h.wordsLoading && <p className="text-xs text-muted-foreground">Loading word study data...</p>}
                  {h.verseWords.length > 0 && (
                    <div className="space-y-1">
                      {h.verseWords.map((w, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm" onClick={() => w.strongsId && h.handleWordTap(w.strongsId)}>
                          <span className="font-medium">{w.surfaceText}</span>
                          {w.lemma && <span className="text-xs text-amber-600 italic">{w.lemma}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Abide stage */}
            {lab.stage === "abide" && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl border bg-card">
                  <p className="text-sm font-medium mb-2">🙏 Abide — Reflect and Apply</p>
                  <p className="text-xs text-muted-foreground">Take a moment to reflect on what you've learned.</p>
                </div>
              </div>
            )}

            {/* Completed */}
            {lab.stage === "completed" && (
              <div className="p-6 rounded-xl border bg-card text-center">
                <p className="text-lg font-bold mb-2">✅ Study Complete!</p>
                <p className="text-sm text-muted-foreground">Your study has been saved to your journal.</p>
              </div>
            )}

            {/* Navigation actions */}
            {lab.stage !== "passage" && lab.stage !== "completed" && (
              <div className="flex items-center gap-3">
                <button onClick={() => lab.saveCurrentProgress()} className="px-4 py-2 rounded-lg border text-sm font-medium hover:bg-muted transition-colors">
                  Save Progress
                </button>
                <button onClick={() => {
                  if (lab.stage === "look") lab.advanceLook();
                  else if (lab.stage === "listen") lab.advanceListen();
                  else if (lab.stage === "learn") lab.advanceLearn();
                  else if (lab.stage === "abide") lab.saveAbide();
                }} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                  Continue
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Gate>
  );
}
