// Copyright © 2026 JalapenoLabs

/**
 * The service worker only exists so the toolbar icon has somewhere to go. The new tab override is the
 * product and needs no background state.
 */
chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL('newtab.html') })
})
