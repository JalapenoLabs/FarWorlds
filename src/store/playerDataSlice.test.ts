// Copyright © 2026 Alex Navarro

import type { WorldRecord } from './playerDataSlice'

// Core
import { describe, expect, it } from 'vitest'

// Redux
import { attachThumbnail, forgetWorld, initialPlayerData, playerDataSlice, recordVisit, saveWorld } from './playerDataSlice'

// Misc
import { SAVED_WORLDS_LIMIT, TRAVEL_HISTORY_LIMIT } from '@/constants'

const { reducer } = playerDataSlice

function record(seed: string): WorldRecord {
  return {
    seed,
    coordinates: { x: 0, y: 0, z: 0, w: 1 },
    name: `World ${seed}`,
    type: 'ocean',
    timestamp: 1000,
  }
}

describe('recordVisit', () => {
  it('puts the newest visit first and drops duplicates of the same seed', () => {
    let state = reducer(initialPlayerData, recordVisit(record('a')))
    state = reducer(state, recordVisit(record('b')))
    state = reducer(state, recordVisit(record('a')))
    expect(state.travelHistory.map((entry) => entry.seed)).toEqual(['a', 'b'])
  })

  it('never grows past the history limit', () => {
    let state = initialPlayerData
    for (let index = 0; index < TRAVEL_HISTORY_LIMIT + 10; index++) {
      state = reducer(state, recordVisit(record(`seed${index}`)))
    }
    expect(state.travelHistory).toHaveLength(TRAVEL_HISTORY_LIMIT)
    expect(state.travelHistory[0]?.seed).toBe(`seed${TRAVEL_HISTORY_LIMIT + 9}`)
  })
})

describe('saveWorld', () => {
  it('stamps the save time and refuses duplicates and overflow', () => {
    let state = reducer(initialPlayerData, saveWorld(record('a')))
    expect(state.savedWorlds.a?.timestamp).not.toBe(1000)

    const stamped = state.savedWorlds.a
    state = reducer(state, saveWorld({ ...record('a'), name: 'renamed' }))
    expect(state.savedWorlds.a).toBe(stamped)

    for (let index = 0; index < SAVED_WORLDS_LIMIT + 5; index++) {
      state = reducer(state, saveWorld(record(`seed${index}`)))
    }
    expect(Object.keys(state.savedWorlds)).toHaveLength(SAVED_WORLDS_LIMIT)
  })
})

describe('forgetWorld and attachThumbnail', () => {
  it('removes a saved world and attaches thumbnails to both lists', () => {
    let state = reducer(initialPlayerData, recordVisit(record('a')))
    state = reducer(state, saveWorld(record('a')))
    state = reducer(state, attachThumbnail({ seed: 'a', thumbnail: 'data:image/jpeg;base64,x' }))
    expect(state.travelHistory[0]?.thumbnail).toBe('data:image/jpeg;base64,x')
    expect(state.savedWorlds.a?.thumbnail).toBe('data:image/jpeg;base64,x')

    state = reducer(state, forgetWorld('a'))
    expect(state.savedWorlds.a).toBeUndefined()
    expect(state.travelHistory).toHaveLength(1)
  })
})
