// useAdminTrivia — all state, effects, and logic for AdminTrivia page
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/components/languages/languageProvider";
import { sendPostRequest } from "@/services/api";
import type { TriviaQuestion, TriviaOverviewStats, TriviaUserPerformance } from "../types";

export function useAdminTrivia() {
  const { t, isRtl } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("questions");
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [questionPage, setQuestionPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [editDialog, setEditDialog] = useState(false);
  const [editForm, setEditForm] = useState<Partial<TriviaQuestion>>({});
  const [saving, setSaving] = useState(false);
  const [optionsArray, setOptionsArray] = useState<string[]>(["", "", "", ""]);
  const [deleteTarget, setDeleteTarget] = useState<TriviaQuestion | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [overviewStats, setOverviewStats] = useState<TriviaOverviewStats | null>(null);
  const [userPerformance, setUserPerformance] = useState<TriviaUserPerformance[]>([]);
  const [perfTotal, setPerfTotal] = useState(0);
  const [perfPage, setPerfPage] = useState(0);
  const [perfSearch, setPerfSearch] = useState("");
  const [perfSortBy, setPerfSortBy] = useState("percentage");
  const [perfSortOrder, setPerfSortOrder] = useState("desc");
  const [questionPerf, setQuestionPerf] = useState<any[]>([]);
  const [qpTotal, setQpTotal] = useState(0);
  const [qpPage, setQpPage] = useState(0);
  const [qpSearch, setQpSearch] = useState("");
  const [qpDifficulty, setQpDifficulty] = useState("all");
  const [qpSortBy, setQpSortBy] = useState("timesAnswered");
  const [qpSortOrder, setQpSortOrder] = useState("desc");
  const loadQuestions = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await sendPostRequest("trivia", "get-all", { page: p, pageSize: 20, search: searchQuery || undefined, difficulty: difficultyFilter !== "all" ? difficultyFilter : undefined, category: categoryFilter !== "all" ? categoryFilter : undefined });
      if (res?.returnCode === 200 && res?.returnData) { setQuestions(res.returnData.data || []); setTotalQuestions(res.returnData.total || 0); }
    } catch { toast({ title: "Failed to load questions", variant: "destructive" }); }
    finally { setLoading(false); }
  }, [searchQuery, difficultyFilter, categoryFilter, toast]);
  const loadOverview = useCallback(async () => {
    try { const res = await sendPostRequest("trivia", "admin/overview"); if (res?.returnCode === 200 && res?.returnData) setOverviewStats(res.returnData); }
    catch { toast({ title: "Failed to load overview", variant: "destructive" }); }
  }, [toast]);
  const loadUserPerformance = useCallback(async (p: number) => {
    try { const res = await sendPostRequest("trivia", "admin/user-performance", { page: p, pageSize: 20, search: perfSearch || undefined, sortBy: perfSortBy, sortOrder: perfSortOrder }); if (res?.returnCode === 200 && res?.returnData) { setUserPerformance(res.returnData.data || []); setPerfTotal(res.returnData.total || 0); } }
    catch { toast({ title: "Failed to load user performance", variant: "destructive" }); }
  }, [perfSearch, perfSortBy, perfSortOrder, toast]);
  const loadQuestionPerformance = useCallback(async (p: number) => {
    try { const res = await sendPostRequest("trivia", "admin/question-performance", { page: p, pageSize: 20, search: qpSearch || undefined, difficulty: qpDifficulty !== "all" ? qpDifficulty : undefined, sortBy: qpSortBy, sortOrder: qpSortOrder }); if (res?.returnCode === 200 && res?.returnData) { setQuestionPerf(res.returnData.data || []); setQpTotal(res.returnData.total || 0); } }
    catch { toast({ title: "Failed to load question performance", variant: "destructive" }); }
  }, [qpSearch, qpDifficulty, qpSortBy, qpSortOrder, toast]);
  useEffect(() => { loadQuestions(questionPage); }, [loadQuestions, questionPage]);
  useEffect(() => { loadOverview(); }, [loadOverview]);
  useEffect(() => { loadUserPerformance(perfPage); }, [loadUserPerformance, perfPage]);
  useEffect(() => { loadQuestionPerformance(qpPage); }, [loadQuestionPerformance, qpPage]);
  const openCreateDialog = useCallback(() => {
    setEditForm({ question: "", correctAnswer: 0, explanation: "", bookName: "", chapter: null, verseNumber: null, category: "general", difficulty: "medium", isActive: true });
    setOptionsArray(["", "", "", ""]); setEditDialog(true);
  }, []);
  const openEditDialog = useCallback((q: TriviaQuestion) => {
    setEditForm(q);
    try { setOptionsArray(JSON.parse(q.optionsJson || '["","","",""]')); } catch { setOptionsArray(["", "", "", ""]); }
    setEditDialog(true);
  }, []);
  const handleSave = useCallback(async () => {
    if (!editForm.question?.trim()) { toast({ title: "Question is required", variant: "destructive" }); return; }
    const filteredOptions = optionsArray.filter(o => o.trim());
    if (filteredOptions.length < 2) { toast({ title: "At least 2 options required", variant: "destructive" }); return; }
    setSaving(true);
    try {
      const payload = { ...editForm, optionsJson: JSON.stringify(filteredOptions) };
      const res = await sendPostRequest("trivia", editForm.id ? "update" : "create", payload);
      if (res?.returnCode === 200) { toast({ title: editForm.id ? "Updated" : "Created" }); setEditDialog(false); loadQuestions(questionPage); }
      else { toast({ title: "Failed", description: res?.returnMessage, variant: "destructive" }); }
    } catch { toast({ title: "Error", variant: "destructive" }); }
    finally { setSaving(false); }
  }, [editForm, optionsArray, toast, loadQuestions, questionPage]);
  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return; setDeleting(true);
    try {
      const res = await sendPostRequest("trivia", "delete", { id: deleteTarget.id });
      if (res?.returnCode === 200) { toast({ title: "Deleted" }); setDeleteTarget(null); loadQuestions(questionPage); }
      else { toast({ title: "Delete failed", variant: "destructive" }); }
    } catch { toast({ title: "Error", variant: "destructive" }); }
    finally { setDeleting(false); }
  }, [deleteTarget, toast, loadQuestions, questionPage]);
  const onViewQuestion = useCallback((q: TriviaQuestion) => {
    navigate(`/admin/trivia/${q.id}`);
  }, [navigate]);

  return {
    t, isRtl, activeTab, setActiveTab, loading, questions, totalQuestions, questionPage, setQuestionPage,
    searchQuery, setSearchQuery, difficultyFilter, setDifficultyFilter, categoryFilter, setCategoryFilter,
    editDialog, setEditDialog, editForm, setEditForm, saving, optionsArray, setOptionsArray,
    deleteTarget, setDeleteTarget, deleting, overviewStats, userPerformance, perfTotal, perfPage, setPerfPage,
    perfSearch, setPerfSearch, perfSortBy, setPerfSortBy, perfSortOrder, setPerfSortOrder,
    questionPerf, qpTotal, qpPage, setQpPage, qpSearch, setQpSearch, qpDifficulty, setQpDifficulty,
    qpSortBy, setQpSortBy, qpSortOrder, setQpSortOrder,
    openCreateDialog, openEditDialog, onViewQuestion, handleSave, handleDelete,
  };
}
