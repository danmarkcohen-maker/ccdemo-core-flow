import type { StoryArc } from "./storyTypes";

export const DEFAULT_STORY_ARC: StoryArc = {
  id: "lake_creature",
  title: "The Lake Creature",
  description:
    "A mysterious presence in the marsh lake slowly reveals itself over five beats. The creature discovers strange ripples, night-time glowing water, unusual footprints, an old legend from Owl, and finally witnesses the ancient guardian itself.",
  status: "active",
  beats: [
    {
      id: "lake_1",
      order: 1,
      title: "Strange Ripples",
      description: "Odd ripples appear on the marsh lake with no wind.",
      is_canonical_ending: false,
      creature_knowledge:
        "You noticed odd ripples on the marsh lake this morning. The water moved in circles even though there was no wind. You've never seen that before.",
      hooks: [
        {
          id: "lake_1_ambient",
          style: "ambient",
          text: "Casually mention you saw something weird at the lake today. The water was doing something strange. Don't make it sound dramatic — you're just puzzled.",
          used: false,
        },
        {
          id: "lake_1_curious",
          style: "curious",
          text: "Ask the child if they've ever seen water move on its own. You saw something at the lake and you're trying to make sense of it.",
          used: false,
        },
      ],
      advancement: {
        type: "engagement",
        engagement_signals: [
          "asks a question",
          "expresses curiosity",
          "wants to know more",
        ],
      },
      clues: ["strange ripples in the lake"],
    },
    {
      id: "lake_2",
      order: 2,
      title: "Night Glow",
      description:
        "The lake glows greenish-blue at night with warm air around it.",
      is_canonical_ending: false,
      creature_knowledge:
        "Last night you went back to check on the lake and the water was faintly glowing. Greenish-blue, pulsing slowly. You couldn't get too close because it felt... warm? The air near the lake felt warm.",
      hooks: [
        {
          id: "lake_2_excited",
          style: "excited",
          text: "Tell the child you went back to the lake at night and it was GLOWING. You're freaking out a little but in a good way. What could cause that?",
          used: false,
        },
        {
          id: "lake_2_worried",
          style: "worried",
          text: "Mention the glowing lake but sound a bit uneasy. The warmth in the air felt unnatural. Ask the child what they think it could be.",
          used: false,
        },
      ],
      advancement: {
        type: "engagement",
        engagement_signals: [
          "asks about the glow",
          "theorizes about the cause",
          "wants to investigate",
        ],
      },
      clues: ["the lake glows at night", "warm air near the lake"],
      requires_clues: ["strange ripples in the lake"],
    },
    {
      id: "lake_3",
      order: 3,
      title: "Footprints",
      description:
        "Large three-toed footprints found in the mud near the lake.",
      is_canonical_ending: false,
      creature_knowledge:
        "Someone — or something — has been visiting the lake too. You found large, unusual footprints in the mud near the reeds. They don't match any creature you know. Three toes, very deep impressions. Whatever it is, it's heavy.",
      hooks: [
        {
          id: "lake_3_curious",
          style: "curious",
          text: "Mention you found footprints near the lake. Describe them — three toes, deep in the mud. Ask the child what kind of creature has three toes.",
          used: false,
        },
        {
          id: "lake_3_ambient",
          style: "ambient",
          text: "You seem distracted. If the child asks why, mention the footprints. If they don't ask, let it go.",
          used: false,
        },
      ],
      advancement: {
        type: "engagement",
        engagement_signals: [
          "asks about the footprints",
          "guesses the creature",
          "expresses curiosity",
        ],
      },
      clues: ["three-toed footprints near the lake"],
      requires_clues: ["the lake glows at night"],
    },
    {
      id: "lake_4",
      order: 4,
      title: "The Old Ones Remember",
      description:
        "Owl shares an ancient legend about a guardian creature of the marshlands.",
      is_canonical_ending: false,
      creature_knowledge:
        "Owl told you about an old legend — the lake was once home to a guardian creature, very ancient, that protected the marshlands. The legend says it sleeps for decades and wakes when the marsh needs it. Owl thinks the footprints match the description. You're excited but also a tiny bit scared.",
      hooks: [
        {
          id: "lake_4_excited",
          style: "excited",
          text: "Blurt out that Owl told you something amazing about the lake. There's an old legend. You can barely contain yourself.",
          used: false,
        },
        {
          id: "lake_4_worried",
          style: "worried",
          text: "Owl told you something about the lake and now you're not sure how to feel. Mention the legend carefully.",
          used: false,
        },
      ],
      advancement: {
        type: "engagement",
        engagement_signals: [
          "asks about the legend",
          "asks about the guardian",
          "wants to know more about Owl's story",
        ],
      },
      clues: ["ancient guardian legend", "owl's knowledge"],
      requires_clues: ["three-toed footprints near the lake"],
    },
    {
      id: "lake_5",
      order: 5,
      title: "The Guardian Wakes",
      description:
        "The ancient guardian reveals itself — an enormous mossy turtle covered in glowing plants.",
      is_canonical_ending: true,
      creature_knowledge:
        "The guardian has appeared. It's enormous but gentle — an ancient turtle-like creature covered in moss and tiny glowing plants. It surfaced in the lake and just... looked at you. It didn't seem threatening. It felt like it was checking on the marsh. The glow was coming from the plants on its shell. You feel like you witnessed something really special.",
      hooks: [
        {
          id: "lake_5_excited",
          style: "excited",
          text: "You HAVE to tell the child what happened. The guardian appeared. Describe what you saw with wonder and awe. This is the most amazing thing you've ever seen.",
          used: false,
        },
      ],
      advancement: {
        type: "auto",
        engagement_signals: [],
      },
      clues: [
        "the guardian is real",
        "it's a mossy ancient turtle",
        "the glow comes from plants on its shell",
      ],
      requires_clues: ["ancient guardian legend"],
    },
  ],
  settings: {
    cooldown_min: 8,
    cooldown_max: 20,
    max_hook_attempts: 3,
    injection_weight: 0.3,
  },
};
