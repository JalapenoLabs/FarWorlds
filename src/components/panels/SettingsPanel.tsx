// Copyright © 2026 Alex Navarro

import type { GraphicsQuality } from '@/constants'
import type { TimeFormat } from '@/store/settingsSlice'

// Core
import { useTranslation } from 'react-i18next'

// Redux
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { updateSetting } from '@/store/settingsSlice'

// Misc
import { FACE_RESOLUTION_BY_QUALITY } from '@/constants'

const GRAPHICS_QUALITIES = Object.keys(FACE_RESOLUTION_BY_QUALITY) as GraphicsQuality[]
const TIME_FORMATS: TimeFormat[] = ['12h', '24h']

type ToggleRowProps = {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}

function ToggleRow(props: ToggleRowProps) {
  return <label className='level compact cursor-pointer'>
    <span className='whitespace-nowrap'>{
      props.label
    }</span>
    <input
      type='checkbox'
      className='h-4 w-4 accent-accent'
      checked={props.checked}
      onChange={(event) => props.onChange(event.currentTarget.checked)}
    />
  </label>
}

export function SettingsPanel() {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const settings = useAppSelector((state) => state.settings)

  return <div className='panel fade-in mb-3 w-80 p-4'>
    <h2 className='compact text-lg'>{
      t('settings.title')
    }</h2>
    <label className='level compact'>
      <span className='whitespace-nowrap'>{
        t('settings.graphicsQuality')
      }</span>
      <select
        className='field w-32'
        value={settings.graphicsQuality}
        onChange={(event) => {
          dispatch(updateSetting({ key: 'graphicsQuality', value: event.currentTarget.value as GraphicsQuality }))
        }}
      >{
        GRAPHICS_QUALITIES.map((quality) => <option key={quality} value={quality}>{
          t(`settings.quality.${quality}`)
        }</option>)
      }</select>
    </label>
    <label className='level compact'>
      <span className='whitespace-nowrap'>{
        t('settings.timeFormat')
      }</span>
      <select
        className='field w-32'
        value={settings.timeFormat}
        onChange={(event) => {
          dispatch(updateSetting({ key: 'timeFormat', value: event.currentTarget.value as TimeFormat }))
        }}
      >{
        TIME_FORMATS.map((format) => <option key={format} value={format}>{
          t(`settings.time.${format}`)
        }</option>)
      }</select>
    </label>
    <ToggleRow
      label={t('settings.useNativeResolution')}
      checked={settings.useNativeResolution}
      onChange={(value) => dispatch(updateSetting({ key: 'useNativeResolution', value }))}
    />
    <ToggleRow
      label={t('settings.autoRotate')}
      checked={settings.autoRotate}
      onChange={(value) => dispatch(updateSetting({ key: 'autoRotate', value }))}
    />
    <ToggleRow
      label={t('settings.showFps')}
      checked={settings.showFps}
      onChange={(value) => dispatch(updateSetting({ key: 'showFps', value }))}
    />
  </div>
}
