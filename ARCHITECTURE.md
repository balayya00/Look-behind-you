# Architecture

## Overview

Don't Look Behind You is a static, browser-only first-person game. React owns application/UI lifecycle; React Three Fiber owns one Three.js renderer and frame loop; pure TypeScript modules own collision, progression, attention, battery, and validation; an imperative Web Audio service owns sound scheduling.

There is no server-side simulation or backend. The only durable state is versioned `localStorage`.

```text
DOM application shell
  ├─ loading / support checks / errors
  ├─ menu / settings / credits
  ├─ intro / HUD / notes / pause
  └─ ending / completion
          │
          ▼
Zustand low-frequency stores ◄──── persistence validators
          │
          ▼
R3F scene + shared frame loop
  ├─ player / pointer lock / interaction ray
  ├─ level / doors / procedural props
  ├─ practical lights / flashlight / fog
  └─ horror director ─────────────► Web Audio engine
```

## Runtime boundaries

### DOM shell

`src/App.tsx` is a state-driven composition root. It lazy-loads the 3D scene, reports genuine initialization milestones, catches renderer errors, applies brightness, and selects the UI surface for the current game phase.

Phases are explicit:

```text
loading → menu → intro → playing ⇄ paused
                           ├──────⇄ reading
                           └──────→ ending → complete
```

The Canvas remains mounted across normal phases. This avoids shader/material recompilation and lets the menu use the clinic as a subtle live background.

### Realtime scene

`src/scenes/GameCanvas.tsx` creates exactly one R3F `Canvas`, configures ACES tone mapping, capped DPR, fog, and shadow quality, then composes:

- `Building`
- `PlayerController`
- `HorrorDirector`
- `AudioBridge`
- menu camera and support/performance guards

Per-frame work mutates refs and Three.js objects. React state is not used for velocity, camera transforms, listener transforms, flicker, or timer accumulation.

### State stores

Three small Zustand stores deliberately separate concerns:

1. **`gameStore`** — current phase/stage, low-frequency battery snapshot, inventory, objective/chapter, prompts, notifications/captions, attention count, one-shot IDs, door state, and world mutations.
2. **`settingsStore`** — bounded user settings and persistence actions.
3. **`progressStore`** — checkpoint and best completion time.

This prevents transient runtime vectors from being serialized or driving React renders.

## Game loop

R3F supplies the only `requestAnimationFrame` loop.

### Player update (`useFrame` priority -2)

1. Clamp delta to 50 ms after tab stalls.
2. Read the key set and compute normalized local input.
3. Convert input with yaw; damp toward walk/sprint/crouch target velocity.
4. Resolve movement against active colliders in bounded substeps.
5. Apply gravity and floor grounding.
6. Damp stance height and compute optional bob, sway, and breath motion.
7. Write the camera and shared runtime snapshot.
8. Update Web Audio listener position/orientation.
9. Schedule distance-based footstep transients.
10. Drain/rate-limit flashlight charge state.
11. Cast the center interaction ray and update prompt only when focus changes.
12. Update room zone and ending threshold.
13. Accumulate elapsed time in one-second store writes.

### Horror update (`useFrame` priority -1)

1. Observe zone/stage changes and elapsed timeline.
2. Match typed event triggers and schedule bounded delays.
3. Execute due actions.
4. Update an active attention episode, including turn and return angles.
5. Expire captions/silhouettes.
6. Schedule sparse non-critical ambient sounds.

Negative priorities preserve automatic R3F rendering while ensuring player transforms update before horror attention checks.

## Player and Pointer Lock

`PlayerController` owns keyboard and mouse listeners and removes all listeners on unmount. Pointer Lock is requested only from explicit menu/overlay gestures. `pointerLock.ts` supports:

- Promise and legacy `void` request forms
- `unadjustedMovement` raw input
- retry without raw input on `NotSupportedError`
- unsupported/failure results

`pointerlockchange` is authoritative. A lost lock clears movement keys and pauses only if the game was actively playing; opening a note sets `reading` first, so the browser's resulting unlock cannot accidentally replace the note with pause.

