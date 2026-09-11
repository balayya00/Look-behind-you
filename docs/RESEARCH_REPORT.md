# Pre-Implementation Research Report

**Project:** Don't Look Behind You  
**Research date:** 2026-09-11  
**Repository state:** One README and no application, package manifest, assets, CI, or deployment configuration. The existing repository therefore permits a clean implementation without migration risk.

This report records the technical and asset research completed before implementation. It is intentionally a decision document, not a claim that the planned work is already implemented.

## 1. Recommended technology stack

### Decision

- **React + strict TypeScript + Vite** for application lifecycle, menu/settings/accessibility UI, build tooling, and static deployment.
- **Three.js through React Three Fiber (R3F)** for the realtime scene.
- **Drei only for focused utilities** (adaptive performance monitoring); controls remain custom because game-state/pause/attention tracking need tighter ownership than a generic control component provides.
- **Zustand** for low-frequency game state and versioned `localStorage` persistence.
- **Native Web Audio API** for synthesis, mixing, filters, and 3D panning. Howler is not selected because this game can avoid decoded file compatibility concerns and needs direct procedural DSP/spatial control.
- **CSS** for all overlays and low-cost film grain/vignette; no general UI framework and no full-screen post-processing dependency.
- **Vitest** for deterministic game-system tests and browser-level smoke/interaction checks where the sandbox supports them.

### R3F versus plain Three.js

Plain Three.js would minimize abstraction and is attractive for an update-heavy game. R3F is still the better fit here because the project also has substantial stateful UI, scene variants, settings, and authored environment components. It supplies lifecycle cleanup, a shared frame loop, React error boundaries, and declarative composition without preventing imperative frame-critical code. The important constraint is to keep velocity, camera, flashlight, listener, and event-attention updates in `useFrame`/mutable refs rather than React state. R3F's own guidance specifically recommends delta-based mutation, shared geometry/materials, instancing, and avoiding state updates in frame loops.

Drei's generic pointer controls are not used: custom Pointer Lock ownership is needed to distinguish intentional pause, browser unlock, menu overlays, and attention-angle events. A full physics engine is also not justified for a static, axis-aligned, single-floor level.

## 2. Architecture

The application is split into four boundaries:

1. **DOM application shell** — support checks, loading, menu, settings, credits, HUD, pause, notes, ending, and error recovery.
2. **R3F realtime scene** — building, props, lighting, camera/player, interactable ray, and visual event mutations.
3. **Pure game domain** — level data, progression state machine, AABB collision, trigger/attention rules, deterministic random helpers, and horror event definitions.
4. **Imperative services** — Web Audio graph, pointer lock adapter, persistence adapter, and runtime diagnostics.

Zustand carries only state that UI or multiple systems need. Per-frame vectors and timers stay in refs/service objects to avoid render churn. The level and horror sequence are data-driven; critical progression is deterministic, while cosmetic ambience uses bounded seeded/random schedules.

## 3. Planned folder structure

```text
src/
├── app/                 # support checks, loading and error boundaries
├── components/          # DOM UI/menu/HUD/settings/credits
├── data/                # level, narrative notes and horror definitions
├── game/
│   ├── audio/           # native Web Audio engine and procedural voices
│   ├── environment/     # building, props, materials and signs
│   ├── events/          # event runner, triggers and attention mechanic
│   ├── interactions/    # center-ray interaction registry
│   ├── lighting/        # flashlight, practical/flicker lights
│   ├── player/          # pointer lock, movement, grounding, head motion
│   └── systems/         # collision, progression and performance systems
├── scenes/              # world and ending scene composition
├── stores/              # runtime game store and persisted settings/save
├── styles/              # global cinematic UI styles
├── test/                # test setup/helpers
├── types/               # shared strict domain types
└── utils/               # math, feature detection and seeded randomness
```

No runtime third-party asset CDN is planned. Public files are limited to metadata/static deployment artifacts unless a redistributable asset is deliberately added and logged in `ASSETS.md`.

## 4. Game loop

R3F's single `requestAnimationFrame` loop will:

