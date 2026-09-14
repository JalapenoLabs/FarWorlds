// Copyright © 2026 Alex Navarro

import type { Coordinates } from '@/planet/coordinates'
import type { FormEvent } from 'react'

// Core
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

// Redux
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { closePanel } from '@/store/worldSlice'

// Utility
import { CURRENT_ERA, Era, clampCoordinate, parseCoordinateText, toEra } from '@/planet/coordinates'

type Props = {
  travelTo: (coordinates: Coordinates) => Promise<void>
}

const ERAS = [Era.First, Era.Second] as const
const AXES = ['x', 'y', 'z'] as const
const axisLabelKey = {
  x: 'travel.alpha',
  y: 'travel.beta',
  z: 'travel.gamma',
} as const satisfies Record<(typeof AXES)[number], string>

/** Manual travel: type or paste a coordinate and go. Starts from the current world so small edits are easy. */
export function TravelPanel(props: Props) {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const current = useAppSelector((state) => state.world.blueprint?.coordinates)
  const firstFieldRef = useRef<HTMLInputElement>(null)

  const [draft, setDraft] = useState({
    x: current?.x.toFixed(2) ?? '0.00',
    y: current?.y.toFixed(2) ?? '0.00',
    z: current?.z.toFixed(2) ?? '0.00',
    w: current?.w ?? CURRENT_ERA,
  })

  useEffect(() => {
    firstFieldRef.current?.focus()
    firstFieldRef.current?.select()
  }, [])

  const parsed = {
    x: Number.parseFloat(draft.x),
    y: Number.parseFloat(draft.y),
    z: Number.parseFloat(draft.z),
  }
  const isValid = !Number.isNaN(parsed.x) && !Number.isNaN(parsed.y) && !Number.isNaN(parsed.z)

  function onSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    if (!isValid) {
      return
    }
    dispatch(closePanel())
    void props.travelTo({
      x: clampCoordinate(parsed.x),
      y: clampCoordinate(parsed.y),
      z: clampCoordinate(parsed.z),
      w: draft.w,
    })
  }

  function onPaste(text: string): void {
    const coordinates = parseCoordinateText(text)
    if (!coordinates) {
      return
    }
    setDraft({
      x: coordinates.x.toFixed(2),
      y: coordinates.y.toFixed(2),
      z: coordinates.z.toFixed(2),
      w: coordinates.w,
    })
  }

  return <form className='panel fade-in mb-3 w-72 p-4' onSubmit={onSubmit}>
    <h2 className='compact text-lg'>{
      t('travel.title')
    }</h2>
    <label className='level compact'>
      <span>{
        t('travel.era')
      }</span>
      <select
        className='field w-36'
        value={draft.w}
        onChange={(event) => setDraft({ ...draft, w: toEra(Number(event.currentTarget.value)) })}
      >{
        ERAS.map((era) => <option key={era} value={era}>{
          t(`travel.eras.${era}`)
        }</option>)
      }</select>
    </label>
    {AXES.map((axis, index) => <label key={axis} className='level compact'>
      <span>{
        t(axisLabelKey[axis])
      }</span>
      <input
        ref={index === 0 ? firstFieldRef : undefined}
        className='field w-36 tabular-nums'
        inputMode='decimal'
        value={draft[axis]}
        onChange={(event) => setDraft({ ...draft, [axis]: event.currentTarget.value })}
        onPaste={(event) => {
          const text = event.clipboardData.getData('text')
          if (parseCoordinateText(text)) {
            event.preventDefault()
            onPaste(text)
          }
        }}
      />
    </label>)}
    <div className='level'>
      <span className='text-xs opacity-50'>{
        t('travel.paste')
      }</span>
      <button type='submit' className='button' disabled={!isValid}>
        <span>{
          t('travel.go')
        }</span>
      </button>
    </div>
  </form>
}
