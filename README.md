# DON'T LOOK BEHIND YOU

A short, browser-only first-person psychological horror game set inside the abandoned Halcyon Sleep & Observation Annex.

There is no combat and no conventional pursuing enemy. Tension comes from directional sound, weak light, rooms that change outside the camera, and a system that notices when the player turns toward something they heard behind them.

> The footsteps stop when you do.

## Features

- Grounded first-person movement with acceleration, wall sliding, sprint, crouch, subtle breathing, and optional head bob
- Pointer Lock mouse look with raw-input fallback and graceful failure handling
- Explorable, story-specific abandoned clinic built from optimized procedural geometry
- Flashlight with physical falloff, limited charge, low-battery flicker, two recovery batteries, and persistent charge
- Native Web Audio soundscape with procedural room tone, footsteps, electrical hum, impacts, creaks, breath, whispers, and HRTF positional cues
- Data-driven horror events triggered by zones, elapsed time, progression, revisits, and player attention
- “Look behind” episodes that remember the original heading, react when the player turns, and sometimes change the scene only after they look forward again
- Deterministic critical progression across the lobby, electrical room, storage, administration, washroom, records room, west ward, Room 217, and north stairwell
- Environmental narrative told through clinic protocol, an unsent letter, a recovered transcript, patient records, signs, clocks, props, and room arrangement
- Adaptive tension and restrained controlled randomness; critical completion never depends on random chance
- Minimal cinematic HUD, menus, loading experience, notes, pause flow, credits, and a non-jumpscare final sequence
- Versioned local checkpoints, Continue / New Game, settings persistence, completion time, and reset support
- Master, adaptive ambience, and effects volume; sensitivity; quality; brightness; sound captions; reduced motion; and head-bob settings
- Runtime WebGL, Web Audio, desktop-input, context-loss, asset-generation, and pointer-lock error handling
- Static deployment with no backend, login, database, runtime API, or secret

Typical first blind playthrough: **approximately 10–15 minutes**. Familiar replays can be shorter.

## Tech stack

- React 19 + strict TypeScript
- Vite 8
- Three.js
- React Three Fiber
- Drei performance monitoring
- Zustand
- Native Pointer Lock and Web Audio APIs
- CSS (no UI framework and no post-processing package)
- Vitest + Testing Library
- ESLint + Prettier

The choice of React Three Fiber versus plain Three.js, collision/audio tradeoffs, and pre-implementation research are documented in [`docs/RESEARCH_REPORT.md`](docs/RESEARCH_REPORT.md).

## Requirements

- Node.js 22 LTS
- npm 10+
- A current desktop Chrome, Edge, or Firefox browser
- Hardware-accelerated WebGL and a keyboard/mouse
- Headphones strongly recommended

Mobile/touch controls are intentionally not included. Unsupported devices receive an explanatory screen instead of a broken game.

## Installation

```bash
npm install
npm run dev
```

The development server binds to `0.0.0.0` and prints its local URL.

## Production

```bash
npm run build
npm run preview
```

The static output is written to `dist/`.

## Quality commands

```bash
npm run typecheck
npm run lint
npm test
npm run format:check
npm run build
```

Run the complete local gate with:

```bash
npm run validate
```

## Controls

| Key           | Action                      |
| ------------- | --------------------------- |
| `W A S D`     | Move                        |
| Mouse         | Look                        |
| `Shift`       | Sprint while moving forward |
| `Ctrl` or `C` | Crouch                      |
| `E`           | Interact / read / open      |
| `F`           | Toggle flashlight           |
| `Esc`         | Release mouse and pause     |

Click **New Game**, then **Click to Enter** to grant mouse capture and start audio. Browsers require this explicit gesture.

## Progression and saves

Settings and checkpoints use browser `localStorage`; no information leaves the device. Saves include a version, stage, inventory, charge, elapsed time, attention count, completed one-shot events, and player checkpoint position. Malformed or out-of-range data is validated and safely falls back to defaults.

- **New Game** clears the current checkpoint.
- **Continue** restores the most recent checkpoint.
- Opening the pause menu and completing major interactions write a checkpoint.
- Finishing clears the run checkpoint and records the best local completion time.

Browser storage is convenience state, not an anti-cheat or security boundary.

## Deployment

The repository includes [`render.yaml`](render.yaml) for a Render Static Site.

- Build command: `npm ci && npm run build`
- Publish directory: `dist`
- Runtime: Node 22
- Environment variables: none
- Rewrite: `/*` → `/index.html`

See [`DEPLOYMENT.md`](DEPLOYMENT.md) for Blueprint and manual deployment instructions, headers, and verification steps.

## Assets and licenses

All shipped game content is local:

- Environment and props are project-authored procedural geometry.
- Material maps, signage, case-file graphics, favicon, and social card are project-authored/generated for this repository.
- Every sound is synthesized at runtime with Web Audio; no audio sample is redistributed.
- UI uses system fonts; no font file or remote request is shipped.

No third-party game art, model, texture, music, or sound file is included. Researched CC0 sources and the full inventory are recorded in [`ASSETS.md`](ASSETS.md).

## Architecture

Read [`ARCHITECTURE.md`](ARCHITECTURE.md) for the runtime boundaries, state model, frame loop, level/collision representation, attention-driven horror event engine, audio graph, performance controls, and persistence design.

## Browser validation status

Automated unit/integration tests run in jsdom. A Chromium 152 headless browser smoke test was also performed against the live Vite application with software WebGL: menu/loading, WebGL and Web Audio startup, pointer lock, keyboard movement, flashlight toggle, center-ray interaction, the full authored stage sequence, checkpoint persistence, ending transition, and console/page errors.

Edge and Firefox were not installed in the build environment, so they were not falsely claimed as executed test targets. The application uses standardized APIs and provides fallbacks, but those engines should receive a final hands-on audio/input pass before a public launch.

## Documentation

- [`ARCHITECTURE.md`](ARCHITECTURE.md) — systems and technical decisions
- [`ASSETS.md`](ASSETS.md) — complete asset/source/license ledger
- [`DEPLOYMENT.md`](DEPLOYMENT.md) — Render Static Site setup
- [`docs/RESEARCH_REPORT.md`](docs/RESEARCH_REPORT.md) — research and implementation plan completed before coding

## Credits

Created as an original browser horror experience with React, React Three Fiber, Three.js, and the Web Audio API. Open the in-game **Credits** panel for the concise runtime credits.
