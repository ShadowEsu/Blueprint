// ─────────────────────────────────────────────────────────────────────────────
// Scene tools — the agent's "hands" on the 3D model.
//
// kind: "scene" means: the agent does NOT run these. It emits them as actions
// that Flutter / Three.js executes. Adding a new camera move or visual effect is
// just another entry in this array + a matching handler on the Flutter side.
// ─────────────────────────────────────────────────────────────────────────────

import type { ToolDefinition } from "../types.ts";

// Logical targets the camera/highlighter can address. These map 1:1 to PART_MAP
// in web-test/atlas-viewer.html (and to the real GT3 RS node names). Extend freely.
const TARGETS = [
  "engine",
  "exhaust",
  "suspension",
  "transmission",
  "brakes",
  "wheels",
  "rear_wing",
  "cooling",
  "fuel",
  "body",
  "doors",
  "interior",
  "front",
  "rear",
  "left",
  "right",
  "top",
  "whole_car",
];

export const sceneTools: ToolDefinition[] = [
  {
    name: "focus_camera",
    kind: "scene",
    description: "Move the camera to frame a specific part or side of the car.",
    parameters: {
      target: { type: "string", description: "What to look at.", enum: TARGETS, required: true },
    },
  },
  {
    name: "highlight",
    kind: "scene",
    description: "Glow/outline a part to draw the user's attention to it.",
    parameters: {
      target: { type: "string", description: "Part to highlight.", enum: TARGETS, required: true },
    },
  },
  {
    name: "explode",
    kind: "scene",
    description:
      "Animate a part (or the whole car) into an exploded view to reveal internals.",
    parameters: {
      target: { type: "string", description: "Part to explode, or whole_car.", enum: TARGETS, required: true },
    },
  },
  {
    name: "isolate",
    kind: "scene",
    description:
      "Hide everything except the target part, so the user sees it alone. " +
      "Great for 'just show me the X'. Use reset_view to bring the rest back.",
    parameters: {
      target: { type: "string", description: "Part to isolate.", enum: TARGETS, required: true },
    },
  },
  {
    name: "reset_view",
    kind: "scene",
    description: "Return the camera and all parts to the default assembled view (un-explode, un-isolate).",
    parameters: {},
  },
  {
    name: "show_labels",
    kind: "scene",
    description: "Display floating labels naming the visible parts.",
    parameters: {
      target: { type: "string", description: "Scope of labels.", enum: TARGETS },
    },
  },
  {
    name: "show_specs",
    kind: "scene",
    description:
      "Open the spec card UI for a part. Pair with get_part_info so the card has data.",
    parameters: {
      part: { type: "string", description: "Part whose specs to show.", required: true },
    },
  },
  {
    name: "set_paint",
    kind: "scene",
    description: "Change the car's body paint colour.",
    parameters: {
      color: {
        type: "string",
        description: 'Colour name or hex, e.g. "Nardo Grey" or "#6E7479".',
        required: true,
      },
    },
  },
];
