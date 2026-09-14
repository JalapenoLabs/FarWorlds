// Copyright © 2026 JalapenoLabs

// Core
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'

// Redux
import { store } from '@/store/store'

// User interface
import { App } from './App'

// Misc
import '@/i18n'

const container = document.getElementById('root')
if (!container) {
  throw new Error('The new tab page has no #root element')
}

createRoot(container).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)
