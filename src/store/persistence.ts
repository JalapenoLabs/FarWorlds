// Copyright © 2026 Alex Navarro

import type { PlayerDataState } from './playerDataSlice'
import type { SettingsState } from './settingsSlice'

// Misc
import { PERSISTED_STATE_KEY } from '@/constants'
import { initialPlayerData } from './playerDataSlice'
import { initialSettings } from './settingsSlice'

export type PersistedState = {
  settings: SettingsState
  playerData: PlayerDataState
}

/**
 * Reads the persisted slices, filling any missing keys from the defaults so a settings field added in a later
 * release never leaves the store undefined.
 */
export function loadPersistedState(): PersistedState {
  try {
    const raw = localStorage.getItem(PERSISTED_STATE_KEY)
    if (!raw) {
      return { settings: initialSettings, playerData: initialPlayerData }
    }
    const parsed: Partial<PersistedState> = JSON.parse(raw)
    return {
      settings: { ...initialSettings, ...parsed.settings },
      playerData: { ...initialPlayerData, ...parsed.playerData },
    }
  }
  catch (error) {
    console.warn('Persisted state was unreadable, starting fresh', error)
    return { settings: initialSettings, playerData: initialPlayerData }
  }
}

export function savePersistedState(state: PersistedState): void {
  try {
    localStorage.setItem(PERSISTED_STATE_KEY, JSON.stringify(state))
  }
  catch (error) {
    // Thumbnails are the only thing large enough to overflow the quota; the world keeps working without them.
    console.warn('Could not persist state', error)
  }
}
