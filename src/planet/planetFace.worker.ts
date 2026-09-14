// Copyright © 2026 JalapenoLabs

import type { TerrainFaceRequest, TerrainFaceResult } from './terrainFace'

// Utility
import { buildTerrainFace } from './terrainFace'

/**
 * Terrain generation is pure CPU work that would freeze the tab for a noticeable moment at high resolution, so
 * each face is built off the main thread and its buffers are transferred back.
 */
self.onmessage = (event: MessageEvent<TerrainFaceRequest>) => {
  const result: TerrainFaceResult = buildTerrainFace(event.data)
  self.postMessage(result, [result.positions.buffer, result.colors.buffer, result.indices.buffer])
}
