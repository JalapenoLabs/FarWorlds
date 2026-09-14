// Copyright © 2026 Alex Navarro

// Core
import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'

// Misc
import enUS from './locales/en-US.json'

i18next
  .use(initReactI18next)
  .init({
    lng: 'en-US',
    fallbackLng: 'en-US',
    resources: {
      'en-US': { translation: enUS },
    },
    interpolation: {
      escapeValue: false,
    },
  })

export { i18next }
