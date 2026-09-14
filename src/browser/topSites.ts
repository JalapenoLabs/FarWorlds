// Copyright © 2026 JalapenoLabs

// Misc
import { SHORTCUT_ICON_SIZE, SHORTCUT_LIMIT, SHORTCUT_PERMISSIONS } from '@/constants'

export type Shortcut = {
  url: string
  title: string
  iconUrl: string
}

function hasChromeApi(): boolean {
  return typeof chrome !== 'undefined' && Boolean(chrome.permissions)
}

/** Whether the shortcuts widget already has the permissions it needs. */
export async function hasShortcutPermissions(): Promise<boolean> {
  if (!hasChromeApi()) {
    return false
  }
  return chrome.permissions.contains({ permissions: [...SHORTCUT_PERMISSIONS] })
}

/** Asks the user for the shortcut permissions. Must be called from a user gesture. */
export async function requestShortcutPermissions(): Promise<boolean> {
  if (!hasChromeApi()) {
    console.debug('chrome.permissions is unavailable; shortcuts cannot be enabled here')
    return false
  }
  return chrome.permissions.request({ permissions: [...SHORTCUT_PERMISSIONS] })
}

/**
 * Chrome serves cached favicons to extensions through a special path once the favicon permission is granted.
 * Built by hand because `chrome-extension:` is not a special scheme and URL resolution against it varies.
 */
export function buildFaviconUrl(pageUrl: string, extensionBaseUrl: string): string {
  const params = new URLSearchParams({ pageUrl, size: String(SHORTCUT_ICON_SIZE) })
  return `${extensionBaseUrl.replace(/\/$/, '')}/_favicon/?${params.toString()}`
}

/** Trims Chrome's most-visited list to what fits and gives each entry a readable title. */
export function toShortcuts(
  sites: ReadonlyArray<{ url: string, title: string }>,
  extensionBaseUrl: string,
): Shortcut[] {
  const shortcuts: Shortcut[] = []
  for (const site of sites) {
    if (shortcuts.length >= SHORTCUT_LIMIT) {
      break
    }
    let title = site.title.trim()
    if (!title) {
      try {
        title = new URL(site.url).hostname.replace(/^www\./, '')
      }
      catch {
        title = site.url
      }
    }
    shortcuts.push({ url: site.url, title, iconUrl: buildFaviconUrl(site.url, extensionBaseUrl) })
  }
  return shortcuts
}

export async function loadShortcuts(): Promise<Shortcut[]> {
  if (!hasChromeApi() || !chrome.topSites) {
    console.debug('chrome.topSites is unavailable, no shortcuts to show')
    return []
  }
  const sites = await chrome.topSites.get()
  return toShortcuts(sites, chrome.runtime.getURL('/'))
}
