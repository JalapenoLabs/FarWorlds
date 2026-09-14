// Copyright © 2026 Alex Navarro

import type { MoonSettings, PlanetBlueprint } from '@/planet/types'
import type { Material, ShaderMaterial } from 'three'

// Core
import { Group, Mesh, MeshBasicMaterial, MeshStandardMaterial, PointLight, SphereGeometry } from 'three'

// Utility
import { buildPlanetGeometry } from '@/planet/buildPlanetGeometry'
import { archetypeByType, rockPalette } from '@/planet/archetypes'
import { createRng } from '@/planet/rng'
import { createCloudMaterial } from './cloudMaterial'
import { createGlowSprite } from './glowSprite'
import { createRingMesh } from './ringMesh'

// Misc
import { FRAMING_DISTANCE_RADII, MOON_FACE_RESOLUTION, PLANET_RADIUS } from '@/constants'
import { PlanetType } from '@/planet/types'

export type MoonOrbit = {
  object: Group
  settings: MoonSettings
}

/** A fully built world: the group to add to the scene and the pieces that animate each frame. */
export type World = {
  seed: string
  group: Group
  body: Group
  clouds: Mesh | null
  moons: MoonOrbit[]
  rotationSpeed: number
  /** How far the camera should sit to frame the whole system. */
  framingDistance: number
  /** Radius of the body plus its ring, used to crop thumbnails. */
  extent: number
  dispose(): void
}

const isEmissiveBodyByType = {
  ocean: false,
  oceanRidge: false,
  oceanIsland: false,
  bare: false,
  asteroid: false,
  star: true,
  gasGiant: false,
} as const satisfies Record<PlanetType, boolean>

/** Builds every mesh for a blueprint. Terrain generation runs in workers, so this is asynchronous. */
export async function createWorld(blueprint: PlanetBlueprint, resolution: number): Promise<World> {
  const group = new Group()
  const body = new Group()
  group.add(body)
  const disposables: Array<{ dispose(): void }> = []

  const surface = await buildPlanetGeometry(blueprint, resolution, PLANET_RADIUS)
  disposables.push(surface.geometry)

  const isEmissive = isEmissiveBodyByType[blueprint.type]
  const surfaceMaterial: Material = isEmissive
    ? new MeshBasicMaterial({ vertexColors: true })
    : new MeshStandardMaterial({ vertexColors: true, roughness: 0.88, metalness: 0 })
  disposables.push(surfaceMaterial)
  const surfaceMesh = new Mesh(surface.geometry, surfaceMaterial)
  surfaceMesh.castShadow = true
  surfaceMesh.receiveShadow = true
  body.add(surfaceMesh)

  if (blueprint.hasOcean) {
    const oceanGeometry = new SphereGeometry(PLANET_RADIUS, 96, 96)
    const oceanMaterial = new MeshStandardMaterial({
      color: blueprint.palette.ocean,
      roughness: 0.32,
      metalness: 0.05,
      transparent: true,
      opacity: 0.9,
    })
    disposables.push(oceanGeometry, oceanMaterial)
    body.add(new Mesh(oceanGeometry, oceanMaterial))
  }

  let clouds: Mesh | null = null
  if (blueprint.hasClouds) {
    const cloudGeometry = new SphereGeometry(PLANET_RADIUS * 1.08, 64, 64)
    const cloudRng = createRng(`${blueprint.seed}:clouds`)
    const cloudMaterial = createCloudMaterial(
      blueprint.cloudColor,
      [cloudRng.range(-50, 50), cloudRng.range(-50, 50), cloudRng.range(-50, 50)],
    )
    disposables.push(cloudGeometry, cloudMaterial)
    clouds = new Mesh(cloudGeometry, cloudMaterial)
    body.add(clouds)
  }

  if (blueprint.type === PlanetType.Star) {
    const glow = createGlowSprite(blueprint.palette.accent, PLANET_RADIUS * 6)
    disposables.push(glow.material)
    group.add(glow)
    group.add(new PointLight(blueprint.palette.accent, 40, 0, 1.2))
  }

  let framingDistance = PLANET_RADIUS * FRAMING_DISTANCE_RADII
  let extent = PLANET_RADIUS * 1.25
  if (blueprint.ring) {
    const ring = createRingMesh(blueprint.ring, `${blueprint.seed}:ring`)
    disposables.push(ring.geometry, ring.material as Material)
    group.add(ring)
    framingDistance = Math.max(framingDistance, blueprint.ring.outerRadius * 3.2)
    extent = blueprint.ring.outerRadius
  }

  const moons: MoonOrbit[] = []
  const moonMeshes = await Promise.all(blueprint.moons.map((settings) => createMoon(settings)))
  moonMeshes.forEach((moon, index) => {
    const settings = blueprint.moons[index]
    if (!settings) {
      return
    }
    disposables.push(moon.geometry, moon.material as Material)
    const orbit = new Group()
    orbit.add(moon)
    group.add(orbit)
    moons.push({ object: orbit, settings })
    framingDistance = Math.max(framingDistance, settings.orbitRadius * 2.2)
  })

  return {
    seed: blueprint.seed,
    group,
    body,
    clouds,
    moons,
    rotationSpeed: blueprint.rotationSpeed,
    framingDistance,
    extent,
    dispose() {
      disposables.forEach((item) => item.dispose())
    },
  }
}

/** Moons are tiny bare worlds generated from their own seed at a low resolution. */
async function createMoon(settings: MoonSettings): Promise<Mesh> {
  const rng = createRng(settings.seed)
  const terrain = {
    layers: archetypeByType.bare.buildLayers(rng),
    moisture: {
      type: 'simple' as const,
      enabled: true,
      strength: 1,
      octaves: 2,
      baseRoughness: 1,
      roughness: 2,
      persistence: 0.5,
      minValue: 0,
      weightMultiplier: 0.8,
      centre: [0, 0, 0] as [number, number, number],
      useFirstLayerAsMask: false,
    },
    polarStart: 1,
    beachHeight: 0,
    highlandHeight: 0.1,
  }
  const palette = rockPalette(createRng(`${settings.seed}:palette`))
  const geometry = await buildPlanetGeometry(
    { seed: settings.seed, type: PlanetType.Bare, palette, terrain },
    MOON_FACE_RESOLUTION,
    settings.radius,
  )
  const material = new MeshStandardMaterial({ vertexColors: true, roughness: 0.95, metalness: 0 })
  const mesh = new Mesh(geometry.geometry, material)
  mesh.castShadow = true
  mesh.receiveShadow = true
  return mesh
}

/** Advances clouds, rotation and moon orbits. `elapsed` is seconds since the world was shown. */
export function animateWorld(world: World, elapsed: number, delta: number, autoRotate: boolean): void {
  if (autoRotate) {
    world.body.rotation.y += world.rotationSpeed * delta
  }
  if (world.clouds) {
    const material = world.clouds.material as ShaderMaterial
    material.uniforms.time!.value = elapsed
    world.clouds.rotation.y += world.rotationSpeed * 0.35 * delta
  }
  for (const moon of world.moons) {
    const angle = moon.settings.phase + elapsed * moon.settings.orbitSpeed
    const radius = moon.settings.orbitRadius
    moon.object.position.set(
      Math.cos(angle) * radius,
      Math.sin(angle) * radius * Math.sin(moon.settings.orbitTilt),
      Math.sin(angle) * radius * Math.cos(moon.settings.orbitTilt),
    )
    moon.object.rotation.y += delta * 0.3
  }
}
