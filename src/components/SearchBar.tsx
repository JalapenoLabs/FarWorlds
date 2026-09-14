// Copyright © 2026 JalapenoLabs

import type { FormEvent } from 'react'

// Core
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

// User interface
import { FiSearch } from 'react-icons/fi'

// Utility
import { searchTheWeb } from '@/browser/search'

/** A search field that submits to the browser's default engine. Optional; off until enabled in settings. */
export function SearchBar() {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')

  function onSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    searchTheWeb(query)
  }

  return <form className='fade-in mt-5 flex w-full max-w-md items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-2 backdrop-blur-md focus-within:border-accent' onSubmit={onSubmit}>
    <FiSearch className='h-4 w-4 shrink-0 opacity-60' />
    <input
      className='min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-white/40'
      type='search'
      placeholder={t('search.placeholder')}
      aria-label={t('search.placeholder')}
      value={query}
      onChange={(event) => setQuery(event.currentTarget.value)}
    />
    <button type='submit' className='sr-only'>
      <span>{
        t('search.submit')
      }</span>
    </button>
  </form>
}
