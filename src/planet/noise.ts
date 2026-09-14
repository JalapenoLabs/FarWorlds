// Copyright © 2026 JalapenoLabs

/**
 * Layered simplex noise filters.
 *
 * The Simple and Ridged filters follow Sebastian Lague's Procedural Planets series
 * (https://github.com/SebLague/Procedural-Planets, MIT License, Copyright (c) 2018 Sebastian Lague),
 * ported to TypeScript and driven by seeded simplex noise so results are reproducible.
 */

import type { NoiseLayerSettings } from './types'

// Core
import { createNoise3D } from 'simplex-noise'

// Utility
import { createRng } from './rng'

export type NoiseFilter = (x: number, y: number, z: number) => number

const filterFactoryByType = {
  simple: createSimpleFilter,
  ridged: createRidgedFilter,
} as const satisfies Record<NoiseLayerSettings['type'], (seed: string, settings: NoiseLayerSettings) => NoiseFilter>

export function createNoiseFilter(seed: string, settings: NoiseLayerSettings): NoiseFilter {
  return filterFactoryByType[settings.type](seed, settings)
}

/** Fractal sum of octaves, each remapped to 0..1 before weighting, minus a floor. */
export function createSimpleFilter(seed: string, settings: NoiseLayerSettings): NoiseFilter {
  const noise = createNoise3D(createRng(seed).next)
  const [centreX, centreY, centreZ] = settings.centre

  return (x, y, z) => {
    let value = 0
    let frequency = settings.baseRoughness
    let amplitude = 1

    for (let octave = 0; octave < settings.octaves; octave++) {
      const sample = noise(
        x * frequency + centreX,
        y * frequency + centreY,
        z * frequency + centreZ,
      )
      value += (sample + 1) * 0.5 * amplitude
      frequency *= settings.roughness
      amplitude *= settings.persistence
    }

    return (value - settings.minValue) * settings.strength
  }
}

/**
 * Inverted absolute noise squared, so ridges form where the noise crosses zero; each octave is weighted by the
 * one before it.
 */
export function createRidgedFilter(seed: string, settings: NoiseLayerSettings): NoiseFilter {
  const noise = createNoise3D(createRng(seed).next)
  const [centreX, centreY, centreZ] = settings.centre

  return (x, y, z) => {
    let value = 0
    let frequency = settings.baseRoughness
    let amplitude = 1
    let weight = 1

    for (let octave = 0; octave < settings.octaves; octave++) {
      const sample = noise(
        x * frequency + centreX,
        y * frequency + centreY,
        z * frequency + centreZ,
      )
      let ridge = 1 - Math.abs(sample)
      ridge *= ridge
      ridge *= weight
      weight = Math.min(1, Math.max(0, ridge * settings.weightMultiplier))

      value += ridge * amplitude
      frequency *= settings.roughness
      amplitude *= settings.persistence
    }

    return (value - settings.minValue) * settings.strength
  }
}

/**
 * Combines every enabled layer into one elevation. The first layer doubles as a mask for later layers that ask
 * for it, which keeps mountain ranges on land instead of scattering them across the sea floor.
 */
export function createElevationSampler(seed: string, layers: NoiseLayerSettings[]): NoiseFilter {
  const filters = layers.map((layer, index) => createNoiseFilter(`${seed}:layer${index}`, layer))
  const [firstLayer] = layers
  const [firstFilter] = filters

  return (x, y, z) => {
    let firstLayerValue = 0
    let elevation = 0

    if (firstFilter && firstLayer) {
      firstLayerValue = firstFilter(x, y, z)
      if (firstLayer.enabled) {
        elevation = firstLayerValue
      }
    }

    for (let index = 1; index < filters.length; index++) {
      const layer = layers[index]
      const filter = filters[index]
      if (!layer?.enabled || !filter) {
        continue
      }
      const mask = layer.useFirstLayerAsMask
        ? firstLayerValue
        : 1
      elevation += filter(x, y, z) * mask
    }

    return elevation
  }
}
