# DON'T TOUCH THE RED 🔴

An infinite reflex browser game built with **React + TypeScript + Phaser + Vite**.

Move through 9 lanes, collect the good stuff, activate powers, and survive an endlessly accelerating stream of red hazards.

## Features

- ♾️ Procedural infinite waves with multiple patterns
- 🛣️ 9-lane responsive arena with animated speed lines
- 🔴 Independently moving red hazards — every active hazard updates every Phaser frame
- ⚡ Four real power-ups: Shield, Slow-Mo, Magnet, Ghost
- ⭐ Coins, combo multiplier, progressive score
- ❤️ Three lives with temporary hit immunity
- 🎨 Neon/glass UI with React overlays
- 🔊 Generated Web Audio effects and optional procedural music
- 💾 Persistent statistics and settings with versioned localStorage
- 📱 Keyboard, mouse, touch, swipe and on-screen controls
- ⏸️ Pause / resume / restart
- 🐞 F1 development debug overlay
- ♿ Reduced-motion mode and color-assisted danger cues
- 🚀 GitHub Actions → GitHub Pages deployment

## Stack

- React 19
- TypeScript 5
- Vite 6
- Phaser 3
- Web Audio API

## Run locally

```bash
npm install
npm run dev
```

Then open the local Vite URL printed in the terminal.

## Build

```bash
npm run build
npm run preview
```

## Controls

- `←` / `→`
- `A` / `D`
- Tap the on-screen arrows
- Click the arena side you want to move toward
- Swipe left / right on touch devices
- `Escape` pause/resume
- `Enter` start from menu/game over
- `F1` developer debug overlay

## Architecture

```text
React
├── menus / HUD / modals / settings / stats
└── useGame()
      ↓
   Phaser Game
      ↓
   GameScene
      ├── RedObstacle[]
      ├── Coin[]
      ├── PowerUp[]
      ├── WorldGenerator
      ├── DifficultyManager
      ├── CollisionSystem
      ├── ParticleSystem
      └── AudioManager
```

The critical gameplay rule is enforced in `GameScene.update()`:

```ts
for (const hazard of this.hazards) {
  hazard.update(delta, speedFactor);
}
```

Each `RedObstacle` owns its own `y` position and `speed`, so multiple red hazards can never depend on a single shared movement value.

## GitHub Pages

The repository contains `.github/workflows/deploy.yml`.

After pushing to `main`:

1. Open **Settings → Pages**.
2. Select **GitHub Actions** as the source.
3. Push a commit or run the workflow manually.

Vite is configured with a relative base so the build works on a GitHub Pages project URL without hard-coding a username.

## Project structure

```text
dont-touch-the-red/
├── .github/workflows/deploy.yml
├── public/
├── src/
│   ├── components/
│   ├── game/
│   ├── hooks/
│   ├── services/
│   ├── styles/
│   ├── types/
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## License

MIT
