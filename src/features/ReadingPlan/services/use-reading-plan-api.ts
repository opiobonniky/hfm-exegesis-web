// useReadingPlanApi — service hook wrapping all readingPlan backend endpoints.
// Mirrors backend/src/modules/readingPlan/route.js 1:1.
// Response is normalized to { returnCode, returnMessage, returnData } via sendPostRequest.
import { useMemo } from "react";
import { sendPostRequest } from "@/services/api";
import type {
  ApiResult,
  PlanDaysResponse,
  PlanDetail,
  ReadingPlanListItem,
  ReadingPlansResponse,
  UserPlanItem,
} from "../types";

export interface QuizQuestionPayload {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export const useReadingPlanApi = () => {
  // POST /reading-plans/get-all
  const getAllPlans = async (params: {
    category?: string;
    page?: number;
    pageSize?: number;
  } = {}): Promise<ApiResult<ReadingPlansResponse>> =>
    sendPostRequest("reading-plans", "get-all", params);

  // POST /reading-plans/by-category
  const getPlansByCategory = async (category: string): Promise<ApiResult<ReadingPlanListItem[]>> =>
    sendPostRequest("reading-plans", "by-category", { category });

  // POST /reading-plans/plan-detail
  const getPlanDetail = async (planId: string): Promise<ApiResult<PlanDetail>> =>
    sendPostRequest("reading-plans", "plan-detail", { planId });

  // POST /reading-plans/get-user-plans
  const getUserPlans = async (): Promise<ApiResult<UserPlanItem[]>> =>
    sendPostRequest("reading-plans", "get-user-plans", {});

  // POST /reading-plans/my-progress
  const getMyProgress = async (): Promise<ApiResult<Record<string, any>>> =>
    sendPostRequest("reading-plans", "my-progress", {});

  // POST /reading-plans/plan-progress
  const getPlanProgress = async (
    planId: string,
  ): Promise<ApiResult<Record<string, any>>> =>
    sendPostRequest("reading-plans", "plan-progress", { planId });

  // POST /reading-plans/start
  const startPlan = async (
    planId: string,
  ): Promise<ApiResult<Record<string, any>>> =>
    sendPostRequest("reading-plans", "start", { planId });

  // POST /reading-plans/remove
  const removePlan = async (
    planId: string,
  ): Promise<ApiResult<Record<string, any>>> =>
    sendPostRequest("reading-plans", "remove", { planId });

  // POST /reading-plans/delete (admin)
  const deletePlan = async (
    planId: string,
  ): Promise<ApiResult<Record<string, any>>> =>
    sendPostRequest("reading-plans", "delete", { planId });

  // POST /reading-plans/update (admin)
  const updatePlan = async (
    planId: string,
    patch: Record<string, any>,
  ): Promise<ApiResult<Record<string, any>>> =>
    sendPostRequest("reading-plans", "update", { planId, ...patch });

  // POST /reading-plans/create (admin)
  const createPlan = async (meta: {
    title: string;
    description: string;
    totalDays: number;
    questionsEnabled: boolean;
    category: string;
    difficulty: string;
  }): Promise<ApiResult<Record<string, any>>> =>
    sendPostRequest("reading-plans", "create", meta);

  // POST /reading-plans/add-assignment (admin)
  const addAssignment = async (payload: {
    planId: string;
    dayNumber: number;
    title?: string;
    chapters: { book: string; chapter: number | string }[];
    reflectionQuestions?: string[];
  }): Promise<ApiResult<Record<string, any>>> =>
    sendPostRequest("reading-plans", "add-assignment", payload);

  // POST /reading-plans/add-quiz-questions (admin)
  const addQuizQuestions = async (payload: {
    planId: string;
    dayNumber: number;
    questions: QuizQuestionPayload[];
  }): Promise<ApiResult<Record<string, any>>> =>
    sendPostRequest("reading-plans", "add-quiz-questions", payload);

  // POST /reading-plans/daily-assignment
  const getDailyAssignment = async (params: {
    planId: string;
    dayNumber: number;
  }): Promise<ApiResult<Record<string, any>>> =>
    sendPostRequest("reading-plans", "daily-assignment", params);

  // POST /reading-plans/all-assignments
  const getAllAssignments = async (planId: string): Promise<ApiResult<any[]>> =>
    sendPostRequest("reading-plans", "all-assignments", { planId });

  // POST /reading-plans/complete-day
  const completeDay = async (payload: {
    planId: string;
    dayNumber: number;
  }): Promise<ApiResult<Record<string, any>>> =>
    sendPostRequest("reading-plans", "complete-day", payload);

