# Research: sources, contacts, provenance

## What exists in `archive/`

| Path | Origin |
| --- | --- |
| `tabiverse-0.0.0.17.xpi` | Firefox build, downloaded from addons.mozilla.org (file id 3515985, signed by Mozilla) |
| `original-extension/` | The XPI unpacked (Mozilla `META-INF` removed) |
| `original-manifest.json` | Manifest V2 from the XPI |
| `prettified/` | Prettier output of the bundle and worker, plus the app-only slice |
| `screenshots/` | All 16 AMO listing previews (five 2020 marketing frames, eleven 2019 raw captures) |
| `amo-listing.json` | AMO API record: description, full changelog 0.0.0.2 → 0.0.0.16, contact fields |
| `reddit-*.json` | Both launch threads with every comment (pullpush.io mirror) |
| `discord-invite.json` | Live Discord invite record for the Tabiverse server |
| `deep-research-result.json` | The verified multi-agent research report (25 claims, all confirmed) |

The Chrome CRX (0.0.0.16) was not retrieved: crx4chrome and chrome-stats block scripted downloads and the Web
Store no longer serves the ID. The Firefox 0.0.0.17 build is one patch newer and has the same bundle, so it
supersedes it.

## Listings

- Chrome Web Store (delisted, Manifest V2): `chromewebstore.google.com/detail/hpplgjkooibhfkmmepoikcjpadcojcik`.
  Google's update endpoint returns 204 for the ID. The 2019 slug was `tabiverse-a-universe-in-y`
  ("Tabiverse - A Universe in Your New Tab"). Wayback capture 20230627013533 of the old listing still shows
  version 0.0.0.16 and 2,000+ users.
- Firefox AMO (still installable): https://addons.mozilla.org/en-US/firefox/addon/tabiverse/
- crx4chrome mirror with seven CRX versions: https://www.crx4chrome.com/extensions/hpplgjkooibhfkmmepoikcjpadcojcik/
- chrome-stats: https://chrome-stats.com/d/hpplgjkooibhfkmmepoikcjpadcojcik
- Softonic and OffiDocs pages are scraped copies of the store text with no extra information.

## Developer and contact channels, best first

1. **Discord**: invite `https://discord.gg/MUgRGwE` still resolves. Server "Tabiverse" (guild id
   628350322359795713), ~224 members, landing channel `#share-planets`. Inviter is the owner account,
   username `7kb`, display name "Cube", user id 73659979663413248.
2. **Email**: tabiverse@gmail.com (support email on the AMO listing).
3. **Reddit**: u/Thriver9 (launch posts in r/proceduralgeneration `dcfug6`, Oct 2019, and r/startpages
   `evth1x`, Jan 2020).
4. **Hacker News**: user `thriver9`, Show HN 21306243 (Oct 21 2019).
5. **Twitter/X**: @tabiverse (joined Sep 2019), rate-limited during research, unverified whether active.
6. AMO author profile 15345644 is anonymous. No GitHub account matches thriver9 or tabiverse.

Statements by the developer that matter:
- "closed sourced for now, but there is a possibility that I will eventually open source it once I feel it's
  ready" (r/startpages, Jan 2020).
- "yep, it's three.js" and a pointer to Sebastian Lague's Procedural Planets series
  (https://www.youtube.com/playlist?list=PLFt_AvWsXl0cONs3T0By4puYy6GM22ko8, code at
  https://github.com/SebLague/Procedural-Planets, MIT) as the generation approach.
- Planet count claim: "approximately 8.0^12 unique planets" (coordinate space 2,000,000³).

## Dead infrastructure

- `tabiverse.com`: no longer serves HTTP; the domain is parked (Wayback 2025 capture is an ad page). Wayback
  holds the 2019 site (capture 20191216154259) and its web build of the renderer at `/index.min.js`
  (1,171,095 bytes, a share-page variant without the clock HUD). The share page rendered a planet for a
  coordinate without the extension.
- `thumbnails.tabiverse.com`: served booklet thumbnails, gone.
- Google Form uninstall survey and Amplitude project: not ours to reuse.

## Third-party re-packaging

`https://github.com/Nandan-18/tabiverse` (2025–2026, MV3, version 1.3.3) re-ships the original minified bundle
with CSS/JS overlays (weather bar, meteors, logbook) and patches. It has **no license** and is a derivative of
closed-source code, so it is not a fork candidate. Its `manifest.json` and `background.js` are a useful
reference for the MV3 wrapper shape only (`chrome.action`, service worker, `host_permissions`).

## Verification notes

- Bundle libraries and versions were read from the prettified source, not inferred.
- Type probabilities, stat ranges, storage keys and URL formats are quoted from code (see `code-map.md`).
- Screenshots confirm layout, iconography, typography and colour palette.