1. Clamp frame delta to prevent tunneling after a suspended tab.
2. Read input and update horizontal acceleration/deceleration.
3. Apply gravity and ground clamping, then resolve X/Z collision separately for natural wall sliding.
4. Update camera yaw/pitch, stance, subtle bob/sway, flashlight, and listener transform.
5. Test zone transitions, interaction focus, attention direction, and active horror-event timers.
6. Schedule footsteps/ambient one-shots and update adaptive tension.
7. Mutate visible scene objects/lights, then render once.

UI snapshots (battery, objective, prompt, chapter) are rate-limited or changed only past meaningful thresholds; they are not written at display refresh rate.

## 5. Player-control strategy

- Native Pointer Lock API requested from a direct click/keyboard gesture.
- Handle both Promise and legacy `void` forms; if `unadjustedMovement` fails, retry standard pointer lock.
- Listen for `pointerlockchange` and `pointerlockerror`; losing lock pauses rather than continuing movement.
- WASD input is normalized, accelerated, damped, and transformed by yaw; Shift changes target speed; Ctrl/C lowers eye height and speed.
- Pitch is clamped below vertical. Sensitivity comes from persisted settings.
- A subtle procedural bob/sway is proportional to actual velocity and can be disabled with either Head Bob or Reduced Motion.
- The player is represented by a horizontal radius and eye/stance height. There is no jump, avoiding level bypass and motion discomfort.

MDN identifies pointer lock as appropriate for first-person games, requires an engagement gesture, and documents fallback handling for browsers without Promise/raw-input support. Mobile pointer lock is unreliable, so coarse-pointer/mobile devices receive a graceful desktop-required screen instead of broken controls.

## 6. Collision strategy

Three.js's `Octree` + capsule collision was evaluated. It is appropriate for arbitrary triangle worlds and the official add-on exposes `capsuleIntersect`. This level is deliberately modular, single-floor, and axis-aligned, so a physics engine or triangle octree adds bundle size and initialization cost without useful gameplay.

Use data-authored 2D AABBs expanded by the player's radius, swept/sub-stepped at high speed, with independent-axis resolution for sliding. Dynamic door blockers are keyed and can be disabled when open. Grounding applies gravity against authored floor height. Interaction uses a Three.js center-screen Raycaster against a small registry of hit meshes, not every decorative mesh.

Risk mitigation: clamp delta, use movement substeps, unit-test corners/doorways/sliding, and expose a debug collision overlay only in development.

## 7. Lighting strategy

- Very low hemisphere/ambient fill so navigation never becomes fully black.
- A camera-following SpotLight flashlight with physically plausible falloff and a single quality-dependent shadow map.
- Emissive fluorescent fixtures, but only a bounded set of real point/spot lights near important spaces.
- Scripted/flickering intensity by mutation, never mounting lights during play.
- Exponential fog, ACES tone mapping, desaturated materials, and CSS vignette/grain.
- No expensive volumetric pass. Light shafts are suggested with sparse translucent geometry only where composition warrants it.
- Quality settings control DPR, shadows, antialiasing, and decorative particles.

## 8. Audio strategy

A single lazy `AudioContext` is created/resumed by the Start/Enter gesture to satisfy autoplay policy. The graph is:

```text
procedural source / short generated buffer
    → optional BiquadFilter
    → optional PannerNode
    → category gain (ambience / SFX / UI)
    → master compressor
    → master gain
    → destination
```

Audio is generated locally from oscillators and reusable noise/impulse buffers: room tone, wind, electrical hum, footsteps, cloth/breath, creaks, impacts, whispers, door movement, flashlight switch, and UI cues. This gives very small transfer size and avoids uncertain redistribution rights. PannerNodes use HRTF for important behind-player cues; ordinary footsteps are inexpensive mono transients. Listener position/orientation follows the camera. Gain ramps avoid clicks, node lifetimes are bounded, and the engine degrades silently if Web Audio is unavailable.

Adaptive tension (0–100) subtly controls filter cutoff, drone layers, event density, breath gain, and silence windows. There is no constant score.

## 9. Horror-event system

Typed definitions contain:

```text
id, trigger, once/cooldown, delay range, conditions,
actions, cancellation rule, tension delta, checkpoint impact
```

