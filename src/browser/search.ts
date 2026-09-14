// Copyright © 2026 JalapenoLabs

/**
 * Runs a query through the browser's default search engine. Outside an extension page (the static preview
 * used for screenshots) the API does not exist, so the query falls back to a plain Google URL.
 */
export function searchTheWeb(text: string): void {
  const query = text.trim()
  if (!query) {
    return
  }
  if (typeof chrome !== 'undefined' && chrome.search) {
    void chrome.search.query({ text: query, disposition: 'CURRENT_TAB' })
    return
  }
  console.debug('chrome.search is unavailable, opening a search URL instead')
  window.location.assign(`https://www.google.com/search?q=${encodeURIComponent(query)}`)
}
