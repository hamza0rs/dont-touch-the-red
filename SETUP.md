# Setup / QA checklist

```bash
npm install
npm run dev
```

Gameplay acceptance tests:

- Press **PLAY NOW** → 5+ red hazards appear immediately.
- Watch the arena → **every visible red hazard moves downward independently**.
- Hold / tap `A`, `D`, `←`, `→` → player changes lanes responsively.
- Wait 20 seconds → score, hazards, speed and procedural waves continue.
- Touch red → life decreases, effects trigger, temporary immunity starts.
- Collect coin → score and combo increase.
- Collect each power-up → gameplay mechanic changes, not only the UI.
- `Escape` → motion and score pause; resume restores the run.
- Lose all lives → game-over appears and persistent stats update.
- `PLAY AGAIN` → clean new run with no stale hazards.
- Mobile → tap/swipe controls work without page scrolling during gameplay.
- `F1` → debug overlay shows FPS, player lane, hazard count and speed.
