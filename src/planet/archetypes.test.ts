// Copyright © 2026 Alex Navarro

// Core
import { describe, expect, it } from 'vitest'

// Utility
import { TYPE_ODDS_BY_ERA, archetypeByType, rollPlanetType } from './archetypes'
import { createRng } from './rng'

// Misc
import { Era } from './coordinates'
import { PlanetType } from './types'

describe('TYPE_ODDS_BY_ERA', () => {
  it('sums to 100 in every era', () => {
    for (const odds of Object.values(TYPE_ODDS_BY_ERA)) {
      expect(odds.reduce((sum, entry) => sum + entry.weight, 0)).toBe(100)
    }
  })

  it('introduces gas giants only in the second era', () => {
    const firstEraTypes = TYPE_ODDS_BY_ERA[Era.First].map((entry) => entry.type)
    const secondEraTypes = TYPE_ODDS_BY_ERA[Era.Second].map((entry) => entry.type)
    expect(firstEraTypes).not.toContain(PlanetType.GasGiant)
    expect(secondEraTypes).toContain(PlanetType.GasGiant)
  })
})

describe('rollPlanetType', () => {
  it('matches the published odds over many rolls', () => {
    const rng = createRng('odds')
    const counts: Record<string, number> = {}
    const total = 20000
    for (let index = 0; index < total; index++) {
      const type = rollPlanetType(rng, Era.Second)
      counts[type] = (counts[type] ?? 0) + 1
    }
    for (const entry of TYPE_ODDS_BY_ERA[Era.Second]) {
      const observed = (counts[entry.type] ?? 0) / total * 100
      expect(Math.abs(observed - entry.weight)).toBeLessThan(1.5)
    }
  })

  it('is deterministic for the same seed', () => {
    expect(rollPlanetType(createRng('x'), Era.Second)).toBe(rollPlanetType(createRng('x'), Era.Second))
  })
})

describe('archetypeByType', () => {
  it('gives every type a palette and a terrain recipe', () => {
    for (const type of Object.values(PlanetType)) {
      const archetype = archetypeByType[type]
      const palette = archetype.buildPalette(createRng(`${type}:palette`))
      for (const color of Object.values(palette)) {
        expect(color).toBeGreaterThanOrEqual(0)
        expect(color).toBeLessThanOrEqual(0xffffff)
      }
      const layers = archetype.buildLayers(createRng(`${type}:terrain`))
      for (const layer of layers) {
        expect(layer.octaves).toBeGreaterThan(0)
        expect(layer.strength).toBeGreaterThan(0)
      }
    }
  })

  it('keeps water and clouds off rocks, stars and gas giants', () => {
    expect(archetypeByType.bare.hasOcean).toBe(false)
    expect(archetypeByType.asteroid.hasClouds).toBe(false)
    expect(archetypeByType.star.hasOcean).toBe(false)
    expect(archetypeByType.gasGiant.hasClouds).toBe(false)
    expect(archetypeByType.ocean.hasOcean).toBe(true)
  })
})
