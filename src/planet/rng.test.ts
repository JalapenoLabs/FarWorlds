// Copyright © 2026 JalapenoLabs

// Core
import { describe, expect, it } from 'vitest'

// Utility
import { createRng, deriveSeed, hashString } from './rng'

describe('hashString', () => {
  it('is deterministic and returns an unsigned 32-bit integer', () => {
    expect(hashString('farworlds')).toBe(hashString('farworlds'))
    expect(hashString('farworlds')).toBeGreaterThanOrEqual(0)
    expect(hashString('farworlds')).toBeLessThan(2 ** 32)
  })

  it('separates seeds that differ by one character', () => {
    expect(hashString('1.002.003.001')).not.toBe(hashString('1.002.003.002'))
  })
})

describe('createRng', () => {
  it('replays the same sequence for the same seed', () => {
    const first = createRng('seed')
    const second = createRng('seed')
    const firstValues = [first.next(), first.next(), first.next()]
    const secondValues = [second.next(), second.next(), second.next()]
    expect(firstValues).toEqual(secondValues)
  })

  it('keeps every value inside [0, 1) and roughly uniform', () => {
    const rng = createRng('uniform')
    let sum = 0
    for (let index = 0; index < 10000; index++) {
      const value = rng.next()
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(1)
      sum += value
    }
    expect(sum / 10000).toBeCloseTo(0.5, 1)
  })

  it('respects range, int and pick bounds', () => {
    const rng = createRng('bounds')
    for (let index = 0; index < 500; index++) {
      const ranged = rng.range(-3, 3)
      expect(ranged).toBeGreaterThanOrEqual(-3)
      expect(ranged).toBeLessThan(3)
      const integer = rng.int(2, 5)
      expect(Number.isInteger(integer)).toBe(true)
      expect(integer).toBeGreaterThanOrEqual(2)
      expect(integer).toBeLessThanOrEqual(5)
      expect(['a', 'b']).toContain(rng.pick(['a', 'b']))
    }
  })

  it('throws instead of returning undefined when picking from nothing', () => {
    expect(() => createRng('empty').pick([])).toThrow()
  })
})

describe('deriveSeed', () => {
  it('produces distinct streams per purpose from one seed', () => {
    const terrain = createRng(deriveSeed('seed', 'terrain'))
    const palette = createRng(deriveSeed('seed', 'palette'))
    expect(terrain.next()).not.toBe(palette.next())
  })
})
