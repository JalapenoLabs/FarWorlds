// Copyright © 2026 Alex Navarro

import type { PlanetBlueprint } from '@/planet/types'
import type { World } from './worldGroup'

// Core
import {
  AmbientLight,
  Clock,
  DirectionalLight,
  HemisphereLight,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
} from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

// Utility
import { createStarfield } from './starfield'
import { animateWorld, createWorld } from './worldGroup'

// Misc
import { PLANET_RADIUS, THUMBNAIL_SIZE } from '@/constants'

/** Fraction of the viewport width the world is pushed left of centre, leaving room for the HUD on the right. */
const WORLD_HORIZONTAL_OFFSET = 0.16

const ARRIVAL_DURATION_SECONDS = 0.9
const DEPARTURE_DURATION_SECONDS = 0.45

export type SceneOptions = {
  autoRotate: boolean
  pixelRatio: number
}

type Transition = {
  world: World
  startedAt: number
  from: number
  to: number
  duration: number
  onComplete?: () => void
}

function easeOutCubic(ratio: number): number {
  return 1 - Math.pow(1 - ratio, 3)
}

/**
 * Owns the renderer, camera and animation loop. Worlds are built asynchronously and swapped in with a short
 * scale transition; the previous world shrinks away while the new one grows in.
 */
export class SpaceScene {
  private readonly renderer: WebGLRenderer
  private readonly scene = new Scene()
  private readonly camera: PerspectiveCamera
  private readonly controls: OrbitControls
  private readonly clock = new Clock()
  private readonly sun: DirectionalLight
  private options: SceneOptions
  private world: World | null = null
  private worldShownAt = 0
  private transitions: Transition[] = []
  private frameHandle = 0
  private frameTimes: number[] = []
  private disposed = false

  onFrameRate: ((fps: number) => void) | null = null

  constructor(canvas: HTMLCanvasElement, options: SceneOptions) {
    this.options = options
    this.renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
    this.renderer.setPixelRatio(options.pixelRatio)
    this.renderer.setClearColor(0x000000, 0)

    this.camera = new PerspectiveCamera(45, 1, 0.1, 2000)
    this.camera.position.set(0, PLANET_RADIUS * 0.6, PLANET_RADIUS * 3.6)

    this.controls = new OrbitControls(this.camera, canvas)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.06
    this.controls.enablePan = false
    this.controls.minDistance = PLANET_RADIUS * 1.7
    this.controls.maxDistance = PLANET_RADIUS * 12
    this.controls.rotateSpeed = 0.6

    this.sun = new DirectionalLight(0xffffff, 2.4)
    this.sun.position.set(6, 5, 6.2)
    this.scene.add(this.sun)
    this.scene.add(new AmbientLight(0xffffff, 0.08))
    this.scene.add(new HemisphereLight(0x8ab4ff, 0x1a0b2e, 0.25))
    this.scene.add(createStarfield())

    this.resize()
    window.addEventListener('resize', this.resize)
    this.frameHandle = requestAnimationFrame(this.renderFrame)
  }

  updateOptions(options: Partial<SceneOptions>): void {
    this.options = { ...this.options, ...options }
    if (options.pixelRatio !== undefined) {
      this.renderer.setPixelRatio(options.pixelRatio)
      this.resize()
    }
  }

  /**
   * Builds and shows a world. Resolves once it is on screen. If another world is requested before this one
   * finishes building, the stale result is discarded rather than flashed on screen.
   */
  async showWorld(blueprint: PlanetBlueprint, resolution: number): Promise<void> {
    this.pendingSeed = blueprint.seed
    const world = await createWorld(blueprint, resolution)
    if (this.disposed || this.pendingSeed !== blueprint.seed) {
      world.dispose()
      return
    }

    const now = this.clock.getElapsedTime()
    const previous = this.world
    if (previous) {
      this.transitions.push({
        world: previous,
        startedAt: now,
        from: previous.group.scale.x,
        to: 0.001,
        duration: DEPARTURE_DURATION_SECONDS,
        onComplete: () => {
          this.scene.remove(previous.group)
          previous.dispose()
        },
      })
    }

    world.group.scale.setScalar(0.001)
    this.scene.add(world.group)
    this.world = world
    this.worldShownAt = now
    this.transitions.push({ world, startedAt: now, from: 0.001, to: 1, duration: ARRIVAL_DURATION_SECONDS })

    this.controls.maxDistance = Math.max(PLANET_RADIUS * 12, world.framingDistance * 2)
    this.flyTo(world.framingDistance)
  }

