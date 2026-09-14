// Copyright © 2026 Alex Navarro

// Core
import { useTranslation } from 'react-i18next'
import { useShortcuts } from '@/hooks/useShortcuts'

/** The browser's most visited sites as a row of favicons, like Chrome's own new tab. Optional. */
export function Shortcuts() {
  const { t } = useTranslation()
  const shortcuts = useShortcuts()

  if (!shortcuts.length) {
    return <p className='fade-in mt-5 text-sm opacity-40'>{
      t('shortcuts.empty')
    }</p>
  }

  return <div className='fade-in mt-5 flex max-w-md flex-wrap gap-x-2 gap-y-3'>{
    shortcuts.map((shortcut) => <a
      key={shortcut.url}
      className='flex w-[4.5rem] flex-col items-center gap-1.5 rounded-lg px-1 py-1.5 text-center hover:bg-white/8'
      href={shortcut.url}
      title={shortcut.title}
    >
      <span className='flex h-10 w-10 items-center justify-center rounded-full bg-white/10'>
        <img
          src={shortcut.iconUrl}
          alt=''
          width={20}
          height={20}
          className='h-5 w-5'
        />
      </span>
      <span className='w-full truncate text-xs opacity-80'>{
        shortcut.title
      }</span>
    </a>)
  }</div>
}
