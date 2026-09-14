// Copyright © 2026 Alex Navarro

import type { Palette, PlanetBlueprint, PlanetType } from './types'

// Utility
import { hexToRgb } from './color'

export type SurfaceSample = {
  /** Unscaled elevation, zero at sea level. */
  elevation: number
  /** Moisture noise remapped to 0..1. */
  moisture: number
  /** Absolute unit-sphere y, so 1 at the poles and 0 at the equator. */
  latitude: number
}

export type SurfaceColorStrategy = (
  sample: SurfaceSample,
  palette: Palette,
  terrain: PlanetBlueprint['terrain'],
  out: [number, number, number],
) => void

function smoothstep(edgeStart: number, edgeEnd: number, value: number): number {
  const ratio = Math.min(1, Math.max(0, (value - edgeStart) / (edgeEnd - edgeStart)))
  return ratio * ratio * (3 - 2 * ratio)
}

function mixInto(out: [number, number, number], from: number, to: number, ratio: number): void {
  const [fromRed, fromGreen, fromBlue] = hexToRgb(from)
  const [toRed, toGreen, toBlue] = hexToRgb(to)
  out[0] = fromRed + (toRed - fromRed) * ratio
  out[1] = fromGreen + (toGreen - fromGreen) * ratio
  out[2] = fromBlue + (toBlue - fromBlue) * ratio
}

function blendToward(out: [number, number, number], color: number, ratio: number): void {
  const [red, green, blue] = hexToRgb(color)
  out[0] += (red - out[0]) * ratio
  out[1] += (green - out[1]) * ratio
  out[2] += (blue - out[2]) * ratio
}

/** Sea floor, beach, two lowland biomes by moisture, highlands, then snow and polar ice. */
const oceanWorldColor: SurfaceColorStrategy = (sample, palette, terrain, out) => {
  if (sample.elevation < 0) {
    mixInto(out, palette.ocean, palette.shallows, smoothstep(-0.06, 0, sample.elevation))
  }
  else if (sample.elevation < terrain.beachHeight) {
    mixInto(out, palette.beach, palette.beach, 0)
  }
  else {
    mixInto(out, palette.lowlandA, palette.lowlandB, smoothstep(0.42, 0.58, sample.moisture))
    blendToward(
      out,
      palette.highland,
      smoothstep(terrain.highlandHeight, terrain.highlandHeight + 0.08, sample.elevation),
    )
    blendToward(
      out,
      palette.polar,
      smoothstep(terrain.highlandHeight + 0.1, terrain.highlandHeight + 0.18, sample.elevation),
    )
  }

  // Ice caps creep further along wetter meridians, which breaks up the otherwise perfect circle.
  const polarEdge = terrain.polarStart - sample.moisture * 0.06
  blendToward(out, palette.polar, smoothstep(polarEdge, polarEdge + 0.06, sample.latitude))
}

/** Dry rock shaded by height, with a second hue drifting across it by moisture. */
const rockWorldColor: SurfaceColorStrategy = (sample, palette, terrain, out) => {
  mixInto(out, palette.lowlandA, palette.lowlandB, smoothstep(0.35, 0.65, sample.moisture))
  const depth = smoothstep(0.05, -0.15, sample.elevation)
  blendToward(out, palette.ocean, depth * 0.8)
  blendToward(
    out,
    palette.highland,
    smoothstep(terrain.highlandHeight * 0.6, terrain.highlandHeight + 0.15, sample.elevation),
  )
}

/** A star surface is one hot colour with brighter cells where the moisture noise peaks. */
const starColor: SurfaceColorStrategy = (sample, palette, _terrain, out) => {
  mixInto(out, palette.lowlandA, palette.lowlandB, smoothstep(0.3, 0.75, sample.moisture))
  blendToward(out, palette.highland, smoothstep(0.7, 0.95, sample.moisture))
}

/** Latitude bands warped by the moisture noise, the classic gas giant look. */
const gasGiantColor: SurfaceColorStrategy = (sample, palette, _terrain, out) => {
  const turbulence = (sample.moisture - 0.5) * 1.6
  const warped = sample.latitude * 6.5 + turbulence
  const band = 0.5 + 0.5 * Math.sin(warped * Math.PI)
  const fineBand = 0.5 + 0.5 * Math.sin(warped * Math.PI * 3.1 + turbulence * 4)
  mixInto(out, palette.lowlandA, palette.lowlandB, smoothstep(0.2, 0.8, band))
  blendToward(out, palette.highland, smoothstep(0.55, 1, fineBand) * 0.45)
  blendToward(out, palette.ocean, smoothstep(0.7, 1, 1 - band) * 0.5)
  blendToward(out, palette.accent, smoothstep(0.92, 1, band) * smoothstep(0.6, 1, fineBand) * 0.6)
  blendToward(out, palette.polar, smoothstep(0.82, 1, sample.latitude) * 0.7)
}

export const surfaceColorByType = {
  ocean: oceanWorldColor,
  oceanRidge: oceanWorldColor,
  oceanIsland: oceanWorldColor,
  bare: rockWorldColor,
  asteroid: rockWorldColor,
  star: starColor,
  gasGiant: gasGiantColor,
} as const satisfies Record<PlanetType, SurfaceColorStrategy>
