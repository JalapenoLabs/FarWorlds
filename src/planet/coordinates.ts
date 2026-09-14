// Copyright © 2026 JalapenoLabs

import { COORDINATE_LIMIT } from '@/constants'

/**
 * A world lives at a 3D coordinate plus an era. The era selects which generator table is used, so worlds
 * created before a generator change keep looking the same when revisited.
 */
export const Era = {
  First: 0,
  Second: 1,
} as const
export type Era = (typeof Era)[keyof typeof Era]

export const CURRENT_ERA: Era = Era.Second

export type Coordinates = {
  x: number
  y: number
  z: number
  w: Era
}

/** Two decimals is the resolution of the coordinate space; anything finer is rounded away. */
function roundCoordinate(value: number): number {
  return Math.round(value * 100) / 100
}

export function clampCoordinate(value: number): number {
  return roundCoordinate(Math.max(-COORDINATE_LIMIT, Math.min(COORDINATE_LIMIT, value)))
}

/** Random coordinates in the current era, using ambient randomness (not seeded: this is the dice roll). */
export function randomCoordinates(): Coordinates {
  return {
    x: roundCoordinate(Math.random() * 2 * COORDINATE_LIMIT - COORDINATE_LIMIT),
    y: roundCoordinate(Math.random() * 2 * COORDINATE_LIMIT - COORDINATE_LIMIT),
    z: roundCoordinate(Math.random() * 2 * COORDINATE_LIMIT - COORDINATE_LIMIT),
    w: CURRENT_ERA,
  }
}

export function toEra(value: number): Era {
  return value >= 1
    ? Era.Second
    : Era.First
}

/**
 * The seed string for a coordinate: each axis with two decimals, then the era, with era zero written as an
 * empty suffix. This is the shareable identity of a world.
 */
export function coordinatesToSeed(coordinates: Coordinates): string {
  const eraSuffix = coordinates.w === Era.First
    ? ''
    : String(coordinates.w)
  return `${coordinates.x.toFixed(2)}${coordinates.y.toFixed(2)}${coordinates.z.toFixed(2)}${eraSuffix}`
}

/**
 * Reads coordinates from a query string (`?x=&y=&z=&w=`). Any axis that is missing or unparseable falls back
 * to the provided default, so a partial link still lands somewhere sensible.
 */
export function parseCoordinates(search: string, fallback: Coordinates): Coordinates {
  const params = new URLSearchParams(search)
  const x = Number.parseFloat(params.get('x') ?? '')
  const y = Number.parseFloat(params.get('y') ?? '')
  const z = Number.parseFloat(params.get('z') ?? '')
  const w = Number.parseFloat(params.get('w') ?? '')

  if (Number.isNaN(x) || Number.isNaN(y) || Number.isNaN(z)) {
    return fallback
  }

  return {
    x: clampCoordinate(x),
    y: clampCoordinate(y),
    z: clampCoordinate(z),
    w: Number.isNaN(w)
      ? fallback.w
      : toEra(w),
  }
}

/** Human-readable coordinate line, used by the share action and the travel form. */
export function formatCoordinates(coordinates: Coordinates): string {
  return `${coordinates.x.toFixed(2)}, ${coordinates.y.toFixed(2)}, ${coordinates.z.toFixed(2)}, ${coordinates.w}`
}

/**
 * Parses text pasted into the travel form: either the `formatCoordinates` line or a bare "x, y, z". Returns null
 * when fewer than three numbers are present.
 */
export function parseCoordinateText(text: string): Coordinates | null {
  const numbers = text
    .split(/[\s,;]+/)
    .map((part) => Number.parseFloat(part))
    .filter((value) => !Number.isNaN(value))

  const [x, y, z, w] = numbers
  if (x === undefined || y === undefined || z === undefined) {
    console.debug('parseCoordinateText found fewer than three numbers', text)
    return null
  }

  return {
    x: clampCoordinate(x),
    y: clampCoordinate(y),
    z: clampCoordinate(z),
    w: w === undefined
      ? CURRENT_ERA
      : toEra(w),
  }
}
