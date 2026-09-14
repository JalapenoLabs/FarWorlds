// Copyright © 2026 JalapenoLabs

// Core
import { describe, expect, it } from 'vitest'

// Utility
import {
  CURRENT_ERA,
  Era,
  clampCoordinate,
  coordinatesToSeed,
  formatCoordinates,
  parseCoordinateText,
  parseCoordinates,
  randomCoordinates,
} from './coordinates'

describe('coordinatesToSeed', () => {
  it('writes each axis with two decimals and omits a zero era', () => {
    expect(coordinatesToSeed({ x: 1, y: -2.5, z: 3.333, w: Era.First })).toBe('1.00-2.503.33')
  })

  it('appends the era when it is not zero', () => {
    expect(coordinatesToSeed({ x: 12.34, y: -567.89, z: 1000.5, w: Era.Second })).toBe('12.34-567.891000.501')
  })
})

describe('clampCoordinate', () => {
  it('limits values to the coordinate space and rounds to two decimals', () => {
    expect(clampCoordinate(12345.678)).toBe(9999.99)
    expect(clampCoordinate(-12345.678)).toBe(-9999.99)
    expect(clampCoordinate(1.23456)).toBe(1.23)
  })
})

describe('randomCoordinates', () => {
  it('stays inside the coordinate space in the current era', () => {
    for (let index = 0; index < 200; index++) {
      const coordinates = randomCoordinates()
      expect(Math.abs(coordinates.x)).toBeLessThanOrEqual(9999.99)
      expect(Math.abs(coordinates.y)).toBeLessThanOrEqual(9999.99)
      expect(Math.abs(coordinates.z)).toBeLessThanOrEqual(9999.99)
      expect(coordinates.w).toBe(CURRENT_ERA)
    }
  })
})

describe('parseCoordinates', () => {
  const fallback = { x: 1, y: 2, z: 3, w: Era.Second }

  it('reads a full query string', () => {
    expect(parseCoordinates('?x=10.5&y=-20&z=30.123&w=0', fallback)).toEqual({ x: 10.5, y: -20, z: 30.12, w: 0 })
  })

  it('falls back when an axis is missing or not a number', () => {
    expect(parseCoordinates('?x=10&y=abc&z=3', fallback)).toEqual(fallback)
    expect(parseCoordinates('', fallback)).toEqual(fallback)
  })

  it('keeps the fallback era when w is absent and clamps the axes', () => {
    expect(parseCoordinates('?x=99999&y=0&z=0', fallback)).toEqual({ x: 9999.99, y: 0, z: 0, w: Era.Second })
  })
})

describe('parseCoordinateText', () => {
  it('round-trips the shared coordinate line', () => {
    const coordinates = { x: -12.5, y: 400, z: 0.25, w: Era.Second }
    expect(parseCoordinateText(formatCoordinates(coordinates))).toEqual(coordinates)
  })

  it('accepts three bare numbers and defaults the era', () => {
    expect(parseCoordinateText('1 2 3')).toEqual({ x: 1, y: 2, z: 3, w: CURRENT_ERA })
  })

  it('returns null for fewer than three numbers', () => {
    expect(parseCoordinateText('just words')).toBeNull()
    expect(parseCoordinateText('1, 2')).toBeNull()
  })
})
