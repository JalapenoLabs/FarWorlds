# Archived bundle code map

Line numbers refer to `archive/prettified/index.pretty.js` (prettier 3.3.3, print width 120, 49,993 lines).
`archive/prettified/app-slice.pretty.js` is lines 40560 to the end of that file, the application code after the
three.js module. Use these to *read* behaviour; see `original-extension.md` for the licensing rule.

## Vendored libraries (skip when reading)

| Lines | Library |
| --- | --- |
| 1–60 | webpack runtime |
| ~3500 | core-js 3.6.4 |
| ~4139 | stats.js (REVISION 16) |
| ~6000–8300 | moment |
| ~9200–9700 | seedrandom (alea and friends; `global` option at 9655) |
| ~10185–16560 | react 16.12.0, react-dom, scheduler |
| ~18000–24000 | styled-components, redux, react-redux, redux-persist |
| 24700–40558 | three.js r113 (devtools register at 40558) |
| ~44000–45800 | dat.gui, tween.js |

## Application code

| Line | What |
| --- | --- |
| 41171 | `Mu`/`Eu` = seedrandom import |
| 41197 | `Eu()(planetSeed, { global: true })`: global Math.random override per planet |
| 41240 | noise type enum `Simple` / `Ridged` |
| 41246 | planet type enum with display names |
| 41255 | `Lu`: coordinate → seed string |
| 41260 | `Nu`: random coordinate (`w: 1`); `Du`: parse `?x=&y=&z=&w=` from URL with clamping |
| 41285 | planet config class defaults (lights, radius 5, resolution 128, colours, rotation, ring, moons) |
| 41560 | face renderer: worker `planet_data` → BufferGeometry attributes; `request_planet` message shape at 41612 |
| 41639 | `$u(min, max)`: uniform random helper used for stats |
| 41800 | name generator tables and templates |
| 41900 | base planet class: hue picks, beach and biome settings, ring and moon settings, cloud colour at 41927 |
| 42000 | moon generation (`seed + "-moon-" + index`) |
| 42210 | gas giant class (type, temp 4000–10000, ring aligned to axis) |
| 42381 | gas giant surface shader (`planetCoords`, `time`, fbm bands) |
| 42544 | glow sprite (`assets/glow.png`) |
| 42595 | smoke / flare sprites (`assets/smoke.png`, `assets/flare.png` at 42752) |
| 42605 | star material with `colorStart` / `colorEnd` gradient, shader at 42663 |
| 42811 | simplex noise wrapper seeded by planet seed |
| 42914 | noise generator factory from noise settings |
| 43080 | cloud shell shader (`cloudColor`, 4D noise over time) |
| 45760 | dat.gui debug panel bindings (hidden in production) |
| 46140 | settings enum and defaults (`pf`) |
| 46184 | `playerData` defaults; reducers for travel history (50) and bookmarks (50, keyed by seed) |
| 46625 | redux-persist config: key `root`, whitelist `settings`, `playerData` |
| 46749 | Ocean Planet subclass (noise layers, 20% ring, 20% moons, hab 80–100, temp 0–50) |
| 46790 | Ocean Ridge Planet subclass |
| 46831 | Ocean Island Planet subclass |
| 46872 | Asteroid subclass |
| 46911 | Bare Planet subclass |
| 46949 | Star subclass |
| 46983 | `np`: seed RNG then dispatch by `w` (`rp` for w = 1, `ip` for w = 0) with type probabilities |
| 48158 | planet info panel (Habitability, Surface Temperature rows; °F/°C formatting at 48169) |
| 48510 | settings panel (time format select) |
| 48621 | travel panel coordinate inputs |
| 48821 | share URL builder |
| 49008 | booklet thumbnail URL builder |
| 49914 | booklet tabs "Travel History" / "Favorites" |

## Worker (`archive/prettified/worker.pretty.js`, 874 lines)

Webpack bundle. Entry at line 844: `onmessage` handles `request_planet`, builds one cube face at the given
resolution and radius, evaluates noise layers plus the precipitation layer, flattens ocean, computes normals,
and posts `{ event: "planet_data", data: [{ planetGeometryData }] }` with transferables `indices`, `vertices`,
`elevations`, `precipitations`, `polarVals`, `normals`.
