

## Updated Plan: Persistent Chat with Overlay Multiplayer

Same architecture as previously discussed, with one naming change:

**The NFC tap gesture is called a "Hi-Five!" instead of "Tap!"**

This applies everywhere in the UI and flow:

- The haptic flash shows **"🙌 Hi-Five!"** instead of "📱 Tap!"
- Confirmation prompt: **"Hi-Five with Chloe and her Owl?"**
- Button labels: **"🙌 Hi-Five 1 Friend / Exit Chat"** and **"🙌 Hi-Five 3 Friends / Exit Chat"**
- Connected state: **"Hi-Five! Playdate started! ✨"**

Everything else from the approved plan remains unchanged:

1. Refactor `DeviceExperience.tsx` — persistent chat state, overlay model, sleeping toggle, dynamic button labels using "Hi-Five" terminology
2. Keep `ChatScreen` always mounted behind overlays, lift message state to parent
3. Rewrite `TwoPlayerScreen` — remove scanning, start with Hi-Five confirmation, `onExit` callback
4. Rewrite `FourPlayerScreen` — same treatment with 4 pairs
5. Sleep overlay — animated black div, no state reset
6. Post-playdate Frog message appended to persistent solo chat on exit

