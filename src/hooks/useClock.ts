// Copyright © 2026 JalapenoLabs

// Core
import { useEffect, useState } from 'react'

/** The current time, refreshed on the second so the HUD never shows a stale minute. */
export function useClock(): Date {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    let timer = 0
    function schedule(): void {
      const current = new Date()
      setNow(current)
      timer = window.setTimeout(schedule, 1000 - current.getMilliseconds())
    }
    schedule()
    return () => window.clearTimeout(timer)
  }, [])

  return now
}
