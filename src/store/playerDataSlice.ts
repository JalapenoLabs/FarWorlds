// Copyright © 2026 JalapenoLabs

import type { Coordinates } from '@/planet/coordinates'
import type { PlanetType } from '@/planet/types'
import type { PayloadAction } from '@reduxjs/toolkit'

// Core
import { createSlice } from '@reduxjs/toolkit'

// Misc
import { SAVED_WORLDS_LIMIT, TRAVEL_HISTORY_LIMIT } from '@/constants'

/** A world as remembered by the booklet: enough to travel back and to draw a row. */
export type WorldRecord = {
  seed: string
  coordinates: Coordinates
  name: string
  type: PlanetType
  /** Unix milliseconds of the most recent visit or save. */
  timestamp: number
  /** Data URL of a small render, captured when the world finished loading. */
  thumbnail?: string
}

export type PlayerDataState = {
  /** Most recent first. */
  travelHistory: WorldRecord[]
  savedWorlds: Record<string, WorldRecord>
}

export const initialPlayerData: PlayerDataState = {
  travelHistory: [],
  savedWorlds: {},
}

export const playerDataSlice = createSlice({
  name: 'playerData',
  initialState: initialPlayerData,
  reducers: {
    /** Moves a world to the top of the history, dropping the oldest entries past the limit. */
    recordVisit(state, action: PayloadAction<WorldRecord>) {
      const remaining = state.travelHistory.filter((entry) => entry.seed !== action.payload.seed)
      state.travelHistory = [action.payload, ...remaining].slice(0, TRAVEL_HISTORY_LIMIT)
    },
    saveWorld: {
      reducer(state, action: PayloadAction<WorldRecord>) {
        if (state.savedWorlds[action.payload.seed]) {
          return
        }
        if (Object.keys(state.savedWorlds).length >= SAVED_WORLDS_LIMIT) {
          console.debug('saveWorld refused: the saved worlds list is full', action.payload.seed)
          return
        }
        state.savedWorlds[action.payload.seed] = action.payload
      },
      /** The save time is stamped here, the one place in the flow allowed to read the clock. */
      prepare(record: WorldRecord) {
        return { payload: { ...record, timestamp: Date.now() } }
      },
    },
    forgetWorld(state, action: PayloadAction<string>) {
      delete state.savedWorlds[action.payload]
    },
    /** Thumbnails arrive after the visit is recorded, so they are attached to every copy of the record. */
    attachThumbnail(state, action: PayloadAction<{ seed: string, thumbnail: string }>) {
      const historyEntry = state.travelHistory.find((entry) => entry.seed === action.payload.seed)
      if (historyEntry) {
        historyEntry.thumbnail = action.payload.thumbnail
      }
      const savedEntry = state.savedWorlds[action.payload.seed]
      if (savedEntry) {
        savedEntry.thumbnail = action.payload.thumbnail
      }
    },
  },
})

export const { recordVisit, saveWorld, forgetWorld, attachThumbnail } = playerDataSlice.actions
