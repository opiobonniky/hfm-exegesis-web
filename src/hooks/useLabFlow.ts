import { useState, useCallback, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  startSession,
  getSession,
  saveStageProgress,
  saveProgress,
  abandonSession,
  ExegesisSession,
} from "@/services/exegesisApi";
import { sendPostRequest } from "@/services/api";

export type LabStage = "passage" | "look" | "listen" | "learn" | "abide" | "apply" | "completed";
export type PassageSubStage = "book" | "chapter" | "verse";
export type LearnTab = "exegesis" | "language" | "history" | "prologue";

export const STAGE_ORDER: LabStage[] = ["look", "listen", "learn", "abide", "apply"];

export const LISTEN_OPTIONS = [
  { label: "1x", value: 1 },
  { label: "2x", value: 2 },
  { label: "3x", value: 3 },
  { label: "5x", value: 5 },
  { label: "10x", value: 10 },
];

export const LOOK_PROMPTS = [
  "What specific words or phrases stand out to you in this passage?",
  "Who is speaking? Who is listening or being addressed?",
  "What commands, promises, warnings, or truths do you see?",
  "What is repeated in this passage?",
  "What contrasts do you notice (light/darkness, before/after, etc.)?",
  "What questions does this passage raise in your mind?",
];

export const LEARN_TABS: { key: LearnTab; label: string }[] = [
  { key: "exegesis", label: "Study Notes" },
  { key: "language", label: "Original Language" },
  { key: "history", label: "Historical Context" },
  { key: "prologue", label: "Book Prologue" },
];

export const BOOK_NAMES = [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy",
  "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel",
  "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra",
  "Nehemiah", "Esther", "Job", "Psalms", "Proverbs",
  "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah", "Lamentations",
  "Ezekiel", "Daniel", "Hosea", "Joel", "Amos",
  "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk",
  "Zephaniah", "Haggai", "Zechariah", "Malachi",
  "Matthew", "Mark", "Luke", "John", "Acts",
  "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians",
  "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians",
  "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews",
  "James", "1 Peter", "2 Peter", "1 John", "2 John",
  "3 John", "Jude", "Revelation",
];

interface LabFlowState {
  // Session
  sessionId: string | null;
  stage: LabStage;
  completed: boolean;
  loading: boolean;
  saving: boolean;
  error: string | null;

  // Passage selection
  bookName: string;
  chapter: string;
  verseStart: string;
  verseEnd: string;
  passageRef: string;

  // Look stage
  lookNotes: string;
  currentPromptIdx: number;

  // Listen stage
  selectedRepeats: number;
  repeatCount: number;
  listenComplete: boolean;

  // Learn stage
  learnNotes: string;
  learnTab: LearnTab;
  learnDataLoading: boolean;

  // Abide stage
  reflection: string;
  prayer: string;
  appText: string;
  tags: string;
  isPublic: boolean;
  journalEntryId: string | null;

  // Apply stage
  challengeText: string;
  resultsText: string;
}

export function useLabFlow() {
  const [searchParams] = useSearchParams();

  // Initialize from URL params if resuming
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
    learnTab: "exegesis" as LearnTab,
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

  const repeatCountRef = useRef(0);

  // Sync refs
  useEffect(() => { repeatCountRef.current = state.repeatCount; }, [state.repeatCount]);

  const update = useCallback((partial: Partial<LabFlowState>) => {
    setState((prev) => {
      const next = { ...prev, ...partial };
      stateRef.current = next;
      return next;
    });
  }, []);

  // ── Load session on mount if resuming ──
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
  }, [initialSessionId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Passage selection ──
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

  // ── Navigate between stages ──
  const goToStage = useCallback(
    (stage: LabStage) => {
      update({ stage });
    },
    [update],
  );

  // ── Save stage and advance ──
  const saveAndAdvance = useCallback(
    async (nextStage: LabStage, data: Record<string, any> = {}) => {
      const { sessionId, stage } = stateRef.current;
      if (!sessionId) {
        // No session yet — just advance
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
        // Still advance even if save fails
        update({ stage: nextStage });
      }
    },
    [update],
  );

  // ── Save progress without advancing ──
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
        // Silently ignore save errors
      } finally {
        update({ saving: false });
      }
    },
    [update],
  );

  // ── Listen controls ──
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

  // ── Look stage actions ──
  const advanceLook = useCallback(async (notesOverride?: string) => {
    const lookNotes = notesOverride ?? stateRef.current.lookNotes;
    await saveAndAdvance("listen", { notes: lookNotes });
  }, [saveAndAdvance]);

  // ── Listen stage actions ──
  const advanceListen = useCallback(async () => {
    const { selectedRepeats } = stateRef.current;
    await saveAndAdvance("learn", { repeats: selectedRepeats });
  }, [saveAndAdvance]);

  // ── Learn stage actions ──
  const advanceLearn = useCallback(async () => {
    const { learnNotes, isPublic } = stateRef.current;
    await saveAndAdvance("abide", { notes: learnNotes, isPublic });
  }, [saveAndAdvance]);

  // ── Abide stage: save and advance to Apply ──
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

  // ── Apply stage: save and complete ──
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

  // ── Reset everything for a new study ──
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
    ...state,
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
    BOOK_NAMES,
  };
}
