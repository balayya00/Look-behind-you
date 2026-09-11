# Render Deployment

The game is a Vite static application. It requires no web service, container, database, persistent disk, secret, or runtime environment variable.

## Recommended: Render Blueprint

The repository includes [`render.yaml`](render.yaml).

1. Push/merge the desired branch to GitHub.
2. In Render, choose **New → Blueprint**.
3. Connect this repository.
4. Review the detected `dont-look-behind-you` static service.
5. Apply the Blueprint and wait for the first build.

The Blueprint configures:

| Setting               | Value                           |
| --------------------- | ------------------------------- |
| Service type          | Static Site (`runtime: static`) |
| Build command         | `npm ci && npm run build`       |
| Publish directory     | `./dist`                        |
| Environment variables | None                            |
| Catch-all             | Rewrite `/*` to `/index.html`   |

It also applies these response headers:

- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- A Permissions Policy disabling camera, microphone, geolocation, payment, and USB
- A same-origin Content Security Policy with local data/blob image/media support and WebSocket support for development-compatible output

Render serves an existing hashed asset before evaluating the catch-all, so JavaScript, CSS, the favicon, and social image are not rewritten to HTML.

## Manual Static Site setup

If a Blueprint is not used:

1. In the Render dashboard select **New → Static Site**.
2. Connect the GitHub repository.
3. Select the deployment branch (normally `main` after the pull request merges).
4. Leave **Root Directory** empty.
5. Set **Build Command** to:

   ```bash
   npm ci && npm run build
   ```

6. Set **Publish Directory** to:

   ```text
   dist
   ```

7. Add no environment variables.
8. In **Redirects/Rewrites**, add:

   | Type    | Source | Destination   |
   | ------- | ------ | ------------- |
   | Rewrite | `/*`   | `/index.html` |

9. Add the headers from `render.yaml` if the dashboard does not import them.
10. Create the site.

## Node version

The repository pins Node 22 through:

- `.nvmrc`
- `package.json` `engines.node` (`>=22.12 <25`)

Render should use Node 22 LTS. `npm ci` consumes the committed lockfile and fails rather than silently changing the dependency graph.

## Local production verification

Before deploying:

```bash
npm ci
npm run validate
npm run preview
```

Open the preview URL and verify:

1. The loading screen reaches the menu.
2. **New Game** opens the arrival screen.
3. **Click to Enter** captures the mouse and starts room tone.
4. WASD movement and collision work.
5. `F`, `E`, and `Esc` work.
6. Reloading after a checkpoint enables **Continue**.
7. Browser DevTools has no uncaught exception or failed local asset request.

## Post-deploy verification

Use the public HTTPS URL. Pointer Lock and browser audio policy are most representative on the top-level deployed page, not an embedded dashboard preview.

- Confirm status 200 at `/`.
- Confirm `/favicon.svg` and `/og-image.png` return their correct content types.
- Confirm an unknown path rewrites to `index.html`.
- Confirm JavaScript/CSS filenames under `/assets/` are served with long-lived hashed URLs.
- Complete at least one checkpoint/reload cycle.
- Test audio with headphones and verify left/right/behind spatial cues.
- Check the console and Render deploy log.

## Caching

Vite fingerprints production JavaScript and CSS. Render can cache those immutable `/assets/*` resources aggressively. Keep `index.html` on a shorter cache policy so it references the newest hashes after a deployment. No manual cache rule is required for correctness.

## Environment variables and secrets

None. Do not add a client-side API key: every value bundled by Vite is visible to a player. Core gameplay must remain independent of remote services.

## Rollback

Render can roll back the static build artifact to a previous successful deploy. `localStorage` save version 1 remains compatible as long as the rollback supports the same stage identifiers. If a future release changes the schema, add a migration rather than reusing version 1.

## Troubleshooting

### Blank or error screen

- Inspect the browser console.
- Confirm Render published `dist`, not the repository root.
- Confirm Node 22 and a successful `npm run build` log.
- Ensure CSP/header edits did not block same-origin scripts.

### Mouse does not lock

- Open the public URL directly rather than inside a sandboxed iframe.
- Click the in-game **Click to Enter** button; scripts cannot request Pointer Lock on load.
- Ensure the browser has not blocked mouse capture for the site.

### No audio

- Click **New Game** and **Click to Enter** to satisfy autoplay policy.
- Check Master and Effects/Adaptive Ambience settings.
- Verify the tab/site is not muted.

### Direct path returns 404

Add or correct the Render rewrite `/*` → `/index.html`. The current application uses one route, but the rewrite protects future client-side routes and shared unknown paths.
