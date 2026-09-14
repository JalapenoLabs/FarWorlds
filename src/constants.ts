// Copyright © 2026 Alex Navarro

/** Coordinates are clamped to this range on every axis, matching the shareable coordinate space. */
export const COORDINATE_LIMIT = 9999.99

/** The booklet keeps this many recent visits and this many saved worlds. */
export const TRAVEL_HISTORY_LIMIT = 50
export const SAVED_WORLDS_LIMIT = 50

/** localStorage key holding the persisted slices. */
export const PERSISTED_STATE_KEY = 'farworlds.state'

/** How long to wait after the last store change before writing to storage. */
export const PERSIST_DEBOUNCE_MS = 250

/** Planet body radius in scene units; everything else (camera, rings, moons) is relative to it. */
export const PLANET_RADIUS = 5

/** How many most-visited sites the shortcuts row shows. */
export const SHORTCUT_LIMIT = 8

/** Favicon size requested from Chrome's favicon cache, in CSS pixels. */
export const SHORTCUT_ICON_SIZE = 32

/** Permissions the shortcuts widget needs; requested when the widget is turned on. */
export const SHORTCUT_PERMISSIONS = ['topSites', 'favicon'] as const

/** Camera distance for a bare body, in planet radii. Rings and moons push it further. */
export const FRAMING_DISTANCE_RADII = 7

/** Thumbnail edge length in pixels for booklet previews. */
export const THUMBNAIL_SIZE = 96

/** Vertices per cube-face edge for each graphics quality setting. */
export const FACE_RESOLUTION_BY_QUALITY = {
  low: 64,
  medium: 128,
  high: 256,
} as const
export type GraphicsQuality = keyof typeof FACE_RESOLUTION_BY_QUALITY

/** Moons are small; they never need the primary body's resolution. */
export const MOON_FACE_RESOLUTION = 24
