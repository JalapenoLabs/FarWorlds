// Copyright © 2026 JalapenoLabs

// Core
import { AdditiveBlending, CanvasTexture, Sprite, SpriteMaterial } from 'three'

// Utility
import { hexToCss } from '@/planet/color'

/**
 * A radial glow drawn on a canvas, used for the corona of stars. Generated at runtime so no texture ships with
 * the extension.
 */
export function createGlowSprite(color: number, scale: number): Sprite {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('2D canvas is unavailable for the glow sprite')
  }

  const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  gradient.addColorStop(0, 'rgba(255,255,255,0.95)')
  gradient.addColorStop(0.18, `${hexToCss(color)}cc`)
  gradient.addColorStop(0.45, `${hexToCss(color)}55`)
  gradient.addColorStop(1, `${hexToCss(color)}00`)
  context.fillStyle = gradient
  context.fillRect(0, 0, size, size)

  const material = new SpriteMaterial({
    map: new CanvasTexture(canvas),
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  })
  const sprite = new Sprite(material)
  sprite.scale.set(scale, scale, 1)
  return sprite
}
