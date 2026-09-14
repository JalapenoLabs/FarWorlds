# Chrome Web Store listing

Everything the developer dashboard asks for, in the order it asks. Upload `release/farworlds-<version>.zip`
(built by `yarn build` then zipping `dist/`).

## Store listing

**Name**: Farworlds

**Summary** (132 characters max):
A new world on every new tab: procedurally generated 3D planets, stars and asteroids beside your clock.

**Description**:

Farworlds turns every new tab into a place you have never been. Each tab opens on a procedurally generated
world rendered in 3D, drifting slowly in a field of stars, with the time and date beside it.

Seven kinds of world are out there: ocean worlds with continents, beaches and ice caps; island worlds; mountainous
ridge worlds; bare rock; tumbling asteroids; glowing stars; and banded gas giants. Some carry rings, some have
moons, most have weather. Drag to orbit, scroll to zoom.

Every world comes from a coordinate. The same coordinate always shows the same world, so copy it and send it to a
friend and they will land on exactly the planet you found. Shuffle for a new one, or enter coordinates by hand.

The logbook keeps your travel history and the worlds you save, each with a thumbnail, so favourites are one
click away.

Optional widgets, off by default, add a search bar that uses your browser's default search engine and a row of
your most visited sites.

Farworlds needs no account and makes no network requests. Worlds are generated on your machine and your settings
and logbook stay in your browser.

Open source under the MIT license: https://github.com/JalapenoLabs/FarWorlds

**Category**: Fun (alternatively Productivity)

**Language**: English (United States)

**Icon**: `public/icons/icon-128.png`

**Screenshots** (1280x800): `store/screenshots/1-ringed-world.png` through `5-star.png`

**Small promo tile** (440x280): `store/promo-tile-440x280.png`

**Marquee promo tile** (1400x560): `store/promo-marquee-1400x560.png`

**Homepage URL**: https://github.com/JalapenoLabs/FarWorlds

**Support URL**: https://github.com/JalapenoLabs/FarWorlds/issues

## Privacy practices

**Single purpose**: Replaces the new tab page with a procedurally generated 3D world, a clock, and optional search
and shortcut widgets.

**Permission justifications**:

- `search`: The optional search bar submits the user's query through the browser's default search engine with
  `chrome.search.query`. No query text is stored or sent anywhere else.
- `topSites` (optional): The optional shortcuts row shows the user's most visited sites, like the default new tab
  page. Requested only when the user turns the widget on in settings. The list is read at page load and never
  stored or transmitted.
- `favicon` (optional): Draws the icon for each shortcut from Chrome's own favicon cache. Requested together with
  topSites, only when the widget is turned on.

**Host permissions**: none.

**Remote code**: No, this extension does not use remote code. All scripts ship in the package.

**Data usage**: Select nothing. The extension does not collect or transmit personal communications, browsing
history, location, financial, health, authentication, or user activity data. Settings and the logbook (world
coordinates, names, small rendered thumbnails) are stored in the browser's local storage on the device only.

**Certifications**: Confirm all three (no sale of data, no use unrelated to the single purpose, no use for
creditworthiness or lending).

**Privacy policy URL**: https://github.com/JalapenoLabs/FarWorlds/blob/main/store/privacy-policy.md

## Distribution

Visibility: Public. Regions: all. Pricing: free.

## Publisher

Verify the developer account's contact email matches the manifest `author.email` (alex@jalapenolabs.io) to earn
the verified publisher badge. Set the publisher display name to JalapenoLabs.
