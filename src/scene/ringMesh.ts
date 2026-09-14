// Copyright © 2026 Alex Navarro

import type { RingSettings } from '@/planet/types'

// Core
import { CanvasTexture, DoubleSide, Mesh, MeshStandardMaterial, RingGeometry, Vector3 } from 'three'

// Utility
import { createRng } from '@/planet/rng'
import { hexToCss } from '@/planet/color'

/**
 * Bands of varying brightness and gaps, drawn as a one-dimensional strip and stretched radially. The band
 * layout derives from the ring's own seed so it is stable per world.
 */
function createRingTexture(settings: RingSettings, seed: string): CanvasTexture {
  const width = 512
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = 1
  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('2D canvas is unavailable for the ring texture')
  }

  const rng = createRng(seed)
  const base = hexToCss(settings.color)
  let cursor = 0
  while (cursor < width) {
    const bandWidth = Math.max(4, Math.floor(rng.range(width / (settings.bandCount * 3), width / settings.bandCount)))
    const alpha = rng.chance(0.25)
      ? rng.range(0, 0.15)
      : rng.range(0.35, 1)
    context.fillStyle = base
    context.globalAlpha = alpha
    context.fillRect(cursor, 0, bandWidth, 1)
    cursor += bandWidth
  }

  const texture = new CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

export function createRingMesh(settings: RingSettings, seed: string): Mesh {
  const geometry = new RingGeometry(settings.innerRadius, settings.outerRadius, 128, 1)

  // RingGeometry maps UVs planarly; the strip texture needs u to run from inner edge to outer edge.
  const positionAttribute = geometry.getAttribute('position')
  const uvAttribute = geometry.getAttribute('uv')
  const vertex = new Vector3()
  for (let index = 0; index < positionAttribute.count; index++) {
    vertex.fromBufferAttribute(positionAttribute, index)
    const radialRatio = (vertex.length() - settings.innerRadius) / (settings.outerRadius - settings.innerRadius)
    uvAttribute.setXY(index, radialRatio, 0.5)
  }
  uvAttribute.needsUpdate = true

  const material = new MeshStandardMaterial({
    map: createRingTexture(settings, seed),
    transparent: true,
    opacity: settings.opacity,
    side: DoubleSide,
    roughness: 0.9,
    metalness: 0,
    depthWrite: false,
  })

  const mesh = new Mesh(geometry, material)
  mesh.rotation.set(-Math.PI / 2 + settings.tiltX, 0, settings.tiltZ)
  mesh.receiveShadow = true
  return mesh
}