Supported triggers include zone enter/exit, interaction, progression stage, elapsed time, look-at, look-away, turn-behind-after-cue, return-to-heading, revisit count, and flashlight/battery state. Actions include spatial sound, message/objective, light state, prop transform/visibility, door state, silhouette timing, tension, and ending transition.

The title mechanic uses an attention episode:

1. Capture player position and forward heading.
2. Emit a spatial cue 5–10 m behind the heading.
3. Detect whether yaw departs far enough to count as looking behind.
4. Stop or attenuate the cue when acknowledged.
5. Wait until the player returns toward the original heading.
6. Sometimes mutate an object/light ahead; sometimes deliberately do nothing.

Look counts and response latency can color later events and the ending, but never block completion.

## 10. Asset strategy

### Sources researched

- **Poly Haven** — all HDRIs, textures, and models are CC0; commercial use, redistribution, and no attribution are explicitly allowed: <https://polyhaven.com/license>
- **ambientCG** — downloadable assets are CC0 and may be copied, modified, distributed, and included as raw files in a game: <https://docs.ambientcg.com/license/>
- **Kenney** — asset-page game assets are CC0, including commercial use; attribution is optional: <https://kenney.nl/support>
- **Freesound/OpenGameArt/Sketchfab** — useful but per-item licenses vary; no item from these sources will be shipped without an immutable item URL and license verification.

### Initial production choice

Use authored procedural low-poly/primitive geometry, runtime canvas material maps/signs/photos, CSS graphics, and synthesized Web Audio. This avoids download weight, style mismatch, and license ambiguity while permitting a consistent abandoned-clinic art direction. `ASSETS.md` will inventory every shipped visual/audio resource, including self-authored generators, and separately list researched-but-unused libraries so their licenses are not misrepresented as bundled assets.

If visual review shows a specific prop materially improves the scene, only a verified CC0 GLB/1K texture from the first three sources will be added, optimized, and documented before inclusion.

## 11. Performance strategy

- Target a 16.7 ms frame budget on a reasonable desktop.
- Share geometries/materials; instance repeated debris/fixtures where beneficial.
- Keep active dynamic lights and shadow casters tightly bounded; default to one shadowed flashlight.
- Cap DPR by quality (`1.0`, `1.35`, `1.75`) rather than blindly using device DPR.
- Use primitive/low-poly props and 128–256 px repeatable runtime textures.
- Reuse vectors/raycasters/noise buffers; avoid allocations and React updates in `useFrame`.
- Pause simulation/audio on `visibilitychange` and when pointer lock is lost.
- Adapt quality after sustained low FPS, with a visible non-alarming notification.
- Lazy-initialize the scene/audio after menu interaction where practical; report genuine initialization stages on the loading screen.
- Verify bundle and generated asset sizes from the production output.

## 12. Render deployment strategy

A single Vite static build requires no server, API, environment variable, database, or secret.

- Render service type: **Static Site**
- Build: `npm ci && npm run build`
- Publish: `dist`
- Node: current LTS (pin in `.nvmrc`/`package.json` engines)
- Optional catch-all rewrite: `/*` → `/index.html` (rewrite), harmless for existing asset paths and future client routes.
- A `render.yaml` Blueprint will encode the publish path, build command, rewrite, and safe response headers.

Vite's official static deployment guide documents `npm install && npm run build` and `dist` for Render; Render's documentation confirms `staticPublishPath` and static-site route/header configuration.

## 13. Security considerations

- No backend, authentication, remote API, secret, analytics, microphone, camera, or user HTML.
- No `dangerouslySetInnerHTML`; narrative text is static typed data.
- No runtime arbitrary URLs. All resources are local and bundled.
- Version and validate persisted JSON; fall back to defaults if malformed.
- Add `nosniff`, a restrictive permissions policy, and a practical same-origin CSP while preserving Canvas/Web Audio and the hosting preview.
- Keep dependency count small, commit lockfile, run `npm audit`, and review build output for keys/source maps.
- Do not claim that browser storage is tamper-proof; progress is convenience state only.

## 14. Testing strategy

### Automated

