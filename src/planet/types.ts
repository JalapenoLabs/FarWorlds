// Copyright © 2026 JalapenoLabs

import type { Coordinates } from './coordinates'

export const PlanetType = {
  Ocean: 'ocean',
  OceanRidge: 'oceanRidge',
  OceanIsland: 'oceanIsland',
  Star: 'star',
  GasGiant: 'gasGiant',
  Bare: 'bare',
  Asteroid: 'asteroid',
} as const
export type PlanetType = (typeof PlanetType)[keyof typeof PlanetType]

export const NoiseFilterType = {
  Simple: 'simple',
  Ridged: 'ridged',
} as const
export type NoiseFilterType = (typeof NoiseFilterType)[keyof typeof NoiseFilterType]

/**
 * One layer of terrain noise, in the shape of Sebastian Lague's Procedural Planets settings.
 * `centre` offsets the sample position so two layers with the same seed still differ.
 */
export type NoiseLayerSettings = {
  type: NoiseFilterType
  enabled: boolean
  strength: number
  octaves: number
  baseRoughness: number
  roughness: number
  persistence: number
  minValue: number
  /** Ridged only: how much each octave's weight feeds the next. */
  weightMultiplier: number
  centre: [number, number, number]
  /** Multiply this layer by the first layer so mountains only rise on land. */
  useFirstLayerAsMask: boolean
}

/** Colours as packed 0xRRGGBB numbers so they cross the worker boundary as plain data. */
export type Palette = {
  ocean: number
  shallows: number
  beach: number
  lowlandA: number
  lowlandB: number
  highland: number
  polar: number
  /** Stars and gas giants: the body colour and its brighter band or glow. */
  accent: number
}

export type RingSettings = {
  innerRadius: number
  outerRadius: number
  tiltX: number
  tiltZ: number
  color: number
  /** Number of visible bands in the procedural ring texture. */
  bandCount: number
  opacity: number
}

export type MoonSettings = {
  seed: string
  radius: number
  orbitRadius: number
  orbitSpeed: number
  orbitTilt: number
  phase: number
  color: number
}

/**
 * Everything needed to render and describe a world, derived entirely from its coordinates.
 * Plain data: it is posted to workers and stored in the booklet.
 */
export type PlanetBlueprint = {
  coordinates: Coordinates
  seed: string
  type: PlanetType
  name: string
  /** Percentage 0..100. */
  habitability: number
  /** Degrees Celsius. */
  surfaceTemperature: number
  palette: Palette
  terrain: {
    layers: NoiseLayerSettings[]
    moisture: NoiseLayerSettings
    /** Fraction of the unit-sphere |y| above which polar colouring begins. */
    polarStart: number
    /** Unscaled elevation above sea level that reads as beach. */
    beachHeight: number
    /** Unscaled elevation above which terrain reads as highland. */
    highlandHeight: number
  }
  hasOcean: boolean
  hasClouds: boolean
  cloudColor: number
  ring: RingSettings | null
  moons: MoonSettings[]
  rotationSpeed: number
}
