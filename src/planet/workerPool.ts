// Copyright © 2026 JalapenoLabs

import type { TerrainFaceRequest, TerrainFaceResult } from './terrainFace'

type PendingTask = {
  request: TerrainFaceRequest
  resolve: (result: TerrainFaceResult) => void
  reject: (error: Error) => void
}

/**
 * A fixed set of terrain workers shared by every body on the page. Spawning workers per planet was wasteful and
 * left the browser juggling dozens of short-lived threads when a world had moons; a pool keeps the thread count
 * bounded and lets bodies generate in parallel.
 */
class TerrainWorkerPool {
  private readonly idle: Worker[] = []
  private readonly queue: PendingTask[] = []
  private readonly inFlight = new Map<Worker, PendingTask>()
  private spawned = 0

  constructor(private readonly size: number) {}

  runFace(request: TerrainFaceRequest): Promise<TerrainFaceResult> {
    return new Promise((resolve, reject) => {
      this.queue.push({ request, resolve, reject })
      this.pump()
    })
  }

  private pump(): void {
    while (this.queue.length) {
      const worker = this.idle.pop() ?? this.spawn()
      if (!worker) {
        return
      }
      const task = this.queue.shift()
      if (!task) {
        this.idle.push(worker)
        return
      }
      this.inFlight.set(worker, task)
      worker.postMessage(task.request)
    }
  }

  /** Creates a worker until the pool is full; returns null once every slot is busy. */
  private spawn(): Worker | null {
    if (this.spawned >= this.size) {
      return null
    }
    this.spawned += 1
    const worker = new Worker(new URL('./planetFace.worker.ts', import.meta.url), { type: 'module' })

    worker.onmessage = (event: MessageEvent<TerrainFaceResult>) => {
      const task = this.inFlight.get(worker)
      this.inFlight.delete(worker)
      this.idle.push(worker)
      task?.resolve(event.data)
      this.pump()
    }

    worker.onerror = (event) => {
      const task = this.inFlight.get(worker)
      this.inFlight.delete(worker)
      console.error('Terrain worker failed', event.message)
      task?.reject(new Error(event.message))
      // The failed worker is discarded; a replacement is spawned on demand.
      worker.terminate()
      this.spawned -= 1
      this.pump()
    }

    return worker
  }
}

let sharedPool: TerrainWorkerPool | null = null

export function getTerrainWorkerPool(): TerrainWorkerPool {
  if (!sharedPool) {
    // Leave a core for the main thread; a single-core machine still gets one worker.
    const size = Math.max(1, Math.min(6, (navigator.hardwareConcurrency || 4) - 1))
    sharedPool = new TerrainWorkerPool(size)
  }
  return sharedPool
}
