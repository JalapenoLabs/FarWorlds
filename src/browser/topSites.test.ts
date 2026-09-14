// Copyright © 2026 JalapenoLabs

// Core
import { describe, expect, it } from 'vitest'

// Utility
import { buildFaviconUrl, toShortcuts } from './topSites'

// Misc
import { SHORTCUT_ICON_SIZE, SHORTCUT_LIMIT } from '@/constants'

const base = 'chrome-extension://abcdefghijklmnop/'

describe('buildFaviconUrl', () => {
  it('points at the extension favicon path with the page and size encoded', () => {
    const url = buildFaviconUrl('https://example.com/a?b=1', base)
    const [prefix, query] = url.split('?', 2)
    expect(prefix).toBe('chrome-extension://abcdefghijklmnop/_favicon/')
    const params = new URLSearchParams(query)
    expect(params.get('pageUrl')).toBe('https://example.com/a?b=1')
    expect(params.get('size')).toBe(String(SHORTCUT_ICON_SIZE))
  })
})

describe('toShortcuts', () => {
  it('caps the list and keeps order', () => {
    const sites = Array.from({ length: SHORTCUT_LIMIT + 4 }, (_, index) => ({
      url: `https://site${index}.test/`,
      title: `Site ${index}`,
    }))
    const shortcuts = toShortcuts(sites, base)
    expect(shortcuts).toHaveLength(SHORTCUT_LIMIT)
    expect(shortcuts[0]?.title).toBe('Site 0')
  })

  it('falls back to the hostname when a title is blank', () => {
    const [shortcut] = toShortcuts([{ url: 'https://www.example.org/path', title: '  ' }], base)
    expect(shortcut?.title).toBe('example.org')
  })

  it('keeps an unparseable url as its own title rather than dropping it', () => {
    const [shortcut] = toShortcuts([{ url: 'not a url', title: '' }], base)
    expect(shortcut?.title).toBe('not a url')
  })
})
