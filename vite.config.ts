// Copyright © 2026 Alex Navarro

import { fileURLToPath, URL } from 'node:url'

// Core
import { defineConfig } from 'vitest/config'
import { crx } from '@crxjs/vite-plugin'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// Misc
import { manifest } from './manifest.config.ts'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    crx({ manifest }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    // dist/ is what gets zipped for the store, so it carries no source maps; profile with `vite build
    // --sourcemap` when needed.
    sourcemap: false,
    target: 'es2022',
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
