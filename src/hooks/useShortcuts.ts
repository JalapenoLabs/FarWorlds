// Copyright © 2026 JalapenoLabs

import type { Shortcut } from '@/browser/topSites'

// Core
import { useEffect, useState } from 'react'

// Utility
import { hasShortcutPermissions, loadShortcuts } from '@/browser/topSites'

/**
 * Loads the most-visited list once, when the shortcuts widget mounts. The widget only mounts while its setting
 * is on, so there is nothing to clear on disable.
 */
export function useShortcuts(): Shortcut[] {
  const [shortcuts, setShortcuts] = useState<Shortcut[]>([])

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const allowed = await hasShortcutPermissions()
      if (!allowed) {
        console.debug('Shortcuts are enabled but their permissions are missing')
        return
      }
      const loaded = await loadShortcuts()
      if (!cancelled) {
        setShortcuts(loaded)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return shortcuts
}
