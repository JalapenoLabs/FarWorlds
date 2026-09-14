// Copyright © 2026 Alex Navarro

// Core
import { describe, expect, it } from 'vitest'

// Utility
import { createPlanetBlueprint } from './blueprint'
import { FACE_DIRECTIONS, buildTerrainFace } from './terrainFace'

const blueprint = createPlanetBlueprint({ x: 8274.46, y: 4018.39, z: 489.66, w: 1 })

function face(direction: [number, number, number], resolution = 8) {
  return buildTerrainFace({
    seed: blueprint.seed,
    type: blueprint.type,
    palette: blueprint.palette,
    terrain: blueprint.terrain,
    resolution,
    radius: 5,
    direction,
  })
}

describe('buildTerrainFace', () => {
  it('produces the expected vertex and index counts', () => {
    const result = face([0, 1, 0], 8)
    expect(result.positions.length).toBe(8 * 8 * 3)
    expect(result.colors.length).toBe(8 * 8 * 3)
    expect(result.indices.length).toBe(7 * 7 * 6)
  })

  it('keeps colours in 0..1 and positions finite', () => {
    const result = face([1, 0, 0], 16)
    for (const value of result.colors) {
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThanOrEqual(1)
    }
    for (const value of result.positions) {
      expect(Number.isFinite(value)).toBe(true)
    }
  })

  it('generates bit-identical vertices along shared cube edges so faces can be welded', () => {
    const resolution = 12
    const faces = FACE_DIRECTIONS.map((direction) => face(direction, resolution))
    const vertexKeys = new Map<string, number>()
    let sharedVertices = 0

    for (const result of faces) {
      for (let index = 0; index < result.positions.length; index += 3) {
        const key = `${result.positions[index]},${result.positions[index + 1]},${result.positions[index + 2]}`
        const seen = vertexKeys.get(key) ?? 0
        if (seen) {
          sharedVertices += 1
        }
        vertexKeys.set(key, seen + 1)
      }
    }

    // Every edge vertex appears on two faces and every corner on three: 12 edges of (resolution - 2) interior
    // points plus 8 corners counted twice, all matched exactly.
    const expectedShared = 12 * (resolution - 2) + 8 * 2
    expect(sharedVertices).toBe(expectedShared)
  })
})
