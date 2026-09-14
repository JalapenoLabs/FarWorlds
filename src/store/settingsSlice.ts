// Copyright © 2026 JalapenoLabs

import type { GraphicsQuality } from '@/constants'
import type { PayloadAction } from '@reduxjs/toolkit'

// Core
import { createSlice } from '@reduxjs/toolkit'

export type TimeFormat = '12h' | '24h'

export type SettingsState = {
  graphicsQuality: GraphicsQuality
  useNativeResolution: boolean
  timeFormat: TimeFormat
  autoRotate: boolean
  showClouds: boolean
  showFps: boolean
  showSearch: boolean
  showShortcuts: boolean
}

export const initialSettings: SettingsState = {
  graphicsQuality: 'medium',
  useNativeResolution: false,
  timeFormat: '12h',
  autoRotate: true,
  showClouds: true,
  showFps: false,
  showSearch: true,
  showShortcuts: false,
}

export const settingsSlice = createSlice({
  name: 'settings',
  initialState: initialSettings,
  reducers: {
    updateSetting<Key extends keyof SettingsState>(
      state: SettingsState,
      action: PayloadAction<{ key: Key, value: SettingsState[Key] }>,
    ) {
      state[action.payload.key] = action.payload.value
    },
  },
})

export const { updateSetting } = settingsSlice.actions
