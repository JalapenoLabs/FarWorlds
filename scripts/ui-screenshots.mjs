// Copyright © 2026 JalapenoLabs

/**
 * Visual check for the built new tab page. Serves nothing itself: start a static server on dist/ and a headless
 * Chromium with remote debugging, then run this to click through every panel and save screenshots.
 *
 *   python3 -m http.server 4173 --bind 127.0.0.1 --directory dist &
 *   chromium --headless=new --use-angle=swiftshader --enable-unsafe-swiftshader --window-size=1600,900 \
 *     --remote-debugging-port=9222 --user-data-dir=/tmp/farworlds-profile about:blank &
 *   node scripts/ui-screenshots.mjs "http://127.0.0.1:4173/newtab.html?x=8274.46&y=4018.39&z=489.66&w=1" /tmp/shots
 *
 * Click targets assume a 1600x900 viewport.
 */
import { writeFileSync } from 'node:fs'

const [,, targetUrl, outDir] = process.argv
const response = await fetch('http://127.0.0.1:9222/json/list')
const targets = await response.json()
const page = targets.find((target) => target.type === 'page')
const socket = new WebSocket(page.webSocketDebuggerUrl)
await new Promise((resolve) => socket.addEventListener('open', resolve))

let nextId = 1
const pending = new Map()
socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data)
  if (message.id && pending.has(message.id)) {
    pending.get(message.id)(message.result ?? message.error)
    pending.delete(message.id)
  }
})
function send(method, params = {}) {
  return new Promise((resolve) => {
    const id = nextId++
    pending.set(id, resolve)
    socket.send(JSON.stringify({ id, method, params }))
  })
}
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function click(x, y) {
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y })
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 })
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 })
}
async function shot(name) {
  const { data } = await send('Page.captureScreenshot', { format: 'png' })
  writeFileSync(`${outDir}/${name}.png`, Buffer.from(data, 'base64'))
  console.log('saved', name)
}

await send('Page.enable')
await send('Runtime.enable')
await send('Emulation.setDeviceMetricsOverride', { width: 1600, height: 900, deviceScaleFactor: 1, mobile: false })
await send('Page.navigate', { url: targetUrl })
await sleep(9000)
await shot('ui-home')

await click(31, 868); await sleep(600); await shot('ui-settings')
await click(69, 868); await sleep(600); await shot('ui-travel')
await click(69, 868); await sleep(300)
await click(31, 31); await sleep(600); await shot('ui-booklet')
await click(31, 31); await sleep(300)
// Planet name sits right of the clock; find it through the DOM instead of guessing pixels.
const { result } = await send('Runtime.evaluate', { expression: `(() => { const b = [...document.querySelectorAll('button')].find((el) => el.title === 'World details'); const r = b.getBoundingClientRect(); return JSON.stringify({ x: r.x + r.width / 2, y: r.y + r.height / 2 }) })()` })
const namePoint = JSON.parse(result.value)
await click(namePoint.x, namePoint.y); await sleep(600); await shot('ui-info')
await click(1568, 31); await sleep(400); await shot('ui-copied')
// Shuffle to a second world so the logbook has two rows.
await click(107, 868); await sleep(8000)
await click(31, 31); await sleep(800); await shot('ui-booklet-2')
socket.close()
