"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export function useHistory(userId) {
  const [history, setHistory]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);

  const fetchHistory = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("prompt_history")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) setError(error.message);
    else setHistory(data || []);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const savePrompt = useCallback(async (optimizeResult, rawInput) => {
    if (!userId) return null;

    const { data, error } = await supabase
      .from("prompt_history")
      .insert({
        user_id:               userId,
        input:                 rawInput,
        mode:                  optimizeResult.mode,
        detected_model:        optimizeResult.detected_model,
        optimized_prompt:      optimizeResult.optimized_prompt,
        explanation:           optimizeResult.explanation,
        changes_made:          optimizeResult.changes_made,
        gap_analysis:          optimizeResult.gap_analysis,
        token_estimate_before: optimizeResult.token_estimate_before,
        token_estimate_after:  optimizeResult.token_estimate_after,
        tokens_delta:          optimizeResult.tokens_delta,
        quality_score:         optimizeResult.quality_score,
        mode_insight:          optimizeResult.mode_insight,
      })
      .select()
      .single();

    if (!error && data) {
      setHistory(prev => [data, ...prev]);
    }
    return error ? null : data;
  }, [userId]);

  const deletePrompt = useCallback(async (id) => {
    const { error } = await supabase
      .from("prompt_history")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (!error) setHistory(prev => prev.filter(h => h.id !== id));
    return !error;
  }, [userId]);

  const todayCount = history.filter(h => {
    const today = new Date().toDateString();
    return new Date(h.created_at).toDateString() === today;
  }).length;

  return { history, loading, error, savePrompt, deletePrompt, fetchHistory, todayCount };
}