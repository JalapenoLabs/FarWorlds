// Copyright © 2026 JalapenoLabs

/**
 * Deterministic random numbers.
 *
 * Every visual property of a world derives from its coordinate seed, so the same coordinate must always yield
 * the same world. Rather than one shared stream (where the order of calls would silently change results), each
 * subsystem derives its own stream with `deriveSeed(seed, purpose)`.
 */

export type Rng = {
  /** Uniform float in [0, 1). */
  next(): number
  /** Uniform float in [min, max). */
  range(min: number, max: number): number
  /** Uniform integer in [min, max]. */
  int(min: number, max: number): number
  /** True with the given probability. */
  chance(probability: number): boolean
  /** One element of a non-empty list. */
  pick<Item>(items: readonly Item[]): Item
}

/**
 * xmur3 string hash. Small, well distributed, and good enough to turn any seed text into a 32-bit state.
 */
export function hashString(input: string): number {
  let hash = 1779033703 ^ input.length
  for (let index = 0; index < input.length; index++) {
    hash = Math.imul(hash ^ input.charCodeAt(index), 3432918353)
    hash = (hash << 13) | (hash >>> 19)
  }
  hash = Math.imul(hash ^ (hash >>> 16), 2246822507)
  hash = Math.imul(hash ^ (hash >>> 13), 3266489909)
  return (hash ^ (hash >>> 16)) >>> 0
}

/** A seed for one purpose, so subsystems never share a stream. */
export function deriveSeed(seed: string, purpose: string): string {
  return `${seed}:${purpose}`
}

/** mulberry32: a fast 32-bit generator with a full period, seeded from the hashed seed string. */
export function createRng(seed: string): Rng {
  let state = hashString(seed)

  function next(): number {
    state = (state + 0x6d2b79f5) | 0
    let mixed = Math.imul(state ^ (state >>> 15), 1 | state)
    mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296
  }

  return {
    next,
    range(min, max) {
      return min + next() * (max - min)
    },
    int(min, max) {
      return min + Math.floor(next() * (max - min + 1))
    },
    chance(probability) {
      return next() < probability
    },
    pick(items) {
      const item = items[Math.floor(next() * items.length)]
      if (item === undefined) {
        throw new Error('Rng.pick called with an empty list')
      }
      return item
    },
  }
}
