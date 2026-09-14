// Copyright © 2026 Alex Navarro

import type { Coordinates } from '@/planet/coordinates'
import type { WorldRecord } from '@/store/playerDataSlice'

// Core
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

// Redux
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { forgetWorld, saveWorld } from '@/store/playerDataSlice'

// User interface
import { WorldRow } from './WorldRow'

// Misc
import { SAVED_WORLDS_LIMIT } from '@/constants'

type Props = {
  travelTo: (coordinates: Coordinates) => Promise<void>
}

type Tab = 'history' | 'saved'

/** The logbook: recent travels and saved worlds, each row travelling back on click. */
export function BookletPanel(props: Props) {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const travelHistory = useAppSelector((state) => state.playerData.travelHistory)
  const savedWorlds = useAppSelector((state) => state.playerData.savedWorlds)
  const [tab, setTab] = useState<Tab>('history')
  const [notice, setNotice] = useState<string | null>(null)

  const savedList = Object.values(savedWorlds).sort((left, right) => right.timestamp - left.timestamp)
  const records = tab === 'history'
    ? travelHistory
    : savedList

  function toggleSaved(record: WorldRecord): void {
    if (savedWorlds[record.seed]) {
      dispatch(forgetWorld(record.seed))
      return
    }
    if (savedList.length >= SAVED_WORLDS_LIMIT) {
      setNotice(t('booklet.full'))
      return
    }
    setNotice(null)
    dispatch(saveWorld(record))
  }

  const tabClass = (isActive: boolean) => isActive
    ? 'text-white'
    : 'opacity-50 hover:opacity-90'

  return <div className='panel fade-in mt-2 flex w-80 max-h-[70vh] flex-col p-4'>
    <div className='compact flex gap-4'>
      <button type='button' className={tabClass(tab === 'history')} onClick={() => setTab('history')}>
        <span>{
          t('booklet.history')
        }</span>
      </button>
      <button type='button' className={tabClass(tab === 'saved')} onClick={() => setTab('saved')}>
        <span>{
          t('booklet.saved')
        }</span>
      </button>
    </div>
    {notice
      ? <p className='compact text-xs text-accent'>{
        notice
      }</p>
      : null}
    <div className='min-h-0 overflow-y-auto pr-1'>
      {records.length
        ? records.map((record) => <WorldRow
          key={record.seed}
          record={record}
          isSaved={Boolean(savedWorlds[record.seed])}
          onTravel={() => void props.travelTo(record.coordinates)}
          onToggleSaved={() => toggleSaved(record)}
        />)
        : <p className='py-6 text-center opacity-50'>{
          t('booklet.empty')
        }</p>}
    </div>
  </div>
}
