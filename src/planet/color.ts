// Copyright © 2026 Alex Navarro

/** HSL (hue 0..360, saturation and lightness 0..1) to a packed 0xRRGGBB number, for palettes built from random hues. */
export function hslToHex(hue: number, saturation: number, lightness: number): number {
  const normalizedHue = ((hue % 360) + 360) % 360
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation
  const secondary = chroma * (1 - Math.abs(((normalizedHue / 60) % 2) - 1))
  const match = lightness - chroma / 2

  const sector = Math.floor(normalizedHue / 60)
  const rgbBySector = [
    [chroma, secondary, 0],
    [secondary, chroma, 0],
    [0, chroma, secondary],
    [0, secondary, chroma],
    [secondary, 0, chroma],
    [chroma, 0, secondary],
  ] as const
  const [red, green, blue] = rgbBySector[sector] ?? rgbBySector[0]

  return (
    (Math.round((red + match) * 255) << 16)
    | (Math.round((green + match) * 255) << 8)
    | Math.round((blue + match) * 255)
  )
}

/** Unpacks a 0xRRGGBB number into 0..1 channels, the form vertex colour buffers want. */
export function hexToRgb(hex: number): [number, number, number] {
  return [
    ((hex >> 16) & 255) / 255,
    ((hex >> 8) & 255) / 255,
    (hex & 255) / 255,
  ]
}

/** CSS colour string for a packed number, for the few places the UI mirrors a scene colour. */
export function hexToCss(hex: number): string {
  return `#${hex.toString(16).padStart(6, '0')}`
}
