

## LED Speech-Pattern Pulse

### Problem
The LEDs need to pulse in a way that mimics the irregular, organic rhythm of speech — not a simple sine wave oscillation.

### Approach

1. **Add `ledPulsing` prop to `DeviceFrame`** — boolean that activates the speech-pattern animation.

2. **Speech-pattern animation via randomized CSS keyframes** — Instead of a uniform pulse, define a keyframe sequence with irregular timing that mimics speech cadence: quick bursts, pauses, varying intensities. Something like:

```css
@keyframes led-speech {
  0%   { opacity: 0.3 }
  5%   { opacity: 1 }
  8%   { opacity: 0.5 }
  12%  { opacity: 0.95 }
  18%  { opacity: 0.3 }
  22%  { opacity: 0.85 }
  25%  { opacity: 1 }
  30%  { opacity: 0.4 }
  35%  { opacity: 0.2 }   /* brief pause */
  42%  { opacity: 0.9 }
  45%  { opacity: 0.6 }
  50%  { opacity: 1 }
  55%  { opacity: 0.3 }
  60%  { opacity: 0.8 }
  65%  { opacity: 0.95 }
  68%  { opacity: 0.4 }
  72%  { opacity: 0.2 }   /* another pause */
  78%  { opacity: 0.85 }
  82%  { opacity: 1 }
  88%  { opacity: 0.5 }
  92%  { opacity: 0.9 }
  95%  { opacity: 0.3 }
  100% { opacity: 0.3 }
}
```

3. **Stagger each LED slightly** — Each of the 3 LEDs gets a different `animation-delay` (0s, 0.15s, 0.07s) so they don't move in perfect sync, adding organic feel.

4. **Glow effect when active** — When pulsing, the LEDs also get a brighter `boxShadow` that scales with opacity.

5. **Wire state through `DeviceExperience`** — Add `frogSpeaking` state, pass `onSpeakingChange` callback to ChatScreen/TwoPlayerScreen/FourPlayerScreen, pass `ledPulsing={frogSpeaking}` to DeviceFrame.

### Files to edit
- `src/components/craiture/DeviceFrame.tsx` — add `ledPulsing` prop, apply speech-pattern animation with staggered delays
- `src/index.css` — add the `led-speech` keyframe
- `src/pages/DeviceExperience.tsx` — add `frogSpeaking` state, wire callbacks
- `src/components/craiture/screens/ChatScreen.tsx` — add `onSpeakingChange` callback
- `src/components/craiture/screens/TwoPlayerScreen.tsx` — same
- `src/components/craiture/screens/FourPlayerScreen.tsx` — same

