# Tabiverse: target behaviour

This document is the behavioural spec for the rebuild. It describes what the original extension does, as
recovered from the last shipped build (`archive/tabiverse-0.0.0.17.xpi`, Feb 28 2020) and the store listings.
The rebuild must match it unless a decision in this folder says otherwise.

## Licensing constraint (read first)

The original is closed source ("All Rights Reserved" on AMO; the developer said so on Reddit). The archived
bundle, worker and GLSL in `archive/` are a **behavioural reference only**. Nothing from them ships verbatim:
no copied functions, shaders, syllable tables or textures. The rebuild is a clean-room reimplementation that
reproduces the behaviour described here. Reusable as-is: Lato (SIL OFL). Unknown provenance, regenerate:
`flare.png`, `glow.png`, `smoke.png`. `spacecraft.obj` is an Asset Forge export and is never loaded by the
bundle, so drop it.

## Identity

| Field | Value |
| --- | --- |
| Store name | Tabiverse: Space & Planets in New Tab |
| Chrome ID | `hpplgjkooibhfkmmepoikcjpadcojcik` |
| Firefox GUID | `{e7071edf-20cb-4957-bf55-20c3f097530f}` |
| Last version | 0.0.0.17 (Firefox), 0.0.0.16 (Chrome, Feb 27 2020) |
| Manifest | V2; `chrome_url_overrides.newtab` and `chrome_settings_overrides.homepage` both point at `index.html` |
| Permissions | none |
| Offline | `offline_enabled: true`; everything renders locally |

Background script behaviour: clicking the toolbar icon opens `index.html` in a new tab, first install opens
`index.html`, and an uninstall URL points at a Google Form feedback survey.

## Stack of the original (for parity decisions, not to copy)

React 16.12 + Redux + redux-persist (localStorage, whitelist `settings` and `playerData`), styled-components,
three.js r113, tween.js, moment, dat.gui (hidden debug panel), seedrandom, simplex-noise, Amplitude analytics,
webpack. One Web Worker per cube face generates geometry. Bundle is ~1.17 MB minified.

## Page layout

Full-viewport WebGL canvas behind a React overlay. Body background is
`radial-gradient(circle, #08253c 0%, #06152d 33%, #140521 66%, #160317 100%)` with a three-layer starfield of
small square points in white and pastel colours. Font is Lato, weight 300 base, 15px, white text.

- **Centre-left**: the celestial object, slowly auto-rotating, lit by one directional light plus faint ambient.
- **Centre-right HUD**: date (`MMM Do, YYYY`, hand-formatted with an ordinal suffix and "Sept" for
  September), large zero-padded time at 11vh (11vw when the aspect ratio is at most 1.1) with `AM`/`PM` at 6vh,
  or 24-hour, then the planet name at 5vh, hover colour `#ffc65a`, with a small magnifier icon that opens the
  planet info panel. A time-of-day greeting helper ("Good morning" 06:00–11:59, "Good afternoon" 12:00–16:59,
  else "Good evening") exists in the code but is not rendered in any screenshot; treat it as optional.
- **Widget toggles**: each overlay widget (settings, rocket, shuffle, social, share) has a visibility flag in
  state so a build can hide it.
- **Bottom-left icons**: settings (gear), rocket (coordinate travel), shuffle (random planet).
- **Bottom-right icons**: Twitter, Discord.
- **Top-left icon**: booklet (travel history and favourites drawer).
- **Top-right icon**: share (paper plane).

## Celestial objects

Every planet is derived from a coordinate `{x, y, z, w}`. `x`, `y`, `z` are in `[-9999.99, 9999.99]` with two
decimals; `w` is the generator version ("multiverse"). New tabs pick random `x`, `y`, `z` and `w = 1`. The seed
string is `x.toFixed(2) + y.toFixed(2) + z.toFixed(2) + (w === 0 ? "" : w.toFixed(0))`. The seed drives a
seeded PRNG that the original installs **globally** over `Math.random`, so every later random call (type roll,
colours, ring and moon rolls, name) is deterministic per coordinate. The rebuild must use an explicit seeded RNG
threaded through generation instead of a global override, but the observable result must remain deterministic
for a given coordinate.

Type roll by version:

| Type | Display name | w = 1 | w = 0 | Habitability | Surface temp (°C) | Ring | Moons |
| --- | --- | --- | --- | --- | --- | --- | --- |
| OCEAN_NORMAL | Ocean Planet | 50% | 50% | 80–100 | 0–50 | 20% | 20% |
| OCEAN_ISLAND | Ocean Island Planet | 10% | 10% | 60–100 | 10–50 | 20% | 20% |
| OCEAN_RIDGE | Ocean Ridge Planet | 10% | 10% | 40–80 | -20–100 | 20% | 20% |
| STAR_NORMAL | Star | 10% | 10% | 0 | 4000–10000 | no | no |
| GAS_GIANT | Gas Giant | 10% | 0% | 0 | 4000–10000 | yes (roll) | yes (roll) |
| ASTEROID_RIDGE | Bare Planet | 5% | 15% | 0–10 | -150–-50 | no | 20% |
| ASTEROID_NORMAL | Asteroid | 5% | 5% | 0–5 | -150–-50 | no | 20% |

Habitability shows as `NN.NN %`. Temperature shows as `°F (°C)` with two decimals. Coordinates show as
`α: x   β: y   γ: z` in the info panel.