  // POST /reading-plans/submit-answer
  const submitAnswer = async (payload: {
    planId: string;
    dayNumber: number;
    questionId: number | string;
    userAnswer: number;
  }): Promise<ApiResult<Record<string, any>>> =>
    sendPostRequest("reading-plans", "submit-answer", payload);

  // POST /reading-plans/quiz-questions
  const getQuizQuestions = async (params: {
    planId: string;
    dayNumber: number;
  }): Promise<ApiResult<Record<string, any>[]>> =>
    sendPostRequest("reading-plans", "quiz-questions", params);

  // POST /reading-plans/quiz-stats
  const getQuizStats = async (
    planId: string,
  ): Promise<ApiResult<Record<string, any>>> =>
    sendPostRequest("reading-plans", "quiz-stats", { planId });

  // POST /reading-plans/update-quiz-question (admin)
  const updateQuizQuestion = async (payload: {
    questionId: number | string;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
  }): Promise<ApiResult<Record<string, any>>> =>
    sendPostRequest("reading-plans", "update-quiz-question", payload);

  // POST /reading-plans/delete-quiz-question (admin)
  const deleteQuizQuestion = async (
    questionId: number | string,
  ): Promise<ApiResult<Record<string, any>>> =>
    sendPostRequest("reading-plans", "delete-quiz-question", { questionId });

  // POST /reading-plans/update-assignment (admin)
  const updateAssignment = async (payload: {
    assignmentId?: string | number;
    planId?: string;
    dayNumber?: number;
    title?: string;
    chapters?: { book: string; chapter: number }[];
    reflectionQuestions?: string[];
  }): Promise<ApiResult<Record<string, any>>> =>
    sendPostRequest("reading-plans", "update-assignment", {
      ...(payload.assignmentId !== undefined ? { assignmentId: payload.assignmentId } : {}),
      ...(payload.planId !== undefined ? { planId: payload.planId } : {}),
      ...(payload.dayNumber !== undefined ? { dayNumber: payload.dayNumber } : {}),
      title: payload.title,
      ...(payload.chapters ? { chapters: payload.chapters } : {}),
      ...(payload.reflectionQuestions !== undefined
        ? { reflectionQuestions: payload.reflectionQuestions }
        : {}),
    });

  // POST /reading-plans/day-quiz-answers
  const getDayQuizAnswers = async (params: {
    planId: string;
    dayNumber?: number;
  }): Promise<ApiResult<Record<string, any>>> =>
    sendPostRequest("reading-plans", "day-quiz-answers", params);

  // POST /reading-plans/admin-stats (admin)
  const getAdminStats = async (
    planId: string,
  ): Promise<ApiResult<Record<string, any>>> =>
    sendPostRequest("reading-plans", "admin-stats", { planId });

  // ── Aliases used by existing pages/hooks ────────────────────────────────────
  const getPlanMeta = async (planId: string): Promise<ApiResult<any>> =>
    getPlanDetail(planId);

  const getPlanDays = async (planId: string): Promise<ApiResult<PlanDaysResponse[]>> =>
    getAllAssignments(planId);

  const updatePlanMeta = async (
    planId: string,
    patch: Record<string, any>,
  ): Promise<ApiResult<Record<string, any>>> =>
    updatePlan(planId, patch);

  const updateDay = async (payload: {
    assignmentId?: string | number;
    planId?: string;
    dayNumber?: number;
    title?: string;
    chapters?: { book: string; chapter: number }[];
    reflectionPrompt?: string;
    reflectionText?: string;
    reflectionQuestions?: string[];
    quizQuestions?: any[];
  }): Promise<ApiResult<Record<string, any>>> =>
    updateAssignment({
      assignmentId: payload.assignmentId,
      planId: payload.planId,
      dayNumber: payload.dayNumber,
      title: payload.title,
      chapters: payload.chapters,
      reflectionQuestions:
        payload.reflectionQuestions ??
        (payload.reflectionText ? payload.reflectionText.split("\n") : undefined),
    });

  // ── Build once: every method is a stable closure over sendPostRequest ───────
  return useMemo(() => ({
    getAllPlans,
    getPlansByCategory,
    getPlanDetail,
    getUserPlans,
    getMyProgress,
    getPlanProgress,
    startPlan,
    removePlan,
    deletePlan,
    updatePlan,
    createPlan,
    addAssignment,
    addQuizQuestions,
    getDailyAssignment,
    getAllAssignments,
    completeDay,
    submitAnswer,
    getQuizQuestions,
    getQuizStats,
    updateQuizQuestion,
    deleteQuizQuestion,
    updateAssignment,
    getDayQuizAnswers,
    getAdminStats,
    getPlanMeta,
    getPlanDays,
    updatePlanMeta,
    updateDay,
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), []);
};