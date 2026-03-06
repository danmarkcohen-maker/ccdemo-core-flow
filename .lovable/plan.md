

# Making Craiture Feel Like a Consumer Device

## Problem
The current UI reads as a developer dashboard — flat rectangles, uppercase labels, thin borders, muted everything. It needs to feel like a **real handheld device** that a teen would pick up and enjoy.

## Key Changes

### 1. Device Frame — Make It Feel Physical
- Add a subtle outer bezel/casing around the 720×720 screen (rounded corners, slight gradient, subtle shadow) so it reads as an actual device, not a browser div
- Add a soft ambient glow behind the device matching the creature's color (green for Frog)
- Slightly darken the "outside" area to make the screen pop

### 2. Frog Creature — Much More Present
- **Increase SVG size** to fill more of the screen (~450px wide instead of 320)
- **Raise base opacity** to 0.25–0.30 so it's clearly visible, not a ghost
- **Reduce blur** from 2px to 0.5px — the creature should be recognizable, just behind the content layer
- Add a soft radial gradient glow emanating from the creature's position
- Make the creature **centered and dominant** in the viewport, especially on the demo menu and onboarding

### 3. Demo Menu — Playful, Not Corporate
- Replace the plain text list buttons with **pill-shaped, glassmorphism-style cards** with a soft frosted glass effect
- Add a subtle creature-colored accent line or dot to each menu item
- Title "Craiture" rendered larger, with a gentle glow effect, not plain text
- Remove uppercase tracking on subtitle — use a warmer, friendlier tone
- Add a subtle animated particle or firefly-like dots floating in the background for atmosphere

### 4. Typography & Color Warmth
- Slightly warmer foreground text (less blue-grey, more warm white)
- Chat bubbles: softer rounded corners (20px+), slightly more saturated creature colors
- Sender labels: remove the UPPERCASE styling, use sentence case, slightly larger
- Input bar: more padding, softer styling, slight inner glow on focus

### 5. Onboarding — Device Boot Sequence Feel
- Add a brief "screen power on" effect at the start (black → fade in with a subtle scan line or glow)
- Frog should start at ~0.15 opacity and grow to 0.35+ by the end — really arriving
- Text should feel more intimate — slightly larger, centered, with generous spacing
- Name input field: rounder, warmer styling with creature-colored focus ring
- Topic pills: more colorful, with slight hover glow effects

### 6. Chat Screens — More Alive
- Increase creature opacity during chat to 0.22–0.28 baseline
- Add a subtle ambient gradient at the top of the chat (creature color fading down)
- Chat header: simpler, just names with a small creature icon/dot, no borders
- Messages: slightly larger text (15px), more bubble padding, warmer shadows

### 7. Ambient Background Effects
- Add a very subtle animated radial gradient behind the creature that pulses slowly
- Optional: tiny floating particle dots (2-3 small circles) that drift slowly, giving the screen life

## Files to Modify
- `DeviceFrame.tsx` — bezel, ambient glow
- `FrogCreature.tsx` — larger, more visible, ambient glow layer
- `DemoMenu.tsx` — glassmorphism buttons, larger title, atmosphere
- `Onboarding.tsx` — boot sequence, warmer styling
- `SingleChat.tsx` — ambient gradient, creature presence
- `TwoPlayerChat.tsx` / `FourPlayerChat.tsx` — same chat improvements
- `ChatBubble.tsx` — warmer styling, larger text, remove uppercase labels
- `ChatInput.tsx` — softer, warmer focus states
- `index.css` — new keyframes for particles/glow, warmer color variables
- `Settings.tsx` — consistent warm styling

