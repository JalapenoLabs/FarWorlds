// Copyright © 2026 Alex Navarro

// Core
import { describe, expect, it } from 'vitest'

// Utility
import { generateProperName, generateWorldName } from './naming'
import { createRng } from './rng'

describe('generateProperName', () => {
  it('capitalises and stays pronounceable in length', () => {
    for (let index = 0; index < 200; index++) {
      const name = generateProperName(createRng(`name${index}`))
      expect(name).toMatch(/^[A-Z][a-z]+$/)
      expect(name.length).toBeGreaterThanOrEqual(4)
      expect(name.length).toBeLessThanOrEqual(12)
    }
  })
})

describe('generateWorldName', () => {
  it('is deterministic per seed', () => {
    expect(generateWorldName(createRng('same'))).toBe(generateWorldName(createRng('same')))
  })

  it('uses every template over many seeds', () => {
    const patterns = {
      catalogue: /^[A-Z]{2}-\d{5}$/,
      adornmentAfter: /^[A-Z][a-z]+ [A-Z][a-z]+$/,
      numeral: /^[A-Z][a-z]+ (I|II|III|IV|V|VI|VII|VIII|IX|X)$/,
      colony: /^New [A-Z][a-z]+$/,
      hyphenated: /^[A-Z][a-z]+-\d{4}$/,
    }
    const seen = new Set<string>()
    for (let index = 0; index < 500; index++) {
      const name = generateWorldName(createRng(`world${index}`))
      for (const [key, pattern] of Object.entries(patterns)) {
        if (pattern.test(name)) {
          seen.add(key)
        }
      }
    }
    expect([...seen].sort()).toEqual(Object.keys(patterns).sort())
  })
})
