// Copyright © 2026 Alex Navarro

import type { Era } from './coordinates'
import type { Rng } from './rng'
import type { NoiseLayerSettings, Palette } from './types'

// Utility
import { hslToHex } from './color'

// Misc
import { NoiseFilterType, PlanetType } from './types'

/**
 * How likely each world type is, per era. The second era introduced gas giants and made bare worlds rarer, and
 * both tables stay frozen so revisiting an old coordinate keeps its type.
 */
export const TYPE_ODDS_BY_ERA = {
  0: [
    { type: PlanetType.Ocean, weight: 50 },
    { type: PlanetType.OceanIsland, weight: 10 },
    { type: PlanetType.OceanRidge, weight: 10 },
    { type: PlanetType.Star, weight: 10 },
    { type: PlanetType.Bare, weight: 15 },
    { type: PlanetType.Asteroid, weight: 5 },
  ],
  1: [
    { type: PlanetType.Ocean, weight: 50 },
    { type: PlanetType.OceanIsland, weight: 10 },
    { type: PlanetType.OceanRidge, weight: 10 },
    { type: PlanetType.Star, weight: 10 },
    { type: PlanetType.GasGiant, weight: 10 },
    { type: PlanetType.Bare, weight: 5 },
    { type: PlanetType.Asteroid, weight: 5 },
  ],
} as const satisfies Record<Era, ReadonlyArray<{ type: PlanetType, weight: number }>>

export function rollPlanetType(rng: Rng, era: Era): PlanetType {
  const odds = TYPE_ODDS_BY_ERA[era]
  const total = odds.reduce((sum, entry) => sum + entry.weight, 0)
  let roll = rng.next() * total

  for (const entry of odds) {
    roll -= entry.weight
    if (roll < 0) {
      return entry.type
    }
  }

  // Floating point can leave a hair of probability past the last entry; it belongs to that entry.
  return odds[odds.length - 1]?.type ?? PlanetType.Ocean
}

export type Archetype = {
  hasOcean: boolean
  hasClouds: boolean
  ringChance: number
  moonChance: number
  habitability: [number, number]
  /** Degrees Celsius. */
  temperature: [number, number]
  buildLayers(rng: Rng): NoiseLayerSettings[]
  buildPalette(rng: Rng): Palette
}

function noiseLayer(overrides: Partial<NoiseLayerSettings> & Pick<NoiseLayerSettings, 'type'>): NoiseLayerSettings {
  return {
    enabled: true,
    strength: 1,
    octaves: 4,
    baseRoughness: 1,
    roughness: 2,
    persistence: 0.5,
    minValue: 0,
    weightMultiplier: 0.8,
    centre: [0, 0, 0],
    useFirstLayerAsMask: false,
    ...overrides,
  }
}

function randomCentre(rng: Rng): [number, number, number] {
  return [rng.range(-100, 100), rng.range(-100, 100), rng.range(-100, 100)]
}

/** Continents: broad simple noise with a floor so roughly half the surface sits below sea level. */
function continentLayer(rng: Rng, strength: number, minValue: number): NoiseLayerSettings {
  return noiseLayer({
    type: NoiseFilterType.Simple,
    strength,
    octaves: 5,
    baseRoughness: rng.range(0.7, 1.1),
    roughness: rng.range(2, 2.6),
    persistence: rng.range(0.45, 0.55),
    minValue,
    centre: randomCentre(rng),
  })
}

/** Mountains: ridged noise masked by the continents so ranges only rise on land. */
function mountainLayer(rng: Rng, strength: number): NoiseLayerSettings {
  return noiseLayer({
    type: NoiseFilterType.Ridged,
    strength,
    octaves: 4,
    baseRoughness: rng.range(1.4, 2),
    roughness: rng.range(2.2, 3),
    persistence: rng.range(0.45, 0.6),
    minValue: rng.range(0.55, 0.75),
    weightMultiplier: 0.8,
    centre: randomCentre(rng),
    useFirstLayerAsMask: true,
  })
}

/** Ocean worlds share one palette recipe: a cool sea, two land hues, tinted highlands and near-white poles. */
function oceanPalette(rng: Rng): Palette {
  const oceanHue = rng.range(170, 290)
  const landHueA = rng.range(0, 360)
  const landHueB = landHueA + rng.range(60, 200)
  return {
    ocean: hslToHex(oceanHue, 0.75, 0.42),
    shallows: hslToHex(oceanHue, 0.7, 0.6),
    beach: hslToHex(rng.range(35, 55), 0.55, 0.78),
    lowlandA: hslToHex(landHueA, 0.6, 0.5),
    lowlandB: hslToHex(landHueB, 0.55, 0.48),
    highland: hslToHex(landHueA + rng.range(-20, 20), 0.25, 0.35),
    polar: hslToHex(oceanHue, 0.15, 0.94),
    accent: hslToHex(oceanHue, 0.6, 0.7),
  }
}

/** Rocks: one hue family, shaded by height, no water anywhere. Also used for moons. */
export function rockPalette(rng: Rng): Palette {
  const hue = rng.range(0, 360)
  const saturation = rng.range(0.15, 0.6)
  return {
    ocean: hslToHex(hue, saturation, 0.2),
    shallows: hslToHex(hue, saturation, 0.3),
    beach: hslToHex(hue, saturation, 0.4),
    lowlandA: hslToHex(hue, saturation, 0.45),
    lowlandB: hslToHex(hue + rng.range(-25, 25), saturation, 0.5),
    highland: hslToHex(hue, saturation * 0.6, 0.62),
    polar: hslToHex(hue, saturation * 0.4, 0.7),
    accent: hslToHex(hue, saturation, 0.55),
  }
}

