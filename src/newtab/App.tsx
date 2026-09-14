// Copyright © 2026 JalapenoLabs

// Core
import { useSpaceScene } from '@/hooks/useSpaceScene'

// User interface
import { Hud } from '@/components/Hud'
import { Overlay } from '@/components/Overlay'

const CANVAS_ID = 'space'

export function App() {
  const { travelTo, frameRate } = useSpaceScene(CANVAS_ID)

  return <>
    <Hud
      frameRate={frameRate}
    />
    <Overlay
      travelTo={travelTo}
    />
  </>
}
