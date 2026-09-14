// Copyright © 2026 JalapenoLabs

import type { PlanetBlueprint } from '@/planet/types'

// Core
import { useTranslation } from 'react-i18next'

// Redux
import { useAppDispatch } from '@/store/hooks'
import { closePanel } from '@/store/worldSlice'

// User interface
import { FiCornerUpLeft } from 'react-icons/fi'

type Props = {
  blueprint: PlanetBlueprint
}

type StatProps = {
  label: string
  children: string
}

function Stat(props: StatProps) {
  return <div className='compact'>
    <p className='text-[2.6vh] leading-tight'>{
      props.label
    }</p>
    <p className='text-[2vh] text-accent tabular-nums'>{
      props.children
    }</p>
  </div>
}

/** The scanner readout for the current world, shown in place of the clock. */
export function WorldInfoPanel(props: Props) {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { blueprint } = props

  const celsius = blueprint.surfaceTemperature
  const fahrenheit = celsius * 9 / 5 + 32
  const coordinates = blueprint.coordinates

  return <div className='fade-in'>
    <div className='compact flex items-center gap-3'>
      <h1 className='text-[7vh] leading-none'>{
        blueprint.name
      }</h1>
      <button
        type='button'
        className='icon-button'
        title={t('controls.back')}
        aria-label={t('controls.back')}
        onClick={() => dispatch(closePanel())}
      >
        <FiCornerUpLeft className='h-5 w-5' />
      </button>
    </div>
    <Stat label={t('info.type')}>{
      t(`planetType.${blueprint.type}`)
    }</Stat>
    <Stat label={t('info.coordinates')}>{
      `α: ${coordinates.x.toFixed(2)}   β: ${coordinates.y.toFixed(2)}   γ: ${coordinates.z.toFixed(2)}`
    }</Stat>
    <Stat label={t('info.habitability')}>{
      t('info.percent', { value: blueprint.habitability.toFixed(2) })
    }</Stat>
    <Stat label={t('info.temperature')}>{
      t('info.temperatureValue', { fahrenheit: fahrenheit.toFixed(2), celsius: celsius.toFixed(2) })
    }</Stat>
  </div>
}
