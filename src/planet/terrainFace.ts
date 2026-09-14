// Copyright © 2026 JalapenoLabs

import type { PlanetBlueprint } from './types'

// Utility
import { surfaceColorByType } from './biomes'
import { createElevationSampler, createNoiseFilter } from './noise'
import { deriveSeed } from './rng'

/**
 * One face of the cube sphere. The request is plain data so it can be posted to a worker; the result is a set of
 * typed arrays that transfer back without copying.
 */
export type TerrainFaceRequest = {
  seed: string
  type: PlanetBlueprint['type']
  palette: PlanetBlueprint['palette']
  terrain: PlanetBlueprint['terrain']
  /** Vertices per edge. */
  resolution: number
  radius: number
  /** Outward normal of this cube face, one of the six axis directions. */
  direction: [number, number, number]
}

export type TerrainFaceResult = {
  positions: Float32Array
  colors: Float32Array
  indices: Uint32Array
  minElevation: number
  maxElevation: number
}

/** The six cube faces, in a fixed order so face indices are stable across runs. */
export const FACE_DIRECTIONS: ReadonlyArray<[number, number, number]> = [
  [0, 1, 0],
  [0, -1, 0],
  [1, 0, 0],
  [-1, 0, 0],
  [0, 0, 1],
  [0, 0, -1],
]

/**
 * Builds a face grid in the style of Sebastian Lague's TerrainFace (MIT): each grid point is projected from the
 * unit cube onto the unit sphere, displaced by the layered elevation noise, and coloured by biome.
 */
export function buildTerrainFace(request: TerrainFaceRequest): TerrainFaceResult {
  const { resolution, radius, direction } = request
  const [upX, upY, upZ] = direction
  // Two tangent axes: a cyclic rotation of the normal, and its cross product with the normal.
  const axisAX = upY
  const axisAY = upZ
  const axisAZ = upX
  const axisBX = upY * axisAZ - upZ * axisAY
  const axisBY = upZ * axisAX - upX * axisAZ
  const axisBZ = upX * axisAY - upY * axisAX

  const vertexCount = resolution * resolution
  const positions = new Float32Array(vertexCount * 3)
  const colors = new Float32Array(vertexCount * 3)
  const indices = new Uint32Array((resolution - 1) * (resolution - 1) * 6)

  const sampleElevation = createElevationSampler(deriveSeed(request.seed, 'elevation'), request.terrain.layers)
  const sampleMoisture = createNoiseFilter(deriveSeed(request.seed, 'moisture'), request.terrain.moisture)
  const colorSurface = surfaceColorByType[request.type]
  const color: [number, number, number] = [0, 0, 0]

  let minElevation = Number.POSITIVE_INFINITY
  let maxElevation = Number.NEGATIVE_INFINITY
  let triangleIndex = 0

  for (let row = 0; row < resolution; row++) {
    const percentY = row / (resolution - 1)
    for (let column = 0; column < resolution; column++) {
      const percentX = column / (resolution - 1)
      const vertexIndex = column + row * resolution

      const cubeX = upX + (percentX - 0.5) * 2 * axisAX + (percentY - 0.5) * 2 * axisBX
      const cubeY = upY + (percentX - 0.5) * 2 * axisAY + (percentY - 0.5) * 2 * axisBY
      const cubeZ = upZ + (percentX - 0.5) * 2 * axisAZ + (percentY - 0.5) * 2 * axisBZ
      const length = Math.sqrt(cubeX * cubeX + cubeY * cubeY + cubeZ * cubeZ)
      const unitX = cubeX / length
      const unitY = cubeY / length
      const unitZ = cubeZ / length

      const elevation = sampleElevation(unitX, unitY, unitZ)
      const moisture = Math.min(1, Math.max(0, sampleMoisture(unitX, unitY, unitZ)))
      minElevation = Math.min(minElevation, elevation)
      maxElevation = Math.max(maxElevation, elevation)

      const scale = radius * (1 + elevation)
      positions[vertexIndex * 3] = unitX * scale
      positions[vertexIndex * 3 + 1] = unitY * scale
      positions[vertexIndex * 3 + 2] = unitZ * scale

      colorSurface({ elevation, moisture, latitude: Math.abs(unitY) }, request.palette, request.terrain, color)
      colors[vertexIndex * 3] = color[0]
      colors[vertexIndex * 3 + 1] = color[1]
      colors[vertexIndex * 3 + 2] = color[2]

      if (column !== resolution - 1 && row !== resolution - 1) {
        indices[triangleIndex] = vertexIndex
        indices[triangleIndex + 1] = vertexIndex + resolution + 1
        indices[triangleIndex + 2] = vertexIndex + resolution
        indices[triangleIndex + 3] = vertexIndex
        indices[triangleIndex + 4] = vertexIndex + 1
        indices[triangleIndex + 5] = vertexIndex + resolution + 1
        triangleIndex += 6
      }
    }
  }

  return { positions, colors, indices, minElevation, maxElevation }
}
