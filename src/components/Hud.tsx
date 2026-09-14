// Copyright © 2026 Alex Navarro

// Core
import { useTranslation } from 'react-i18next'
import { useClock } from '@/hooks/useClock'

// Redux
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { togglePanel } from '@/store/worldSlice'

// User interface
import { FiSearch } from 'react-icons/fi'
import { SearchBar } from './SearchBar'
import { Shortcuts } from './Shortcuts'
import { WorldInfoPanel } from './panels/WorldInfoPanel'

// Utility
import moment from 'moment'

type Props = {
  frameRate: number
}

/** Date, time and the world's name, sitting to the right of the world. */
export function Hud(props: Props) {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const now = useClock()
  const timeFormat = useAppSelector((state) => state.settings.timeFormat)
  const showFps = useAppSelector((state) => state.settings.showFps)
  const showSearch = useAppSelector((state) => state.settings.showSearch)
  const showShortcuts = useAppSelector((state) => state.settings.showShortcuts)
  const blueprint = useAppSelector((state) => state.world.blueprint)
  const status = useAppSelector((state) => state.world.status)
  const activePanel = useAppSelector((state) => state.world.activePanel)

  const time = moment(now)
  const hours = timeFormat === '24h'
    ? time.format('HH:mm')
    : time.format('h:mm')
  const meridiem = timeFormat === '24h'
    ? ''
    : time.format('A')

  let worldLine = null
  if (status === 'loading') {
    worldLine = <p className='text-xl opacity-60'>{
      t('hud.loading')
    }</p>
  }
  else if (status === 'error') {
    worldLine = <p className='text-xl text-red-300'>{
      t('hud.error')
    }</p>
  }
  else if (blueprint) {
    worldLine = <button
      type='button'
      className='group inline-flex items-center gap-2 text-[5vh] leading-none hover:text-accent transition-colors'
      title={t('hud.openInfo')}
      onClick={() => dispatch(togglePanel('info'))}
    >
      <span>{
        blueprint.name
      }</span>
      <FiSearch
        className='h-[2.2vh] w-[2.2vh] opacity-50 group-hover:opacity-100'
      />
    </button>
  }

  return <div className='fixed inset-y-0 right-0 flex w-[48%] max-lg:w-full items-center pl-[4%] max-lg:justify-center max-lg:pl-0 max-lg:items-end max-lg:pb-24'>
    {activePanel === 'info' && blueprint
      ? <WorldInfoPanel
        blueprint={blueprint}
      />
      : <div className='fade-in select-none'>
        <p className='text-[3vh] leading-tight opacity-90'>{
          time.format('MMM Do, YYYY')
        }</p>
        <p className='my-1 flex items-baseline gap-2 leading-none'>
          <span className='text-[11vh] tabular-nums'>{
            hours
          }</span>
          <span className='text-[5vh] opacity-90'>{
            meridiem
          }</span>
        </p>
        {worldLine}
        {showSearch
          ? <SearchBar />
          : null}
        {showShortcuts
          ? <Shortcuts />
          : null}
        {showFps
          ? <p className='mt-4 text-sm opacity-50 tabular-nums'>{
            `${props.frameRate} fps`
          }</p>
          : null}
      </div>}
  </div>
}