Movement uses acceleration/deceleration rather than direct position steps. Crouch changes speed and eye height, and sprint is forward-only. There is no jump: it would enable progression bypass and add motion without gameplay value.

## Collision and grounding

The clinic is one axis-aligned floor. `src/data/level.ts` is the single source for wall visuals and wall collision. Wall AABBs are derived from the same dimensions, preventing visual/collision drift.

The player is represented horizontally by a 0.31 m radius. `resolveMovement`:

- expands each AABB by that radius,
- subdivides motion into at most 0.16 m steps,
- resolves X and Z independently,
- preserves tangent velocity for natural wall sliding,
- returns collision flags so blocked velocity can be zeroed.

Closed critical doors add dynamic colliders. Their `disabledWhen` key is evaluated from explicit open state and deterministic stage-derived open state, so checkpoint restores cannot trap a player behind a closed door.

Gravity is applied to a feet-height accumulator and clamped to the authored ground plane. The architecture can add floor-height sampling later without changing camera or input ownership.

A center Three.js Raycaster uses layer 2 and a 2.35 m maximum distance. Only small interaction hitboxes occupy that layer; decorative meshes are never scanned as interaction candidates.

## Level and progression

The compact Halcyon Annex map is authored in `src/data/level.ts` as walls, doors, props, signs, colliders, and named trigger zones. Procedural component families render chairs, desks, cabinets, lockers, stretchers, a wheelchair, boxes, pipes, clocks, benches, and dead plants.

Critical progression is an ordered state machine:

```text
arrival
→ fuse-needed
→ fuse-found
→ power-restored
→ office-searched
→ transcript-found
→ records-read
→ ward-open
→ patient-note-read
→ key-found
→ exit-open
→ complete
```

Only adjacent transitions are accepted. A player can explore/read optional material in any order, but a critical clue advances only at its intended stage. This creates reliable backtracking through Administration and the washroom without randomized soft locks.

Stage-derived objectives and chapters live beside the order in `progression.ts`. Interactions in `interactions.ts` are the transaction boundary for inventory, door sound, stage advancement, notifications, tension, and checkpoints.

## Horror event engine

`src/data/horrorEvents.ts` contains typed, data-driven definitions. A definition includes:

- unique ID,
- trigger (`zone-enter`, `zone-revisit`, `stage`, or `elapsed`),
- delay range,
- once flag,
- optional minimum/maximum stage,
- ordered actions.

Actions are discriminated unions:

- spatial sound,
- attention episode,
- world mutation,
- short silhouette,
- tension change.

Critical progression never exists in this randomized system.

### Attention mechanic

An attention episode captures origin yaw and emits footsteps/breath behind the player. `attention.ts` uses normalized angular distance:

1. Remain in `cue` until the player turns at least ~112°.
2. Mark `looked-behind`, stop the acknowledged cue, and increment the count once.
3. Wait until yaw returns within ~40° of the original heading.
4. Mark `returned` and optionally apply a scene mutation.
5. Expire harmlessly after the bounded window if the player refuses to look.

Mutation chance is fixed by a seeded per-session random stream. Some episodes intentionally do nothing after being acknowledged. This uncertainty is part of the design, not a missing action.

World mutation keys currently control the corridor chair, north practical lights, and fleeting silhouettes. Relevant mutations are derived from saved one-shot IDs when a checkpoint is restored.

## Flashlight

The flashlight is a camera-following SpotLight plus a very short local fill light. The target is angled slightly down to keep the floor navigable. Quality controls shadow map size and disables flashlight shadows on Low.

Charge drains at a delta-based rate only while enabled. Intensity falls in two low-charge bands and a deterministic high-frequency signal creates occasional flicker. Charge state is rate-limited to four UI writes per second. Two interactable batteries restore charge; checkpoint load guarantees a small minimum reserve so a saved run cannot become impossible.

If charge reaches zero, the lamp switches off, but emergency/fill lighting and level signage preserve navigation.

## Lighting and rendering

