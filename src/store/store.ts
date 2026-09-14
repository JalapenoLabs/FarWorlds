// Copyright © 2026 JalapenoLabs

// Core
import { configureStore } from '@reduxjs/toolkit'

// Redux
import { playerDataSlice } from './playerDataSlice'
import { loadPersistedState, savePersistedState } from './persistence'
import { settingsSlice } from './settingsSlice'
import { worldSlice } from './worldSlice'

// Misc
import { PERSIST_DEBOUNCE_MS } from '@/constants'

export const store = configureStore({
  reducer: {
    settings: settingsSlice.reducer,
    playerData: playerDataSlice.reducer,
    world: worldSlice.reducer,
  },
  preloadedState: loadPersistedState(),
})

let persistTimer: ReturnType<typeof setTimeout> | undefined
store.subscribe(() => {
  clearTimeout(persistTimer)
  persistTimer = setTimeout(() => {
    const { settings, playerData } = store.getState()
    savePersistedState({ settings, playerData })
  }, PERSIST_DEBOUNCE_MS)
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
