# Farworlds

A new world on every new tab. Farworlds replaces the browser's new tab page with a procedurally generated
planet, star, gas giant or asteroid rendered in 3D, with the time, the date and the world's name beside it.
Every world comes from a coordinate you can copy and share; the same coordinate always shows the same world.

Drag to orbit, scroll to zoom. Shuffle for a random world, travel to exact coordinates, keep a logbook of where
you have been and the worlds you want to see again. Optional widgets add a search bar (your browser's default
engine) and a row of most visited sites; both are off until you turn them on in settings.

## Install (development)

```bash
corepack enable
yarn install
yarn build
```

Then open `chrome://extensions`, enable Developer mode, choose Load unpacked, and select the `dist/` folder.
Open a new tab.

## Develop

```bash
yarn typecheck
yarn lint
yarn test
yarn build
```

Reload the extension card after each build and open a fresh tab.

## Docs

- `docs/architecture.md`: stack, layout, determinism model, generation pipeline, persistence.
- `docs/original-extension.md`: the behaviour Farworlds reproduces, and the licensing rule for `archive/`.
- `docs/code-map.md` and `docs/research.md`: reference material about the original extension.

## Credits

Terrain generation follows Sebastian Lague's Procedural Planets series (MIT). GLSL simplex noise by Ian McEwan,
Ashima Arts (MIT). Lato by Łukasz Dziedzic (SIL OFL 1.1).
