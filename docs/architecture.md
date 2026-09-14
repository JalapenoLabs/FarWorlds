# Architecture

Farworlds is a Manifest V3 new-tab extension: one page, no permissions, no network. Everything a tab shows is
generated on the machine from a coordinate.

## Stack

| Concern | Choice | Pinned |
| --- | --- | --- |
| Build | Vite with the CRXJS plugin (manifest from `manifest.config.ts`) | 8.3.0 / 2.7.1 |
| UI | React + Redux Toolkit + react-redux | 19.3.0 / 2.12.0 / 9.3.0 |
| Styling | Tailwind CSS v4 plus a few global classes in `src/newtab/styles.css` | 4.3.3 |
| 3D | three.js | 0.186.0 |
| Noise | simplex-noise, seeded by our own RNG | 4.0.3 |
| Copy | i18next + react-i18next, `en-US` only today | 26.4.2 / 17.0.14 |
| Time | moment | 2.30.1 |
| Tests | Vitest, node environment | 5.0.0 |
| Package manager | Yarn 4.17.0 via Corepack; Node 24.13.0 via mise | |

No HeroUI. A new tab must paint instantly, and HeroUI pulls in framer-motion and a component runtime that
dwarfs the rest of the overlay. The overlay has four small panels and a handful of icon buttons; they are
plain elements styled with the global classes (`panel`, `field`, `button`, `icon-button`). Revisit if the
overlay grows real forms.

## Layout

```text
manifest.config.ts       MV3 manifest (newtab override, action, module service worker)
newtab.html              Page shell: a canvas for three.js and a root for React
src/background.ts        Service worker: toolbar click opens the page
src/constants.ts         Shared limits and tunables
src/i18n.ts, src/locales Copy
src/planet/              Pure generation: no DOM, no three, fully unit tested
src/scene/               three.js: scene controller, world meshes, shaders, procedural sprites
src/store/               Redux slices, typed hooks, localStorage persistence
src/hooks/               useSpaceScene (binds store to scene, owns travel), useClock
src/components/          HUD, overlay controls, panels
docs/                    Decisions (this folder)
archive/                 Closed-source original for behavioural reference; git-ignored
```

## Determinism

A world is identified by its seed string, `x.toFixed(2) + y.toFixed(2) + z.toFixed(2) + era`, with era zero
written as an empty suffix. That format is kept from the original so a shared coordinate means the same
thing. From the seed, each subsystem derives its own stream with `deriveSeed(seed, purpose)`:
`type`, `terrain`, `palette`, `features` (rings, moons, clouds), `stats`, `name`, plus per-layer noise seeds
and `moon<n>` seeds. Streams never share state, so adding a random draw to one subsystem cannot change
another's output. The RNG is mulberry32 over an xmur3 hash (`src/planet/rng.ts`).

Same coordinate, same Farworlds world, always. It does not reproduce the original extension's world for that
coordinate; that would require the original's code.

## Eras

`w` selects the type-odds table (`TYPE_ODDS_BY_ERA`). Era 1 is current. When the generator changes in a way
that alters existing worlds, add an era rather than editing a table, so old coordinates keep their look.

## Generation pipeline

1. `createPlanetBlueprint(coordinates)` rolls the type, palette, noise layers, ring, moons, name and stats.
   Plain data, safe to post to workers and store in the logbook.
2. `SpaceScene.showWorld` asks `createWorld` for meshes. Terrain runs through `buildPlanetGeometry`: six
   cube-sphere faces are built by the shared worker pool (`src/planet/workerPool.ts`, sized to cores minus one,
   capped at six), concatenated, welded with `mergeVertices`, and given normals once. Per-face normals would
   show seams along every cube edge; the face builder guarantees bit-identical edge vertices and a test checks it.
3. Colours are baked per vertex in the worker (`src/planet/biomes.ts`, one strategy per type). Oceans are a
   separate translucent sphere at sea radius; terrain below sea level stays in the mesh so shallows read through
   the water. Clouds are a shader shell (3D simplex in GLSL). Star glow, star sprites and ring bands are drawn
   on canvases at runtime; no image assets ship.
4. The previous world shrinks out while the new one grows in; the camera keeps its orbit direction and refits
   the distance to the new system.

Terrain shape follows Sebastian Lague's Procedural Planets (MIT): simple and ridged noise filters, first
layer as mask, cube-to-sphere projection.

## Persistence

`settings` and `playerData` are written to `localStorage` under one key, debounced. Thumbnails are small
JPEG data URLs captured from the live renderer after the arrival animation. Nothing else is stored, and
nothing leaves the machine.

## Sharing

The share button copies `x, y, z, era` as text; the travel panel accepts that text on paste. There is no hosted
share page. The page also reads `?x=&y=&z=&w=` so a link to the extension page itself works between profiles
that have the extension installed.

## Verification

- `yarn typecheck`, `yarn lint`, `yarn test` must pass before a commit.
- Visual checks: build, serve `dist/` statically, render with headless Chromium
  (`--use-angle=swiftshader --enable-unsafe-swiftshader`) and look at the screenshots. Six worlds across all
  seven types are the minimum set.
- Install check: `chrome://extensions`, Developer mode, Load unpacked, pick `dist/`.
