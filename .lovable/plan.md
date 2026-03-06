

# Craiture — Handheld AI Companion Prototype

## Overview
A demoable prototype simulating the Craiture ecosystem: a handheld device where an AI creature companion lives and chats with children. Everything renders inside a **720×720 square viewport** centered on screen, with a dark, calm, slightly magical aesthetic.

## Design System
- **Dark theme** with muted colors — think Discord dark mode meets calm AI assistant
- **Creature accent colors**: Frog (deep moss green), Owl (warm amber), Robot (cool steel blue), Fox (burnt orange)
- **Typography**: Clean, modern sans-serif, soft white/light grey text
- **All UI constrained to 720×720 square** centered in the browser window

## Demo Menu (Home Screen)
- Title: "Craiture Demo" with subtle creature silhouette background
- Subtitle: "Choose an experience"
- 5 menu buttons in a clean vertical list leading to each demo
- Calm fade-in animation on load

## Demo 1: Single User Chat (Beth + Frog)
- Frog creature rendered as a large, translucent (15-20% opacity), softly blurred SVG/illustration behind chat
- Pre-scripted conversation with chat bubbles (user right, Craiture left)
- **Creature idle animation**: gentle breathing (slow scale pulse), blinking every ~8 seconds
- **Message animations**: bubbles fade-in + slight scale-up (250ms)
- **Text streaming**: Frog responses appear character-by-character
- **Thinking state**: three animated dots + creature eyes close briefly
- Rounded input bar at bottom with "> Type your message..." placeholder

## Demo 2: Onboarding Flow
- Sequential animated text reveal: "Hello there." → "I'm Frog." → "What should I call you?"
- Name input field appears, user types name
- Continues: "Nice to meet you, [name]." → "What do you like to talk about?"
- Frog fades in gradually throughout the sequence
- Calm, slow pacing between steps

## Demo 3: Two Human / Two Craiture Chatroom (Beth+Frog, Chloe+Owl)
- Frog translucent on left background, Owl on right
- Pre-scripted 4-participant conversation with color-coded bubbles
- Active speaker's creature brightens slightly; others remain faint
- Chatroom entry transition: screen dims briefly, second creature fades in

## Demo 4: Four Human / Four Craiture Chatroom
- All four creatures positioned in corners/quadrants at very low opacity (~10%)
- 8-participant conversation (4 humans + 4 Craitures)
- Speaking creature brightens, others stay faint
- Each creature has distinct accent color on their chat bubbles

## Demo 5: Settings UI
- Minimal dark settings screen with sections: Volume (slider), Brightness (slider), Craiture Personality (selector), Memory Settings (toggles), Parent App Pairing (button)
- Toggle examples: "Allow Craiture to remember interests", "Clear conversation history"
- Clean, calm styling consistent with the rest

## Creature Illustrations
- Simple SVG silhouettes for each creature (Frog, Owl, Robot, Fox) — soft, rounded shapes
- Rendered as background elements with CSS blur + low opacity
- CSS animations for breathing, blinking, head tilts

## Animations (all CSS/lightweight)
- **Idle breathing**: slow CSS scale oscillation (3-4s cycle)
- **Blinking**: opacity change on "eyes" every 6-12s
- **Thinking dots**: three dots with staggered opacity animation
- **Message appear**: fade-in + scale from 0.95→1 over 250ms
- **Text streaming**: characters revealed via timed interval
- **Creature reaction**: slight bob/pulse on message send
- **Smooth scroll**: CSS scroll-behavior smooth on chat container
- **Playdate detection overlay**: edge glow pulse + "Craiture nearby" prompt (simulated via button)

## Navigation
- Every demo screen has a Back button (top-left) returning to demo menu
- Transitions between screens use fade animations

## Technical Approach
- All front-end only with React components and hardcoded demo data
- No backend needed — pre-scripted conversations auto-play with timed delays
- SVG creature illustrations created inline
- CSS animations via Tailwind + custom keyframes

