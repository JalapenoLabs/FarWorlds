// Copyright © 2026 Alex Navarro

// Core
import { AdditiveBlending, BufferAttribute, BufferGeometry, CanvasTexture, Group, Points, PointsMaterial } from 'three'

/** A soft round dot drawn once; every star is a sprite of it. */
function createStarTexture(): CanvasTexture {
  const size = 32
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('2D canvas is unavailable for the star texture')
  }
  const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(0.35, 'rgba(255,255,255,0.8)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')
  context.fillStyle = gradient
  context.fillRect(0, 0, size, size)
  return new CanvasTexture(canvas)
}

type StarLayer = {
  count: number
  minDistance: number
  maxDistance: number
  size: number
  color: number
}

/** Three shells of stars at increasing distance, the far ones smaller and dimmer for parallax when orbiting. */
const STAR_LAYERS: StarLayer[] = [
  { count: 1200, minDistance: 120, maxDistance: 200, size: 1.6, color: 0xffffff },
  { count: 900, minDistance: 200, maxDistance: 300, size: 1.2, color: 0xbfd8ff },
  { count: 700, minDistance: 300, maxDistance: 420, size: 1, color: 0xffd6e8 },
]

export function createStarfield(): Group {
  const group = new Group()
  const texture = createStarTexture()

  for (const layer of STAR_LAYERS) {
    const positions = new Float32Array(layer.count * 3)
    for (let index = 0; index < layer.count; index++) {
      // Uniform direction on the sphere, then a random radius inside the shell.
      const theta = Math.random() * Math.PI * 2
      const cosPhi = Math.random() * 2 - 1
      const sinPhi = Math.sqrt(1 - cosPhi * cosPhi)
      const distance = layer.minDistance + Math.random() * (layer.maxDistance - layer.minDistance)
      positions[index * 3] = Math.cos(theta) * sinPhi * distance
      positions[index * 3 + 1] = cosPhi * distance
      positions[index * 3 + 2] = Math.sin(theta) * sinPhi * distance
    }

    const geometry = new BufferGeometry()
    geometry.setAttribute('position', new BufferAttribute(positions, 3))
    const material = new PointsMaterial({
      size: layer.size,
      map: texture,
      color: layer.color,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: AdditiveBlending,
      sizeAttenuation: true,
    })
    group.add(new Points(geometry, material))
  }

  return group
}