Geometry: a cube-sphere (six faces, each generated in its own worker) with per-vertex attributes `position`,
`elevation`, `precipitation`, `polarVal`, `normal`. Default resolution 128 per face edge (graphics quality
setting), radius 5. Terrain is layered noise (simplex, seeded): "Simple" and "Ridged" layers with
`baseLacunarity`, `octaves`, `lacunarity`, `persistence`, `minHeight`, `strength`, `useFirstLayerAsMask`, in the
style of Sebastian Lague's Procedural Planets series. A separate moisture ("precipitation") noise field is
seeded from the planet seed plus a `_precipitation` suffix. Ocean planets flatten below sea level and colour by
height × moisture bands (each biome has a height range and a moisture range) into ocean, beach, two biome hues
and polar caps; hues are random per planet
(magenta, red, cyan, yellow, green land on blue, purple or teal oceans all occur). Ridge planets look
mountainous with sharp ridges; island planets are mostly ocean with scattered land. Bare planets and asteroids
are single-colour lumpy rocks with no water or clouds. Stars are a glowing emissive sphere with animated fbm
noise surface, a large soft glow sprite and solar flare texture. Gas giants have a banded animated noise
surface and a ring aligned to the planet axis.

Extras: clouds are a translucent noise shell (white 80% of the time, otherwise a random pastel hue) that
drifts over time. Rings are flat annuli with random inner/outer radius, tilt and a random colour list. Moons
are small seeded sub-planets orbiting the primary. Star field: three layers, ~2000 points each, ranges 100–300.

## Camera and animation

OrbitControls-style: drag to orbit, wheel to zoom, damping on. Controls are disabled during transitions. On
load the camera is further out when the object has a ring. Optional "initial zoom" flies the camera in on
page load (default off). Switching planets uses a seamless transition: the old object animates away, the
new one animates in, driven by wall-clock time, not frame count, so it keeps pace in background tabs.
Auto-rotate speed 0.0005 rad per frame-equivalent.

## Settings (gear)

| Setting | Values | Default |
| --- | --- | --- |
| Graphics Quality | Low / Medium / High (face resolution 64 / 128 / 256) | Medium (128) |
| Native Resolution | on/off (uses device pixel ratio) | off |
| Time Format | 12 Hours / 24 Hours | 12 |
| Initial Zoom | on/off | off |
| Zoom Animation | on/off | on |
| Show FPS | on/off (stats.js overlay) | off |

FPS limit setting was removed in 0.0.0.15 (renders at refresh rate).

## Travel (rocket)

A 23px button at bottom 20px, left 60px opens a form with an **Era** select (`w`: 0 "Unoceous", 1 "Dosceous"),
**Alpha**, **Beta**, **Gamma** inputs (strings, two decimals) and a **Go** submit. Values clamp to
`[-9999.99, 9999.99]`. Also readable from the page URL: `index.html?x=&y=&z=&w=`.

## Shuffle

Generates a new random coordinate with `w = 1` and travels there.

## Share (paper plane)

Copies `https://tabiverse.com/share?x=&y=&z=&w=` to the clipboard with a "copied" confirmation. That domain is
dead, so the rebuild must choose its own share format (decision pending; a self-contained
`newtab.html?x=..` link is the fallback).

## Booklet (top-left)

Drawer anchored top 20px, left 20px with two tabs, **Travel History** and **Favorites**. Each row: a thumbnail,
planet name, relative time ("a few seconds ago"), and a star toggle. Empty state reads "Nothing here yet. Go
Explore!". History keeps the last 50 visits (oldest dropped); favourites cap at 50, keyed by seed, with an alert
when full.
Clicking a row travels there. The original fetched thumbnails from `thumbnails.tabiverse.com?x=..`, which is
dead; the rebuild renders thumbnails locally (offscreen render at travel time, stored with the entry).

## Planet info panel (magnifier)

Large planet name with a "back" arrow, then labelled rows: Type, Coordinates (α β γ), Habitability, Surface
Temperature. Name also has a copy affordance.

## Planet names

Templates, chosen at random per planet:
`{CODE}-{ID}`, `{NORMAL} {ADORNMENT}`, `{ADORNMENT} {NORMAL}`, `{NORMAL} {NUMERAL}`, `New {NORMAL}`,
`Kepler-{ID}{CODE}`. `CODE` is two upper-case letters, `ID` a 4–6 digit number, `NUMERAL` a Roman numeral I–X,
`ADORNMENT` a Greek letter name (Alpha…Omega) or Major / Minor / Prime. `NORMAL` is a start syllable plus
an end syllable from two tables (examples from screenshots: Omicron Tomasamu, New Camlou, Zeta Theslisa,
Chi Sipperluga, Mu Korsamu, Kappa Harinante, Sakale VII, Adamendo Major, Meztia Phi, Bernson III, Georgefar Pi,
LW-04861, II-434034, XW-97268). Write new syllable tables with the same flavour; do not copy the originals.

## Persistence

localStorage via redux-persist, key `root`: `settings` (above) and `playerData`
(`travelHistory: []`, `bookmarks: {}`). Nothing else leaves the machine once analytics are removed.

## Dead external dependencies

| Dependency | Original use | Decision |
| --- | --- | --- |
| tabiverse.com/share | share links | replace with a local link format |
| thumbnails.tabiverse.com | booklet thumbnails | render locally |
| Amplitude | usage analytics | remove |
| forms.gle uninstall survey | feedback | remove |
| Twitter / Discord links | community | dropped; no social buttons in the rebuild |

## Roadmap the original author announced but never shipped

Black holes and space anomalies, dashboard widgets and quick-links, account system, multiplayer. None are in
scope for parity.
