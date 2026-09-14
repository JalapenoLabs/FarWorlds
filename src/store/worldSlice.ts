// Copyright © 2026 JalapenoLabs

import type { PlanetBlueprint } from '@/planet/types'
import type { PayloadAction } from '@reduxjs/toolkit'

// Core
import { createSlice } from '@reduxjs/toolkit'

export type WorldStatus = 'idle' | 'loading' | 'ready' | 'error'

export type Panel = 'settings' | 'travel' | 'booklet' | 'info'

export type WorldState = {
  blueprint: PlanetBlueprint | null
  status: WorldStatus
  activePanel: Panel | null
}

export const initialWorldState: WorldState = {
  blueprint: null,
  status: 'idle',
  activePanel: null,
}

export const worldSlice = createSlice({
  name: 'world',
  initialState: initialWorldState,
  reducers: {
    beginTravel(state, action: PayloadAction<PlanetBlueprint>) {
      state.blueprint = action.payload
      state.status = 'loading'
    },
    worldReady(state, action: PayloadAction<string>) {
      // A slow world can finish after the user has already moved on; only the current seed counts.
      if (state.blueprint?.seed === action.payload) {
        state.status = 'ready'
      }
    },
    worldFailed(state, action: PayloadAction<string>) {
      if (state.blueprint?.seed === action.payload) {
        state.status = 'error'
      }
    },
    togglePanel(state, action: PayloadAction<Panel>) {
      state.activePanel = state.activePanel === action.payload
        ? null
        : action.payload
    },
    closePanel(state) {
      state.activePanel = null
    },
  },
})

export const { beginTravel, worldReady, worldFailed, togglePanel, closePanel } = worldSlice.actions