- Shared MeshStandardMaterials and 192 px runtime CanvasTextures
- Desaturated concrete, paint, tile, floor, wood, metal, rust, paper, fabric, glass, rubber, and accent material families
- One shadow-capable flashlight
- Sparse real practical PointLights with additional emissive-only fixtures
- Exponential fog and ACES tone mapping
- CSS scanline, vignette, and grain overlays instead of a GPU post-processing chain
- Capped DPR: 1.0 / 1.35 / 1.75
- Drei sustained-FPS monitoring can lower one quality tier

Dynamic fixtures mutate intensity/material values and never mount/unmount at flicker frequency.

## Audio

`AudioEngine` lazily creates one `AudioContext` from a user gesture. It reuses generated noise buffers and owns this graph:

```text
oscillator / generated noise buffer
  → filter
  → optional HRTF PannerNode
  → ambience | SFX | UI gain
  → dynamics compressor
  → master gain
  → destination
```

The room tone layers 41 Hz and 57.7 Hz oscillators with low-frequency filtered noise. Restored power adds 60/120 Hz electrical hum. Every footstep, door, impact, creak, whisper, breath, switch, pickup, lock, and UI cue is synthesized. No network fetch or decoded sound file exists.

Tension changes ambience gain and filtering slowly. The listener follows the camera every frame; high-value behind-player cues use HRTF panners. Gain envelopes begin/end above zero to avoid clicks, and all scheduled transient sources have bounded stop times.

`AudioBridge` applies settings, phase ducking, tension, and power state without coupling UI components to graph internals.

## Persistence

`persistence.ts` is a defensive boundary around `localStorage`:

- catches unavailable storage and malformed JSON,
- requires version 1 records,
- checks stage/inventory enums,
- filters event ID arrays,
- clamps charge, time, position, yaw, volume, sensitivity, and brightness,
- defaults unknown properties.

No arbitrary stored value is rendered as HTML. Progress is local-only and contains no personal data.

## Errors and unsupported devices

- Feature report checks WebGL, Pointer Lock, Web Audio, coarse pointer, and reduced-motion preference.
- Unsupported environments receive a specific desktop requirement screen.
- Pointer lock failures retain a clickable recovery surface.
- Lost focus/hidden tab clears input and releases pointer lock.
- WebGL context loss produces a reload surface while preserving the local checkpoint.
- A React error boundary catches scene construction/render exceptions.
- Procedural texture creation throws a meaningful error rather than displaying a half-built scene.

## Security model

There is no backend, secret, API key, account, analytics, microphone, camera, or remote asset URL. Narrative strings are typed static data; `dangerouslySetInnerHTML` is not used. Render headers disable content sniffing and unused browser capabilities and constrain content sources to the same origin plus required local blob/data/WebSocket behavior.

## Source layout

```text
src/
├── app/                 # React error boundary
├── components/          # all DOM screens and HUD
├── data/                # level, notes, horror event definitions
├── game/
│   ├── audio/           # AudioEngine and store bridge
│   ├── environment/     # building, doors, props, signs, materials
│   ├── events/          # horror scheduler/director
│   ├── interactions/    # hitboxes and interaction transactions
│   ├── lighting/        # flashlight and practical fixtures
│   ├── player/          # controller and Pointer Lock adapter
│   └── systems/         # pure attention/battery/collision/progression/runtime
├── scenes/              # Canvas composition
├── stores/              # runtime/settings/progress/persistence
├── styles/              # layered global CSS
├── test/                # shared test setup
├── types/               # game, settings, and level contracts
└── utils/               # math, random, support report
```

## Extension points

- New non-critical scares: add a typed definition to `HORROR_EVENTS`.
- New rooms: add wall/zone/door/prop data; wall colliders derive automatically.
- New progression: insert a stage and objective, then add one adjacent interaction transaction.
- New procedural sounds: add a bounded AudioEngine voice and action cue union.
- Imported GLB assets: add a loader boundary and document/optimize the exact file in `ASSETS.md`; core systems do not require changes.
