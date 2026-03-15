// Story System Types — Craiture Orchestrator

export interface StoryHook {
  id: string;
  style: "ambient" | "curious" | "excited" | "worried";
  text: string;
  used: boolean;
}

export interface StoryBeat {
  id: string;
  order: number;
  title: string;
  description: string;
  is_canonical_ending: boolean;
  creature_knowledge: string;
  hooks: StoryHook[];
  advancement: {
    type: "engagement" | "auto";
    engagement_signals: string[];
  };
  clues: string[];
  requires_clues?: string[];
}

export interface StoryArc {
  id: string;
  title: string;
  description: string;
  status: "inactive" | "active" | "completed";
  beats: StoryBeat[];
  settings: {
    cooldown_min: number;
    cooldown_max: number;
    max_hook_attempts: number;
    injection_weight: number;
  };
}

export interface StoryEngagementEntry {
  beat_id: string;
  engagement_level: string;
  timestamp: number;
}

export interface StoryState {
  active_arc_id: string | null;
  current_beat_index: number;
  messages_since_last_hook: number;
  hook_attempts_this_beat: number;
  known_clues: string[];
  completed_arcs: string[];
  last_hook_style: string | null;
  child_engagement_history: StoryEngagementEntry[];
  force_hook_next: boolean;
}

export interface ResponseValidation {
  passed: boolean;
  flags: string[];
}

export interface OrchestratorMeta {
  intent: string;
  emotional_tone: string;
  story_engagement: string;
  safety_flagged: boolean;
  story_hook_attempted: boolean;
  beat_advanced: boolean;
  memory_updated: boolean;
  context_sections_used: string[];
  updated_story_state?: StoryState;
  response_validation?: ResponseValidation;
}

export const EMPTY_STORY_STATE: StoryState = {
  active_arc_id: null,
  current_beat_index: 0,
  messages_since_last_hook: 0,
  hook_attempts_this_beat: 0,
  known_clues: [],
  completed_arcs: [],
  last_hook_style: null,
  child_engagement_history: [],
  force_hook_next: false,
};
