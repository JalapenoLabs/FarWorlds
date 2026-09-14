// Copyright © 2026 Alex Navarro

import type { Coordinates } from '@/planet/coordinates'

// Core
import { useCallback, useEffect, useRef, useState } from 'react'

// Redux
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { attachThumbnail, recordVisit } from '@/store/playerDataSlice'
import { beginTravel, worldFailed, worldReady } from '@/store/worldSlice'

// Utility
import { createPlanetBlueprint } from '@/planet/blueprint'
import { parseCoordinates, randomCoordinates } from '@/planet/coordinates'
import { SpaceScene } from '@/scene/SpaceScene'

// Misc
import { FACE_RESOLUTION_BY_QUALITY } from '@/constants'

/**
 * Binds the three.js scene to the store: creates it once against the page canvas, mirrors the relevant
 * settings into it, and exposes `travelTo` as the single way to change worlds.
 */
export function useSpaceScene(canvasId: string) {
  const dispatch = useAppDispatch()
  const graphicsQuality = useAppSelector((state) => state.settings.graphicsQuality)
  const useNativeResolution = useAppSelector((state) => state.settings.useNativeResolution)
  const autoRotate = useAppSelector((state) => state.settings.autoRotate)
  const showFps = useAppSelector((state) => state.settings.showFps)

  const sceneRef = useRef<SpaceScene | null>(null)
  const [frameRate, setFrameRate] = useState(0)

  // Settings are read through a ref inside travelTo so it keeps a stable identity for the buttons.
  const qualityRef = useRef(graphicsQuality)
  useEffect(() => {
    qualityRef.current = graphicsQuality
  }, [graphicsQuality])

  const travelTo = useCallback(async (coordinates: Coordinates) => {
    const scene = sceneRef.current
    if (!scene) {
      console.debug('travelTo called before the scene exists', coordinates)
      return
    }

    const blueprint = createPlanetBlueprint(coordinates)
    dispatch(beginTravel(blueprint))

    const query = new URLSearchParams({
      x: coordinates.x.toFixed(2),
      y: coordinates.y.toFixed(2),
      z: coordinates.z.toFixed(2),
      w: String(coordinates.w),
    })
    window.history.replaceState(null, '', `?${query.toString()}`)

    try {
      await scene.showWorld(blueprint, FACE_RESOLUTION_BY_QUALITY[qualityRef.current])
    }
    catch (error) {
      console.error('World generation failed', error)
      dispatch(worldFailed(blueprint.seed))
      return
    }

    dispatch(worldReady(blueprint.seed))
    dispatch(recordVisit({
      seed: blueprint.seed,
      coordinates: blueprint.coordinates,
      name: blueprint.name,
      type: blueprint.type,
      timestamp: Date.now(),
    }))

    // The arrival animation needs a moment before the world is worth photographing.
    window.setTimeout(() => {
      const thumbnail = sceneRef.current?.captureThumbnail()
      if (thumbnail) {
        dispatch(attachThumbnail({ seed: blueprint.seed, thumbnail }))
      }
    }, 1200)
  }, [dispatch])

  useEffect(() => {
    const canvas = document.getElementById(canvasId)
    if (!(canvas instanceof HTMLCanvasElement)) {
      throw new Error(`Canvas #${canvasId} is missing from the page`)
    }

    const scene = new SpaceScene(canvas, {
      autoRotate,
      pixelRatio: useNativeResolution
        ? window.devicePixelRatio
        : Math.min(window.devicePixelRatio, 1),
    })
    sceneRef.current = scene

    // The first world comes from the URL when the tab was opened from a shared link, otherwise the dice.
    void travelTo(parseCoordinates(window.location.search, randomCoordinates()))

    return () => {
      scene.dispose()
      sceneRef.current = null
    }
    // The scene is created once; later setting changes are applied by the effects below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasId, travelTo])

  useEffect(() => {
    sceneRef.current?.updateOptions({
      autoRotate,
      pixelRatio: useNativeResolution
        ? window.devicePixelRatio
        : Math.min(window.devicePixelRatio, 1),
    })
  }, [autoRotate, useNativeResolution])

  useEffect(() => {
    const scene = sceneRef.current
    if (!scene) {
      return
    }
    scene.onFrameRate = showFps
      ? setFrameRate
      : null
    return () => {
      scene.onFrameRate = null
    }
  }, [showFps])

  return { travelTo, frameRate } as const
}
