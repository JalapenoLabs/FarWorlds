// Copyright © 2026 Alex Navarro

import type { NoiseLayerSettings } from './types'

// Core
import { describe, expect, it } from 'vitest'

// Utility
import { createElevationSampler, createRidgedFilter, createSimpleFilter } from './noise'

// Misc
import { NoiseFilterType } from './types'

function layer(overrides: Partial<NoiseLayerSettings>): NoiseLayerSettings {
  return {
    type: NoiseFilterType.Simple,
    enabled: true,
    strength: 1,
    octaves: 3,
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

describe('createSimpleFilter', () => {
  it('is deterministic per seed and differs across seeds', () => {
    const settings = layer({})
    const first = createSimpleFilter('a', settings)
    const second = createSimpleFilter('a', settings)
    const other = createSimpleFilter('b', settings)
    expect(first(0.3, 0.2, 0.9)).toBe(second(0.3, 0.2, 0.9))
    expect(first(0.3, 0.2, 0.9)).not.toBe(other(0.3, 0.2, 0.9))
  })

  it('scales with strength and subtracts the floor', () => {
    const base = createSimpleFilter('s', layer({}))
    const scaled = createSimpleFilter('s', layer({ strength: 2 }))
    const floored = createSimpleFilter('s', layer({ minValue: 0.5 }))
    expect(scaled(0.1, 0.2, 0.3)).toBeCloseTo(base(0.1, 0.2, 0.3) * 2, 10)
    expect(floored(0.1, 0.2, 0.3)).toBeCloseTo(base(0.1, 0.2, 0.3) - 0.5, 10)
  })
})

describe('createRidgedFilter', () => {
  it('never exceeds the octave sum since each octave is at most one', () => {
    const filter = createRidgedFilter('r', layer({ type: NoiseFilterType.Ridged, octaves: 4 }))
    for (let index = 0; index < 200; index++) {
      const value = filter(Math.sin(index), Math.cos(index * 1.3), Math.sin(index * 0.7))
      expect(value).toBeLessThanOrEqual(1 + 0.5 + 0.25 + 0.125)
      expect(value).toBeGreaterThanOrEqual(0)
    }
  })
})

describe('createElevationSampler', () => {
  it('masks later layers by the first layer when asked', () => {
    const first = layer({ strength: 0.5 })
    const second = layer({ type: NoiseFilterType.Ridged, useFirstLayerAsMask: true })
    const masked = createElevationSampler('m', [first, second])
    const unmasked = createElevationSampler('m', [first, { ...second, useFirstLayerAsMask: false }])
    const firstOnly = createElevationSampler('m', [first])

    const point: [number, number, number] = [0.4, -0.2, 0.8]
    const firstValue = firstOnly(...point)
    const secondContribution = unmasked(...point) - firstValue
    expect(masked(...point)).toBeCloseTo(firstValue + secondContribution * firstValue, 10)
  })

  it('ignores disabled layers', () => {
    const enabled = createElevationSampler('d', [layer({}), layer({ enabled: false, strength: 100 })])
    const alone = createElevationSampler('d', [layer({})])
    expect(enabled(0.1, 0.1, 0.1)).toBe(alone(0.1, 0.1, 0.1))
  })
})