- Pure unit tests: collision corners/sliding/tunneling, progression transitions, event condition evaluation, seeded scheduling, setting/save validation, battery guarantees, and attention-angle detection.
- Component tests: menu/settings/unsupported/error surfaces where DOM emulation is sufficient.
- Production checks: strict TypeScript, ESLint, Vitest, Vite build, bundle-size inspection, dependency audit.
- Browser smoke test if a browser binary is available: load menu, start, obtain/fake pointer lock where possible, keyboard movement, flashlight, pause, interaction sequence, persistence, completion/restart, and console error capture.

### Manual/visual

Run the production preview and inspect menu, loading, HUD, legibility, collisions, sequence reliability, audio gesture behavior, low battery, reduced motion, resize, lost focus, ending, and restart. Chrome/Chromium can be verified in this environment if available. Edge and Firefox compatibility will only be claimed if those engines are actually available and run.

## 15. Known technical risks

| Risk | Impact | Mitigation |
|---|---|---|
| Browser autoplay policy | Silent opening | Create/resume audio from explicit Start/Enter gesture; show audio status fallback. |
| Pointer lock behavior varies and hosted preview may be framed | Cannot look | Feature detect; Promise/void + raw/standard fallback; friendly error; direct-page guidance. |
| Dynamic shadows on integrated GPUs | Low FPS | One shadow light, quality tiers, capped DPR, adaptive fallback. |
| Procedural art can read as generic | Lower atmosphere | Strong clinic identity, custom signage/narrative, material variation, composition, lighting, prop silhouettes. |
| Synthesized sounds may feel artificial | Lower fear response | Layer filtered noise/oscillators, spatial timing, silence, varied envelopes, room-dependent filtering. |
| Axis-aligned collision diverges from visible props | Sticking/clipping | Collide only architecture/closed doors, keep props non-blocking or use simple authored blockers, add tests. |
| Long sequence can become unwinnable after refresh | Player frustration | Explicit deterministic stage machine, checkpoints, stage-derived world state, save validation, reset action. |
| WebGL context loss | Blank screen | Context lost/restored UI and recover/reload path; error boundary. |
| Background tab produces huge delta/audio drift | Teleport/event burst | Delta clamp, pause on visibility, cancel transient schedules. |
| Scope versus polish | Generic broad demo | One compact, replayable clinic floor; prioritize controls/audio/event timing over extra rooms or enemies. |

## 16. Development milestones

1. **Foundation** — scaffold strict Vite/React/R3F project, quality gates, support/loading shell, state contracts.
2. **Playable greybox** — clinic map, camera, pointer lock, grounded movement, AABB collision, interaction ray.
3. **Core systems** — progression/checkpoints, flashlight battery/recovery, doors, prompt/HUD/pause/settings.
4. **Atmosphere** — materials, detailed props/signage/notes, practical lights/fog/film treatment, procedural spatial audio.
5. **Psychological sequence** — typed horror events, attention episodes, environmental mutations, escalation, final twist/restart.
6. **Hardening** — automated tests, browser smoke/manual walkthrough, performance adaptation, failure states, persistence migration.
7. **Release preparation** — README, architecture/assets/deployment docs, license/security audit, build validation, logical commits, push, and pull request.

## Research references

- R3F performance guidance: <https://r3f.docs.pmnd.rs/advanced/pitfalls>
- R3F scaling/performance monitor: <https://r3f.docs.pmnd.rs/advanced/scaling-performance>
- Three.js Octree/capsule API: <https://threejs.org/docs/pages/Octree.html>
- MDN Pointer Lock API: <https://developer.mozilla.org/en-US/docs/Web/API/Pointer_Lock_API>
- MDN Web Audio best practices/autoplay: <https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices>
- MDN spatial audio fundamentals: <https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Web_audio_spatialization_basics>
- Zustand persistence: <https://zustand.docs.pmnd.rs/reference/integrations/persisting-store-data>
- Vite static deployment: <https://vite.dev/guide/static-deploy>
- Render Blueprint reference: <https://render.com/docs/blueprint-spec>
- Render redirects/rewrites: <https://render.com/docs/redirects-rewrites>
- Poly Haven license: <https://polyhaven.com/license>
- ambientCG license: <https://docs.ambientcg.com/license/>
- Kenney licensing/support: <https://kenney.nl/support>
