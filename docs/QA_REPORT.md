# QA Report

**Validation date:** 2026-09-11

**Environment:** Linux sandbox, Node 22.22.3, npm 10.9.8

This report distinguishes executed checks from expected compatibility. It does not claim a public Render deployment or browser engines that were unavailable.

## Automated quality gate

Executed successfully after implementation:

```bash
npm run format:check
npm run typecheck
npm run lint
npm test
npm run build
npm audit --omit=dev
```

Results:

- Prettier: all matched files formatted
- TypeScript: strict project references compiled with no error
- ESLint: no warning or error (`--max-warnings 0`)
- Vitest: **9 files, 24 tests passed**
- Production build: succeeded with Vite 8.3.0
- Runtime-only and complete dependency audits: 0 vulnerabilities reported

The 24 tests cover:

- AABB collision stop, wall slide, high-speed substeps, and dynamic disabled colliders
- Trigger-zone lookup
- Attention turn/return/expiry behavior
- Flashlight drain, recovery guarantees, and low-charge intensity
- Ordered stage progression and objective/chapter derivation
- Malformed settings recovery, settings bounds, and checkpoint round trip
- Runtime store transition and bounded checkpoint output
- Unique level registries, safe checkpoint spawns, and critical door blockers
- Unique/valid horror definitions and harmless attention-event uncertainty
- Complete critical interaction sequence from first breaker inspection to open exit
- Refusal to skip locked Records and Exit doors

## Chromium browser smoke tests

A temporary Chromium Headless Shell was run with software WebGL (ANGLE/SwiftShader). The temporary browser/test harness was not added to the project dependency graph or committed.

Detected in browser:

```text
WebGL: true
WebGL2: true
Pointer Lock: true
AudioContext: true
User agent: HeadlessChrome 152.0.7977.0
```

### Development application checks

Executed against the live Vite application:

- Loading completed and revealed `.main-menu`.
- Menu title, New Game, and Arrival overlay rendered.
- Clicking Enter obtained Pointer Lock and entered `phase-playing`.
- HUD and initial objective rendered.
- Holding `W` changed the actual shared player Z position.
- Pressing `F` toggled the flashlight off and on.
- Teleporting the test observer near the panel, without changing game state, let the real center Raycaster focus `BREAKER PANEL`.
- Pressing `E` through the normal keyboard handler advanced to `fuse-needed`.
- A full browser-side interaction sequence produced exactly:

  ```text
  fuse-needed
  fuse-found
  power-restored
  office-searched
  transcript-found
  records-read
  ward-open
  patient-note-read
  key-found
  exit-open
  ```

- Exit-open checkpoint data appeared in `localStorage`.
- Beginning the final sequence rendered the ending surface.
- Captured `pageerror`, `console.error`, and failed-request lists remained empty.

### Production-output check

Executed against `npm run preview` after the final code-splitting configuration:

- Main menu loaded from built `dist` output.
- New Game → Enter reached `app phase-playing`.
- Browser loaded the expected fingerprinted entry, CSS, lazy GameCanvas, and Three.js vendor chunks.
- No page exception, console error, or failed request was captured.

### Visual review

Temporary screenshots (not shipped) were inspected at:

- 1440 × 900: main menu and Arrival overlay
- 960 × 600: low-quality in-game HUD and flashlight scene

The review led to a flashlight/ambient-light calibration pass so nearby geometry remains navigable while distance remains obscured. Title hierarchy, menu focus, controls grid, objective, battery HUD, and center reticle remained legible at both sizes.

## Production footprint

Final `dist` summary at validation time:

| File                       |       Raw | Gzip reported by Vite |
| -------------------------- | --------: | --------------------: |
| Entry JavaScript           | 231.18 kB |              73.61 kB |
| Lazy GameCanvas JavaScript | 202.43 kB |              63.64 kB |
| Three.js vendor chunk      | 724.33 kB |             184.51 kB |
| CSS                        |  19.39 kB |               5.57 kB |
| Open Graph PNG             | 334.62 kB |                   n/a |
| HTML                       |   1.76 kB |               0.72 kB |

Total uncompressed `dist`: approximately **1.5 MB**. The menu entry and 3D scene are separate chunks; Three.js is isolated for browser caching. There are no model, texture, audio, or font downloads.

## Security and asset review

- No `.env`, API key, credential, backend URL, analytics endpoint, or remote runtime asset exists.
- No `dangerouslySetInnerHTML` usage exists.
- Persistence input is parsed defensively and enum/numeric values are validated.
- Render security headers and unused-capability restrictions are encoded in `render.yaml`.
- Shipped content was checked against `ASSETS.md`; it is project-authored/procedural.
- Poly Haven, ambientCG, and Kenney official CC0 terms were researched, but no file from those sites is represented as bundled content.

## Not verified / remaining launch checks

- **Firefox and Microsoft Edge were not installed**, so no executed compatibility claim is made for them. A hands-on pass in both is recommended before public launch, especially Pointer Lock retry and HRTF balance.
- Headless Chromium initialized `AudioContext` and executed graph code, but a headless runner cannot judge audible quality, loudness, rear localization, or headphone comfort. Final listening QA requires a human with headphones.
- SwiftShader timing is not representative of a hardware GPU, so no numeric desktop FPS claim is made. Draw-call/light/DPR controls and automatic quality fallback are implemented; hardware profiling remains a release-device check.
- Render configuration and a local production preview were verified, but **the app was not deployed to a public Render URL** in this environment.
- The full 10–15 minute pacing estimate is for a first exploratory play; automated flow deliberately bypassed travel and reading time and therefore does not validate emotional pacing.
