// Copyright © 2026 JalapenoLabs

import type { Coordinates } from './coordinates'
import type { MoonSettings, NoiseLayerSettings, PlanetBlueprint, RingSettings } from './types'

// Utility
import { archetypeByType, rollPlanetType } from './archetypes'
import { hslToHex } from './color'
import { coordinatesToSeed } from './coordinates'
import { generateWorldName } from './naming'
import { createRng, deriveSeed } from './rng'

// Misc
import { PLANET_RADIUS } from '@/constants'
import { NoiseFilterType, PlanetType } from './types'

/**
 * Builds the complete description of a world from its coordinates. Each subsystem draws from its own derived
 * seed, so adding a random call to one never shifts the results of another.
 */
export function createPlanetBlueprint(coordinates: Coordinates): PlanetBlueprint {
  const seed = coordinatesToSeed(coordinates)
  const type = rollPlanetType(createRng(deriveSeed(seed, 'type')), coordinates.w)
  const archetype = archetypeByType[type]

  const terrainRng = createRng(deriveSeed(seed, 'terrain'))
  const paletteRng = createRng(deriveSeed(seed, 'palette'))
  const featureRng = createRng(deriveSeed(seed, 'features'))
  const statsRng = createRng(deriveSeed(seed, 'stats'))

  const palette = archetype.buildPalette(paletteRng)
  const layers = archetype.buildLayers(terrainRng)
  const moisture = buildMoistureLayer(terrainRng)

  const ring = featureRng.chance(archetype.ringChance)
    ? buildRing(featureRng, type)
    : null
  const moons = featureRng.chance(archetype.moonChance)
    ? buildMoons(featureRng, seed)
    : []
  const cloudColor = featureRng.chance(0.8)
    ? 0xffffff
    : hslToHex(featureRng.range(0, 360), 1, 0.78)

  return {
    coordinates,
    seed,
    type,
    name: generateWorldName(createRng(deriveSeed(seed, 'name'))),
    habitability: statsRng.range(archetype.habitability[0], archetype.habitability[1]),
    surfaceTemperature: statsRng.range(archetype.temperature[0], archetype.temperature[1]),
    palette,
    terrain: {
      layers,
      moisture,
      polarStart: terrainRng.range(0.72, 0.88),
      beachHeight: 0.004,
      highlandHeight: terrainRng.range(0.11, 0.16),
    },
    hasOcean: archetype.hasOcean,
    hasClouds: archetype.hasClouds,
    cloudColor,
    ring,
    moons,
    rotationSpeed: featureRng.range(0.035, 0.07),
  }
}

/** Moisture is low-frequency simple noise in 0..1, used to pick between the two lowland biomes. */
function buildMoistureLayer(rng: ReturnType<typeof createRng>): NoiseLayerSettings {
  return {
    type: NoiseFilterType.Simple,
    enabled: true,
    strength: 1,
    octaves: 3,
    baseRoughness: rng.range(0.6, 1),
    roughness: 2,
    persistence: 0.5,
    minValue: 0,
    weightMultiplier: 0.8,
    centre: [rng.range(-100, 100), rng.range(-100, 100), rng.range(-100, 100)],
    useFirstLayerAsMask: false,
  }
}

function buildRing(rng: ReturnType<typeof createRng>, type: PlanetType): RingSettings {
  const innerRadius = PLANET_RADIUS * rng.range(1.25, 1.45)
  // Gas giant rings sit in the equatorial plane; rocky worlds get a visible tilt for variety.
  const isGasGiant = type === PlanetType.GasGiant
  return {
    innerRadius,
    outerRadius: innerRadius + PLANET_RADIUS * rng.range(0.35, 0.7),
    tiltX: isGasGiant
      ? 0
      : rng.range(-0.5, 0.5),
    tiltZ: isGasGiant
      ? 0
      : rng.range(-0.35, 0.35),
    color: hslToHex(rng.range(0, 360), rng.range(0.25, 0.55), rng.range(0.6, 0.8)),
    bandCount: rng.int(3, 8),
    opacity: rng.range(0.55, 0.85),
  }
}

function buildMoons(rng: ReturnType<typeof createRng>, seed: string): MoonSettings[] {
  const count = rng.int(1, 3)
  const moons: MoonSettings[] = []
  for (let index = 0; index < count; index++) {
    moons.push({
      seed: deriveSeed(seed, `moon${index}`),
      radius: PLANET_RADIUS * rng.range(0.08, 0.2),
      orbitRadius: PLANET_RADIUS * rng.range(2.2, 3.4) + index * PLANET_RADIUS * 0.6,
      orbitSpeed: rng.range(0.08, 0.2) * (rng.chance(0.5) ? 1 : -1),
      orbitTilt: rng.range(-0.4, 0.4),
      phase: rng.range(0, Math.PI * 2),
      color: hslToHex(rng.range(0, 360), rng.range(0.05, 0.3), rng.range(0.4, 0.7)),
    })
  }
  return moons
}
