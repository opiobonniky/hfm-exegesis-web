import { useState, useCallback, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  startSession,
  getSession,
  saveStageProgress,
  saveProgress,
} from "@/services/exegesisApi";
import { sendPostRequest } from "@/services/api";
import { BOOK_NAMES } from "../constants";
import type { LabStage, LabFlowState } from "../types";

export function useLabFlow() {
  const [searchParams] = useSearchParams();

  const initialBook = searchParams.get("book") || "";
  const initialChapter = searchParams.get("chapter") || "";
  const initialVs = searchParams.get("verseStart") || "";
  const initialVe = searchParams.get("verseEnd") || "";
  const initialSessionId = searchParams.get("sessionId") || "";
  const initialStage = searchParams.get("stage") as LabStage | null;

  const [state, setState] = useState<LabFlowState>({
    sessionId: initialSessionId || null,
    stage: initialStage || (initialBook ? "look" : "passage"),
    completed: false,
    loading: false,
    saving: false,
    error: null,
    bookName: initialBook,
    chapter: initialChapter,
    verseStart: initialVs,
    verseEnd: initialVe,
    passageRef: "",
    lookNotes: "",
    currentPromptIdx: 0,
    selectedRepeats: 3,
    repeatCount: 0,
    listenComplete: false,
    learnNotes: "",
    learnTab: "exegesis",
    learnDataLoading: false,
    reflection: "",
    prayer: "",
    appText: "",
    tags: "",
    isPublic: false,
    journalEntryId: null,
    challengeText: "",
    resultsText: "",
  });

  const stateRef = useRef(state);
  stateRef.current = state;

  const update = useCallback((partial: Partial<LabFlowState>) => {
    setState((prev) => {
      const next = { ...prev, ...partial };
      stateRef.current = next;
      return next;
    });
  }, []);

  useEffect(() => {
    if (!initialSessionId) return;
    (async () => {
      update({ loading: true });
      try {
        const session = await getSession(initialSessionId);
        if (session) {
          update({
            sessionId: session.id,
            bookName: session.bookName || stateRef.current.bookName,
            chapter: session.chapter?.toString() || stateRef.current.chapter,
            verseStart: session.verseStart?.toString() || stateRef.current.verseStart,
            verseEnd: session.verseEnd?.toString() || stateRef.current.verseEnd,
            passageRef: session.passageRef || "",
            lookNotes: session.lookNotes || "",
            learnNotes: session.learnNotes || "",
            reflection: session.abideReflection || "",
            prayer: session.abidePrayer || "",
            appText: session.abideApplication || "",
            tags: session.abideTags || "",
            isPublic: session.isPublic ?? false,
            journalEntryId: session.journalEntryId || null,
            challengeText: session.challengeText || "",
            resultsText: session.resultsText || "",
            selectedRepeats: session.listenRepeats || 3,
            repeatCount: session.listenRepeatCount || 0,
            listenComplete: session.listenCompleted || false,
            loading: false,
          });
        }
      } catch {
        update({ loading: false, error: "Failed to load session" });
      }
    })();
  }, [initialSessionId]);

  const startSessionAction = useCallback(async () => {
    const { bookName, chapter, verseStart, verseEnd } = stateRef.current;
    if (!bookName || !chapter) {
      update({ error: "Please select a book and chapter" });
      return;
    }
    if (!verseStart) {
      update({ error: "Please select a starting verse" });
      return;
    }

    update({ loading: true, error: null });
    try {
      const session = await startSession({
        bookName,
        chapter: parseInt(chapter, 10),
        verseStart: parseInt(verseStart, 10),
        verseEnd: verseEnd ? parseInt(verseEnd, 10) : undefined,
      });
      if (session) {
        const passageRef = verseEnd
          ? `${bookName} ${chapter}:${verseStart}-${verseEnd}`
          : `${bookName} ${chapter}:${verseStart}`;
        update({
          sessionId: session.id,
          passageRef,
          stage: "look",
          loading: false,
        });
      } else {
        update({ loading: false, error: "Failed to start session" });
      }
    } catch (e: any) {
      update({ loading: false, error: e?.message || "Failed to start session" });
    }
  }, [update]);

  const goToStage = useCallback((stage: LabStage) => {
    update({ stage });
  }, [update]);

  const saveAndAdvance = useCallback(
    async (nextStage: LabStage, data: Record<string, any> = {}) => {
      const { sessionId, stage } = stateRef.current;
      if (!sessionId) {
        update({ stage: nextStage });
        return;
      }

      update({ saving: true, error: null });
      try {
        const endpoint =
          stage === "look"
            ? "look"
            : stage === "listen"
              ? "listen"
              : stage === "learn"
                ? "learn"
                : "abide";
        await saveStageProgress(sessionId, endpoint, data);
        update({ stage: nextStage, saving: false });
      } catch (e: any) {
        update({ saving: false, error: e?.message || "Failed to save" });
        update({ stage: nextStage });
      }
    },
    [update],
  );

  const saveCurrentProgress = useCallback(
    async (silent = false) => {
      const st = stateRef.current;
      if (!st.sessionId) return;

      update({ saving: true });
      try {
        const body: Record<string, any> = {};
        switch (st.stage) {
          case "look":
            body.lookNotes = st.lookNotes;
            break;
          case "listen":
            body.listenRepeats = st.selectedRepeats;
            body.listenRepeatCount = st.repeatCount;
            body.listenCompleted = st.listenComplete;
            break;
          case "learn":
            body.learnNotes = st.learnNotes;
            body.isPublic = st.isPublic;
            break;
          case "abide":
            body.abideReflection = st.reflection;
            body.abidePrayer = st.prayer;
            body.abideApplication = st.appText;
            body.abideTags = st.tags;
            body.isPublic = st.isPublic;
            break;
          case "apply":
            body.challengeText = st.challengeText;
            body.resultsText = st.resultsText;
            break;
          default:
            update({ saving: false });
            return;
        }
        await saveProgress(st.sessionId, body);
      } catch {
      } finally {
        update({ saving: false });
      }
    },
    [update],
  );

  const startListening = useCallback(() => {
    update({
      repeatCount: 0,
      listenComplete: false,
    });
  }, [update]);

  const incrementRepeat = useCallback(() => {
    setState((prev) => {
      const nextCount = prev.repeatCount + 1;
      const done = nextCount >= prev.selectedRepeats;
      return {
        ...prev,
        repeatCount: nextCount,
        listenComplete: done,
      };
    });
  }, []);

  const resetListening = useCallback(() => {
    update({
      repeatCount: 0,
      listenComplete: false,
    });
  }, [update]);

  const advanceLook = useCallback(async (notesOverride?: string) => {
    const lookNotes = notesOverride ?? stateRef.current.lookNotes;
    await saveAndAdvance("listen", { notes: lookNotes });
  }, [saveAndAdvance]);

  const advanceListen = useCallback(async () => {
    const { selectedRepeats } = stateRef.current;
    await saveAndAdvance("learn", { repeats: selectedRepeats });
  }, [saveAndAdvance]);

  const advanceLearn = useCallback(async () => {
    const { learnNotes, isPublic } = stateRef.current;
    await saveAndAdvance("abide", { notes: learnNotes, isPublic });
  }, [saveAndAdvance]);

  const saveAbide = useCallback(async () => {
    const st = stateRef.current;
    if (!st.sessionId) {
      update({ stage: "apply" });
      return;
    }

    update({ saving: true });
    try {
      await saveProgress(st.sessionId, {
        abideReflection: st.reflection,
        abidePrayer: st.prayer,
        abideApplication: st.appText,
        abideTags: st.tags,
        isPublic: st.isPublic,
      });
      await sendPostRequest("exegesis", `${st.sessionId}/abide`, {
        reflection: st.reflection,
        prayer: st.prayer,
        application: st.appText,
        tags: st.tags,
        isPublic: st.isPublic,
      });
      update({ stage: "apply", saving: false });
    } catch {
      update({ stage: "apply", saving: false });
    }
  }, [update]);

  const saveApply = useCallback(async () => {
    const st = stateRef.current;
    if (!st.sessionId) {
      update({ stage: "completed", completed: true });
      return;
    }

    update({ saving: true });
    try {
      await saveProgress(st.sessionId, {
        challengeText: st.challengeText,
        resultsText: st.resultsText,
      });
      const res = await sendPostRequest(
        "exegesis",
        `${st.sessionId}/apply`,
        {
          challengeText: st.challengeText,
          resultsText: st.resultsText,
        },
      );
      if (res.returnCode === 200 && res.returnData) {
        const data = res.returnData as any;
        update({
          stage: "completed",
          completed: true,
          saving: false,
          journalEntryId:
            data.journalEntryId ||
            data.journalEntry?.id ||
            data.session?.journalEntryId || null,
        });
      } else {
        update({ stage: "completed", completed: true, saving: false });
      }
    } catch {
      update({ stage: "completed", completed: true, saving: false });
    }
  }, [update]);

  const resetAll = useCallback(() => {
    setState({
      sessionId: null,
      stage: "passage",
      completed: false,
      loading: false,
      saving: false,
      error: null,
      bookName: "",
      chapter: "",
      verseStart: "",
      verseEnd: "",
      passageRef: "",
      lookNotes: "",
      currentPromptIdx: 0,
      selectedRepeats: 3,
      repeatCount: 0,
      listenComplete: false,
      learnNotes: "",
      learnTab: "exegesis",
      learnDataLoading: false,
      reflection: "",
      prayer: "",
      appText: "",
      tags: "",
      isPublic: false,
      journalEntryId: null,
      challengeText: "",
      resultsText: "",
    });
  }, []);

  return {
    data: state,
    actions: {
      update,
      startSession: startSessionAction,
      goToStage,
      saveCurrentProgress,
      advanceLook,
      advanceListen,
      advanceLearn,
      saveAbide,
      saveApply,
      resetAll,
      startListening,
      incrementRepeat,
      resetListening,
    },
    BOOK_NAMES,
  };
}
