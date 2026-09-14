// Copyright © 2026 JalapenoLabs

import type { Coordinates } from '@/planet/coordinates'

// Core
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

// Redux
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { togglePanel } from '@/store/worldSlice'

// User interface
import { FiBookOpen, FiNavigation, FiSend, FiSettings, FiShuffle } from 'react-icons/fi'
import { IconButton } from './IconButton'
import { BookletPanel } from './panels/BookletPanel'
import { SettingsPanel } from './panels/SettingsPanel'
import { TravelPanel } from './panels/TravelPanel'

// Utility
import { formatCoordinates, randomCoordinates } from '@/planet/coordinates'


type Props = {
  travelTo: (coordinates: Coordinates) => Promise<void>
}

const COPIED_MESSAGE_MS = 1600

/** Every corner control and the panel each one opens. */
export function Overlay(props: Props) {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const activePanel = useAppSelector((state) => state.world.activePanel)
  const blueprint = useAppSelector((state) => state.world.blueprint)
  const [copied, setCopied] = useState(false)

  async function copyCoordinates(): Promise<void> {
    if (!blueprint) {
      return
    }
    try {
      await navigator.clipboard.writeText(formatCoordinates(blueprint.coordinates))
      setCopied(true)
      window.setTimeout(() => setCopied(false), COPIED_MESSAGE_MS)
    }
    catch (error) {
      console.warn('Clipboard write failed', error)
    }
  }

  return <>
    <div className='fixed left-4 top-4'>
      <IconButton
        label={t('controls.booklet')}
        isActive={activePanel === 'booklet'}
        onClick={() => dispatch(togglePanel('booklet'))}
      >
        <FiBookOpen className='h-5 w-5' />
      </IconButton>
      {activePanel === 'booklet'
        ? <BookletPanel
          travelTo={props.travelTo}
        />
        : null}
    </div>

    <div className='fixed right-4 top-4 flex items-center gap-2'>
      {copied
        ? <span className='fade-in text-sm opacity-80'>{
          t('controls.copied')
        }</span>
        : null}
      <IconButton
        label={t('controls.share')}
        onClick={() => void copyCoordinates()}
      >
        <FiSend className='h-5 w-5' />
      </IconButton>
    </div>

    <div className='fixed bottom-4 left-4'>
      {activePanel === 'settings'
        ? <SettingsPanel />
        : null}
      {activePanel === 'travel'
        ? <TravelPanel
          travelTo={props.travelTo}
        />
        : null}
      <div className='flex items-center gap-1'>
        <IconButton
          label={t('controls.settings')}
          isActive={activePanel === 'settings'}
          onClick={() => dispatch(togglePanel('settings'))}
        >
          <FiSettings className='h-5 w-5' />
        </IconButton>
        <IconButton
          label={t('controls.travel')}
          isActive={activePanel === 'travel'}
          onClick={() => dispatch(togglePanel('travel'))}
        >
          <FiNavigation className='h-5 w-5' />
        </IconButton>
        <IconButton
          label={t('controls.shuffle')}
          onClick={() => void props.travelTo(randomCoordinates())}
        >
          <FiShuffle className='h-5 w-5' />
        </IconButton>
      </div>
    </div>

  </>
}
