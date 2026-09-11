# Asset and License Ledger

**Last reviewed:** 2026-09-11

No third-party game art, 3D model, texture, font file, music track, or sound sample is shipped. The production application makes no runtime asset request to an external host.

## Shipped assets

| Asset name                                      | Source                                                                                                   | URL                                                                                                                                                            | License / rights status                                           | Attribution requirement | Used in                                                                                          |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------ |
| Halcyon Annex architecture                      | Original project-authored procedural geometry                                                            | [`src/data/level.ts`](src/data/level.ts), [`src/game/environment/Building.tsx`](src/game/environment/Building.tsx)                                             | Original repository work; no third-party source material          | None                    | Walls, floors, ceiling, rooms, doorway frames, reception, stairwell                              |
| Clinic prop families                            | Original project-authored primitive geometry                                                             | [`src/game/environment/ProceduralProp.tsx`](src/game/environment/ProceduralProp.tsx)                                                                           | Original repository work; no third-party source material          | None                    | Chairs, desks, cabinets, lockers, stretchers, wheelchair, boxes, pipes, clocks, benches, plant   |
| Doors and interaction objects                   | Original project-authored primitive geometry                                                             | [`src/game/environment/Door.tsx`](src/game/environment/Door.tsx), [`src/game/environment/InteractiveObjects.tsx`](src/game/environment/InteractiveObjects.tsx) | Original repository work; no third-party source material          | None                    | Doors, panel, fuse, batteries, key, notes, case file                                             |
| Concrete/paint/tile/floor/wood material maps    | Runtime CanvasTexture generator with seeded procedural marks                                             | [`src/game/environment/EnvironmentMaterials.tsx`](src/game/environment/EnvironmentMaterials.tsx)                                                               | Original algorithm/output; no photographic or third-party input   | None                    | Shared environment materials                                                                     |
| Clinic and room signage                         | Runtime Canvas 2D generator                                                                              | [`src/game/environment/Sign.tsx`](src/game/environment/Sign.tsx), text in [`src/data/level.ts`](src/data/level.ts)                                             | Original algorithm and narrative text                             | None                    | Halcyon sign, protocol sign, room/exit markers                                                   |
| Narrative records                               | Original written text                                                                                    | [`src/data/notes.ts`](src/data/notes.ts)                                                                                                                       | Original repository work                                          | None                    | Reception protocol, unsent letter, transcript, case file, Patient 17 rules                       |
| Environmental blood/rust mark and debris papers | Original primitive geometry/material composition                                                         | [`src/game/environment/Building.tsx`](src/game/environment/Building.tsx)                                                                                       | Original repository work                                          | None                    | Records room mark and scattered debris                                                           |
| Procedural soundscape                           | Runtime Web Audio oscillator/noise/filter/envelope synthesis                                             | [`src/game/audio/AudioEngine.ts`](src/game/audio/AudioEngine.ts)                                                                                               | Original procedural synthesis; **no recorded sample is included** | None                    | Room tone, wind/noise, hum, footsteps, doors, creaks, impacts, whisper textures, breath, UI cues |
| UI and film treatment                           | Original CSS gradients, scanlines, grain, vignette, animation, and layout                                | [`src/styles/global.css`](src/styles/global.css)                                                                                                               | Original repository work                                          | None                    | All menus, HUD, notes, ending, film overlay                                                      |
| Favicon                                         | Original hand-authored SVG                                                                               | [`public/favicon.svg`](public/favicon.svg)                                                                                                                     | Original repository work                                          | None                    | Browser tab/favicon                                                                              |
| Open Graph social card                          | Original project artwork generated locally with ImageMagick drawing primitives and system type rendering | [`public/og-image.png`](public/og-image.png)                                                                                                                   | Original repository work; contains no third-party image           | None                    | Link previews / Open Graph metadata                                                              |
| Typefaces                                       | User operating-system font stack; **no font binary shipped**                                             | CSS font stacks in [`src/styles/global.css`](src/styles/global.css)                                                                                            | Runtime use of installed system fonts; no redistributed file      | None                    | UI, case notes, social-card rasterized text                                                      |

### Social-card tooling note

ImageMagick was used only as a local rasterization tool. ImageMagick itself and its code are not linked into, bundled with, or required by the application. The output consists solely of project-authored shapes/text rendered with fonts available in the build environment.

## Open-source software (not game content assets)

The app bundles open-source JavaScript packages according to the committed `package-lock.json`. Primary runtime libraries are React, React DOM, Three.js, React Three Fiber, Drei, and Zustand. Their package license metadata can be audited with:

```bash
npm ls --all
npm view react license
npm view three license
npm view @react-three/fiber license
npm view @react-three/drei license
npm view zustand license
```

These dependencies are software, not art/audio content, and are therefore not represented as game assets above.

## Researched legal sources not included

The following libraries were checked during pre-implementation research. **No file from any of them is present in the repository**, so they are not credited as though they were used.

| Resource           | Official URL                               | License finding                                                                              | Attribution                             |
| ------------------ | ------------------------------------------ | -------------------------------------------------------------------------------------------- | --------------------------------------- |
| Poly Haven         | <https://polyhaven.com/license>            | All site HDRIs, textures, and 3D models are CC0; commercial use and redistribution permitted | Not required (appreciated)              |
| ambientCG          | <https://docs.ambientcg.com/license/>      | Downloadable assets and preview renders are CC0 1.0; raw files may be included in a game     | Not required (appreciated)              |
| Kenney game assets | <https://kenney.nl/support>                | Assets on Kenney asset pages are public domain / CC0, including commercial projects          | Not required (optional “Kenney” credit) |
| Freesound          | <https://freesound.org/help/faq/#licenses> | Per-item licenses vary; CC0, CC BY, and other terms must be checked per sound                | Varies; no sound selected               |
| OpenGameArt        | <https://opengameart.org/content/faq>      | Per-item licenses vary and can include attribution/share-alike terms                         | Varies; no asset selected               |
| Sketchfab          | <https://sketchfab.com/licenses>           | Per-model Creative Commons/standard terms vary                                               | Varies; no model selected               |

## Asset policy for future contributions

Before adding a binary asset:

1. Prefer an original asset, CC0, or public-domain work.
2. Record its exact immutable asset page—not only the provider home page.
3. Save the author, title, source URL, downloaded version/date, license version, attribution text, and modifications here.
4. Confirm commercial use and redistribution of the raw/modified file are allowed.
5. Avoid “free for personal use”, non-commercial, editorial-only, no-derivatives, ripped game files, and unclear uploads.
6. Optimize the file (GLB/GLTF, sensible geometry, 1K-or-smaller maps, compressed browser audio) only when the license permits modification.
7. Keep a copy of the license notice beside any asset pack when required.
8. Re-run production size, visual, performance, and attribution review.

If redistribution rights cannot be verified, do not commit the asset.
