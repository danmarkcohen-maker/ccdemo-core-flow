import { useState, useEffect, useCallback } from "react";
import type { StoryArc, StoryState, StoryEngagementEntry } from "@/lib/storyTypes";
import { EMPTY_STORY_STATE } from "@/lib/storyTypes";
import { DEFAULT_STORY_ARC } from "@/lib/defaultStoryArc";

const STORAGE_KEY_STATE = "craiture_story_state";
const STORAGE_KEY_ARCS = "craiture_story_arcs";

function loadState(): StoryState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_STATE);
    return stored ? { ...EMPTY_STORY_STATE, ...JSON.parse(stored) } : { ...EMPTY_STORY_STATE };
  } catch {
    return { ...EMPTY_STORY_STATE };
  }
}

function loadArcs(): StoryArc[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_ARCS);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  // Seed default arc
  const arcs = [DEFAULT_STORY_ARC];
  localStorage.setItem(STORAGE_KEY_ARCS, JSON.stringify(arcs));
  return arcs;
}

export function useStoryState() {
  const [storyState, setStoryState] = useState<StoryState>(loadState);
  const [storyArcs, setStoryArcs] = useState<StoryArc[]>(loadArcs);

  // Persist
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_STATE, JSON.stringify(storyState));
  }, [storyState]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ARCS, JSON.stringify(storyArcs));
  }, [storyArcs]);

  // Auto-activate first arc if none active
  useEffect(() => {
    if (!storyState.active_arc_id) {
      const available = storyArcs.find(
        (a) => a.status !== "completed" && !storyState.completed_arcs.includes(a.id)
      );
      if (available) {
        setStoryState((s) => ({ ...s, active_arc_id: available.id, current_beat_index: 0 }));
        setStoryArcs((arcs) =>
          arcs.map((a) => (a.id === available.id ? { ...a, status: "active" } : a))
        );
      }
    }
  }, [storyState.active_arc_id, storyArcs]);

  const getActiveArc = useCallback((): StoryArc | null => {
    return storyArcs.find((a) => a.id === storyState.active_arc_id) ?? null;
  }, [storyArcs, storyState.active_arc_id]);

  const getCurrentBeat = useCallback(() => {
    const arc = getActiveArc();
    if (!arc) return null;
    return arc.beats[storyState.current_beat_index] ?? null;
  }, [getActiveArc, storyState.current_beat_index]);

  const advanceBeat = useCallback(() => {
    const arc = getActiveArc();
    if (!arc) return;
    const currentBeat = arc.beats[storyState.current_beat_index];
    if (!currentBeat) return;

    // Add current beat's clues to known
    const newClues = [...new Set([...storyState.known_clues, ...currentBeat.clues])];

    if (currentBeat.is_canonical_ending) {
      // Complete the arc
      setStoryState((s) => ({
        ...s,
        active_arc_id: null,
        current_beat_index: 0,
        hook_attempts_this_beat: 0,
        known_clues: newClues,
        completed_arcs: [...new Set([...s.completed_arcs, arc.id])],
        messages_since_last_hook: 0,
      }));
      setStoryArcs((arcs) =>
        arcs.map((a) => (a.id === arc.id ? { ...a, status: "completed" } : a))
      );
    } else {
      setStoryState((s) => ({
        ...s,
        current_beat_index: s.current_beat_index + 1,
        hook_attempts_this_beat: 0,
        known_clues: newClues,
        messages_since_last_hook: 0,
      }));
    }
  }, [getActiveArc, storyState]);

  const rewindBeat = useCallback(() => {
    setStoryState((s) => ({
      ...s,
      current_beat_index: Math.max(0, s.current_beat_index - 1),
      hook_attempts_this_beat: 0,
    }));
  }, []);

  const resetArc = useCallback(() => {
    const arc = getActiveArc();
    if (!arc) return;
    // Reset all hooks to unused
    setStoryArcs((arcs) =>
      arcs.map((a) =>
        a.id === arc.id
          ? {
              ...a,
              status: "active",
              beats: a.beats.map((b) => ({
                ...b,
                hooks: b.hooks.map((h) => ({ ...h, used: false })),
              })),
            }
          : a
      )
    );
    setStoryState((s) => ({
      ...s,
      current_beat_index: 0,
      hook_attempts_this_beat: 0,
      messages_since_last_hook: 0,
      known_clues: [],
      child_engagement_history: [],
      last_hook_style: null,
      force_hook_next: false,
    }));
  }, [getActiveArc]);

  const forceHook = useCallback(() => {
    setStoryState((s) => ({ ...s, force_hook_next: true }));
  }, []);

  const completeArc = useCallback(() => {
    const arc = getActiveArc();
    if (!arc) return;
    // Collect all clues
    const allClues = arc.beats.flatMap((b) => b.clues);
    setStoryState((s) => ({
      ...s,
      active_arc_id: null,
      current_beat_index: 0,
      hook_attempts_this_beat: 0,
      known_clues: [...new Set([...s.known_clues, ...allClues])],
      completed_arcs: [...new Set([...s.completed_arcs, arc.id])],
      messages_since_last_hook: 0,
    }));
    setStoryArcs((arcs) =>
      arcs.map((a) => (a.id === arc.id ? { ...a, status: "completed" } : a))
    );
  }, [getActiveArc]);

  const updateArc = useCallback((updatedArc: StoryArc) => {
    setStoryArcs((arcs) => arcs.map((a) => (a.id === updatedArc.id ? updatedArc : a)));
  }, []);

  const addArc = useCallback((arc: StoryArc) => {
    setStoryArcs((arcs) => [...arcs, arc]);
  }, []);

  const deleteArc = useCallback((arcId: string) => {
    setStoryArcs((arcs) => arcs.filter((a) => a.id !== arcId));
    setStoryState((s) => (s.active_arc_id === arcId ? { ...EMPTY_STORY_STATE } : s));
  }, []);

  const importArc = useCallback((json: string): boolean => {
    try {
      const arc = JSON.parse(json) as StoryArc;
      if (!arc.id || !arc.title || !Array.isArray(arc.beats)) return false;
      setStoryArcs((arcs) => {
        const existing = arcs.findIndex((a) => a.id === arc.id);
        if (existing >= 0) {
          const updated = [...arcs];
          updated[existing] = arc;
          return updated;
        }
        return [...arcs, arc];
      });
      return true;
    } catch {
      return false;
    }
  }, []);

  const exportArc = useCallback(
    (arcId: string): string | null => {
      const arc = storyArcs.find((a) => a.id === arcId);
      return arc ? JSON.stringify(arc, null, 2) : null;
    },
    [storyArcs]
  );

  const applyUpdatedState = useCallback((updated: StoryState) => {
    setStoryState(updated);
  }, []);

  const addEngagement = useCallback((entry: StoryEngagementEntry) => {
    setStoryState((s) => ({
      ...s,
      child_engagement_history: [...s.child_engagement_history.slice(-9), entry],
    }));
  }, []);

  const hardResetStory = useCallback(() => {
    setStoryState({ ...EMPTY_STORY_STATE });
    // Reset arcs to default
    const arcs = [DEFAULT_STORY_ARC];
    setStoryArcs(arcs);
  }, []);

  return {
    storyState,
    storyArcs,
    getActiveArc,
    getCurrentBeat,
    advanceBeat,
    rewindBeat,
    resetArc,
    forceHook,
    completeArc,
    updateArc,
    addArc,
    deleteArc,
    importArc,
    exportArc,
    applyUpdatedState,
    addEngagement,
    hardResetStory,
  };
}