/** Stars: a hot core colour and a brighter glow. Hue leans red, orange, yellow, white or blue like real stars. */
function starPalette(rng: Rng): Palette {
  const hue = rng.pick([0, 12, 25, 40, 50, 195, 210, 225])
  const core = hslToHex(hue, 0.95, 0.62)
  return {
    ocean: core,
    shallows: core,
    beach: core,
    lowlandA: hslToHex(hue, 0.9, 0.5),
    lowlandB: hslToHex(hue + 10, 0.9, 0.7),
    highland: hslToHex(hue, 0.8, 0.85),
    polar: hslToHex(hue, 0.5, 0.95),
    accent: hslToHex(hue, 1, 0.75),
  }
}

/** Gas giants: two band hues around a base, with a pale accent for the brightest bands. */
function gasGiantPalette(rng: Rng): Palette {
  const hue = rng.range(0, 360)
  const bandHue = hue + rng.range(25, 70)
  return {
    ocean: hslToHex(hue, 0.55, 0.3),
    shallows: hslToHex(hue, 0.6, 0.5),
    beach: hslToHex(bandHue, 0.6, 0.62),
    lowlandA: hslToHex(hue, 0.6, 0.36),
    lowlandB: hslToHex(bandHue, 0.55, 0.58),
    highland: hslToHex(bandHue, 0.45, 0.78),
    polar: hslToHex(hue, 0.35, 0.7),
    accent: hslToHex(hue + 180, 0.5, 0.7),
  }
}

export const archetypeByType = {
  [PlanetType.Ocean]: {
    hasOcean: true,
    hasClouds: true,
    ringChance: 0.2,
    moonChance: 0.2,
    habitability: [80, 100],
    temperature: [0, 50],
    buildLayers: (rng) => [
      continentLayer(rng, rng.range(0.18, 0.26), rng.range(0.95, 1.1)),
      mountainLayer(rng, rng.range(0.2, 0.35)),
    ],
    buildPalette: oceanPalette,
  },
  [PlanetType.OceanRidge]: {
    hasOcean: true,
    hasClouds: true,
    ringChance: 0.2,
    moonChance: 0.2,
    habitability: [40, 80],
    temperature: [-20, 100],
    buildLayers: (rng) => [
      continentLayer(rng, rng.range(0.2, 0.28), rng.range(0.85, 1)),
      mountainLayer(rng, rng.range(0.22, 0.32)),
      mountainLayer(rng, rng.range(0.08, 0.12)),
    ],
    buildPalette: oceanPalette,
  },
  [PlanetType.OceanIsland]: {
    hasOcean: true,
    hasClouds: true,
    ringChance: 0.2,
    moonChance: 0.2,
    habitability: [60, 100],
    temperature: [10, 50],
    buildLayers: (rng) => [
      continentLayer(rng, rng.range(0.24, 0.32), rng.range(1.08, 1.18)),
      mountainLayer(rng, rng.range(0.2, 0.3)),
    ],
    buildPalette: oceanPalette,
  },
  [PlanetType.Bare]: {
    hasOcean: false,
    hasClouds: false,
    ringChance: 0,
    moonChance: 0.2,
    habitability: [0, 10],
    temperature: [-150, -50],
    buildLayers: (rng) => [
      continentLayer(rng, rng.range(0.1, 0.16), rng.range(0.6, 0.8)),
      mountainLayer(rng, rng.range(0.15, 0.3)),
    ],
    buildPalette: rockPalette,
  },
  [PlanetType.Asteroid]: {
    hasOcean: false,
    hasClouds: false,
    ringChance: 0,
    moonChance: 0.2,
    habitability: [0, 5],
    temperature: [-150, -50],
    buildLayers: (rng) => [
      noiseLayer({
        type: NoiseFilterType.Simple,
        strength: rng.range(0.35, 0.5),
        octaves: 3,
        baseRoughness: rng.range(0.5, 0.8),
        roughness: 2.4,
        persistence: 0.5,
        minValue: 0.9,
        centre: randomCentre(rng),
      }),
      noiseLayer({
        type: NoiseFilterType.Ridged,
        strength: rng.range(0.08, 0.14),
        octaves: 4,
        baseRoughness: 3,
        roughness: 2.5,
        persistence: 0.5,
        minValue: 0.3,
        centre: randomCentre(rng),
      }),
    ],
    buildPalette: rockPalette,
  },
  [PlanetType.Star]: {
    hasOcean: false,
    hasClouds: false,
    ringChance: 0,
    moonChance: 0,
    habitability: [0, 0],
    temperature: [4000, 10000],
    buildLayers: () => [],
    buildPalette: starPalette,
  },
  [PlanetType.GasGiant]: {
    hasOcean: false,
    hasClouds: false,
    ringChance: 0.6,
    moonChance: 0.5,
    habitability: [0, 0],
    temperature: [-180, -50],
    buildLayers: () => [],
    buildPalette: gasGiantPalette,
  },
} as const satisfies Record<PlanetType, Archetype>
