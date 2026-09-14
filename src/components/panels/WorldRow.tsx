// Copyright © 2026 JalapenoLabs

import type { WorldRecord } from '@/store/playerDataSlice'

// Core
import { useTranslation } from 'react-i18next'

// User interface
import { FiStar } from 'react-icons/fi'

// Utility
import moment from 'moment'

type Props = {
  record: WorldRecord
  isSaved: boolean
  onTravel: () => void
  onToggleSaved: () => void
}

/** One logbook row: thumbnail, name, when, and a save toggle. */
export function WorldRow(props: Props) {
  const { t } = useTranslation()

  return <div className='level compact'>
    <button
      type='button'
      className='flex min-w-0 flex-1 items-center gap-3 rounded-lg p-1 text-left hover:bg-white/5'
      onClick={props.onTravel}
    >
      <span className='h-10 w-10 shrink-0 overflow-hidden rounded-full bg-white/5'>
        {props.record.thumbnail
          ? <img
            src={props.record.thumbnail}
            alt=''
            className='h-full w-full object-cover'
          />
          : null}
      </span>
      <span className='min-w-0'>
        <span className='block truncate'>{
          props.record.name
        }</span>
        <span className='block text-xs opacity-50'>{
          moment(props.record.timestamp).fromNow()
        }</span>
      </span>
    </button>
    <button
      type='button'
      className='icon-button h-8 w-8'
      title={props.isSaved ? t('booklet.forget') : t('booklet.save')}
      aria-label={props.isSaved ? t('booklet.forget') : t('booklet.save')}
      aria-pressed={props.isSaved}
      onClick={props.onToggleSaved}
    >
      <FiStar
        className='h-4 w-4'
        style={props.isSaved ? { fill: 'var(--color-accent)', color: 'var(--color-accent)' } : undefined}
      />
    </button>
  </div>
}