  private pendingSeed: string | null = null

  /** Moves the camera to a fresh framing distance while keeping its current orbit direction. */
  private flyTo(distance: number): void {
    const direction = new Vector3().copy(this.camera.position).sub(this.controls.target).normalize()
    if (direction.lengthSq() === 0) {
      direction.set(0, 0.16, 1).normalize()
    }
    this.camera.position.copy(direction.multiplyScalar(distance))
    this.controls.update()
  }

  /**
   * Captures the current world as a small square image for the logbook. Must run right after a render, so it
   * renders synchronously itself and reads the drawing buffer before the browser can clear it.
   */
  captureThumbnail(): string | null {
    if (!this.world) {
      return null
    }
    this.renderer.render(this.scene, this.camera)
    const source = this.renderer.domElement
    const centre = new Vector3(0, 0, 0).project(this.camera)
    const edge = new Vector3(this.world.framingDistance * 0.36, 0, 0).project(this.camera)
    const pixelRatio = this.renderer.getPixelRatio()
    const centreX = ((centre.x + 1) / 2) * source.clientWidth * pixelRatio
    const centreY = ((1 - centre.y) / 2) * source.clientHeight * pixelRatio
    const radius = Math.abs(edge.x - centre.x) / 2 * source.clientWidth * pixelRatio

    const canvas = document.createElement('canvas')
    canvas.width = THUMBNAIL_SIZE
    canvas.height = THUMBNAIL_SIZE
    const context = canvas.getContext('2d')
    if (!context) {
      console.debug('captureThumbnail could not get a 2D context')
      return null
    }
    context.fillStyle = '#09142a'
    context.fillRect(0, 0, THUMBNAIL_SIZE, THUMBNAIL_SIZE)
    context.drawImage(
      source,
      centreX - radius,
      centreY - radius,
      radius * 2,
      radius * 2,
      0,
      0,
      THUMBNAIL_SIZE,
      THUMBNAIL_SIZE,
    )
    return canvas.toDataURL('image/jpeg', 0.7)
  }

  dispose(): void {
    this.disposed = true
    cancelAnimationFrame(this.frameHandle)
    window.removeEventListener('resize', this.resize)
    this.controls.dispose()
    this.world?.dispose()
    this.renderer.dispose()
  }

  private readonly resize = (): void => {
    const width = window.innerWidth
    const height = window.innerHeight
    this.camera.aspect = width / height
    // Shifting the view window right renders the orbit target left of centre without tilting the camera.
    const offset = width > height
      ? Math.round(width * WORLD_HORIZONTAL_OFFSET)
      : 0
    this.camera.setViewOffset(width, height, offset, 0, width, height)
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(width, height, false)
  }

  private readonly renderFrame = (): void => {
    if (this.disposed) {
      return
    }
    this.frameHandle = requestAnimationFrame(this.renderFrame)

    const delta = Math.min(this.clock.getDelta(), 0.1)
    const now = this.clock.getElapsedTime()

    this.transitions = this.transitions.filter((transition) => {
      const ratio = Math.min(1, (now - transition.startedAt) / transition.duration)
      const scale = transition.from + (transition.to - transition.from) * easeOutCubic(ratio)
      transition.world.group.scale.setScalar(scale)
      if (ratio >= 1) {
        transition.onComplete?.()
        return false
      }
      return true
    })

    if (this.world) {
      animateWorld(this.world, now - this.worldShownAt, delta, this.options.autoRotate)
    }

    this.controls.update()
    this.renderer.render(this.scene, this.camera)
    this.trackFrameRate(now)
  }

  private trackFrameRate(now: number): void {
    if (!this.onFrameRate) {
      return
    }
    this.frameTimes.push(now)
    while (this.frameTimes.length && now - (this.frameTimes[0] ?? now) > 1) {
      this.frameTimes.shift()
    }
    this.onFrameRate(this.frameTimes.length)
  }
}
