"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export function useCollections(userId) {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading]         = useState(false);

  const fetchCollections = useCallback(async () => {
    if (!userId) return;
    setLoading(true);

    const { data } = await supabase
      .from("collections")
      .select(`
        *,
        collection_prompts (
          id, added_at,
          prompt_history ( id, input, detected_model, quality_score, optimized_prompt )
        )
      `)
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    setCollections(data || []);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchCollections(); }, [fetchCollections]);

  const createCollection = useCallback(async ({ name, emoji, description }) => {
    const { data, error } = await supabase
      .from("collections")
      .insert({ user_id: userId, name, emoji, description })
      .select()
      .single();

    if (!error && data) {
      setCollections(prev => [{ ...data, collection_prompts: [] }, ...prev]);
    }
    return error ? null : data;
  }, [userId]);

  const deleteCollection = useCallback(async (id) => {
    const { error } = await supabase
      .from("collections")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (!error) setCollections(prev => prev.filter(c => c.id !== id));
    return !error;
  }, [userId]);

  const addPromptToCollection = useCallback(async (collectionId, historyId) => {
    const { error } = await supabase
      .from("collection_prompts")
      .insert({ collection_id: collectionId, history_id: historyId });

    if (!error) fetchCollections();
    return !error;
  }, [fetchCollections]);

  const removePromptFromCollection = useCallback(async (collectionId, historyId) => {
    const { error } = await supabase
      .from("collection_prompts")
      .delete()
      .eq("collection_id", collectionId)
      .eq("history_id", historyId);

    if (!error) fetchCollections();
    return !error;
  }, [fetchCollections]);

  return {
    collections, loading, fetchCollections,
    createCollection, deleteCollection,
    addPromptToCollection, removePromptFromCollection,
  };
}