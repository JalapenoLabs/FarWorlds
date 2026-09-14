// Copyright © 2026 Alex Navarro

import { defineManifest } from '@crxjs/vite-plugin'

import packageJson from './package.json' with { type: 'json' }

/**
 * Manifest V3. No permissions: everything is generated locally and persisted in the page's own storage.
 * The new tab override is the product; the toolbar action only reopens it.
 */
export const manifest = defineManifest({
  manifest_version: 3,
  name: 'Farworlds',
  short_name: 'Farworlds',
  version: packageJson.version,
  description: 'A new world on every new tab. Explore procedurally generated planets, stars and asteroids.',
  offline_enabled: true,
  icons: {
    128: 'icons/icon-128.png',
    256: 'icons/icon-256.png',
  },
  chrome_url_overrides: {
    newtab: 'newtab.html',
  },
  action: {
    default_title: 'Farworlds',
  },
  background: {
    service_worker: 'src/background.ts',
    type: 'module',
  },
})
