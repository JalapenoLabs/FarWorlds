// Copyright © 2026 Alex Navarro

import type { Rng } from './rng'

/**
 * World names are assembled from syllables and a handful of templates, so they read like catalogue entries
 * ("KX-40317"), colonised worlds ("New Velmora") or classical designations ("Tarsis Prime").
 */

const OPENING_SYLLABLES = [
  'al', 'ar', 'bel', 'bra', 'cal', 'cor', 'dan', 'dra', 'el', 'er', 'fen', 'gal', 'gor', 'hal', 'hel',
  'ily', 'ith', 'jor', 'kai', 'kel', 'lum', 'lyr', 'mar', 'mel', 'nev', 'nor', 'ol', 'or', 'pra', 'pol',
  'quin', 'ran', 'rho', 'sel', 'sil', 'tar', 'tor', 'ul', 'ven', 'vor', 'wen', 'wex', 'xan', 'yor', 'zel', 'zor',
] as const

const MIDDLE_SYLLABLES = [
  'a', 'e', 'i', 'o', 'u', 'an', 'ar', 'en', 'in', 'on', 'or', 'ul', 'ev', 'am', 'ol', 'is', 'th', 'ph',
] as const

const CLOSING_SYLLABLES = [
  'ara', 'ath', 'eon', 'eth', 'ia', 'ion', 'is', 'ith', 'mora', 'nar', 'nis', 'orn', 'os', 'ova', 'phi',
  'ra', 'rion', 'ris', 'sa', 'sis', 'tan', 'tis', 'tor', 'ura', 'us', 'vane', 'wyn', 'yne', 'yx', 'za',
] as const

const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'] as const

const ADORNMENTS = [
  'Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta', 'Iota', 'Kappa', 'Lambda', 'Mu',
  'Nu', 'Xi', 'Omicron', 'Pi', 'Rho', 'Sigma', 'Tau', 'Upsilon', 'Phi', 'Chi', 'Psi', 'Omega',
  'Major', 'Minor', 'Prime', 'Secundus', 'Ultima',
] as const

const CATALOGUE_LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ'

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1)
}

/** A pronounceable two- or three-syllable proper noun. */
export function generateProperName(rng: Rng): string {
  const opening = rng.pick(OPENING_SYLLABLES)
  const closing = rng.pick(CLOSING_SYLLABLES)
  const middle = rng.chance(0.35)
    ? rng.pick(MIDDLE_SYLLABLES)
    : ''
  return capitalize(`${opening}${middle}${closing}`)
}

function generateCatalogueCode(rng: Rng): string {
  const first = CATALOGUE_LETTERS.charAt(rng.int(0, CATALOGUE_LETTERS.length - 1))
  const second = CATALOGUE_LETTERS.charAt(rng.int(0, CATALOGUE_LETTERS.length - 1))
  return `${first}${second}`
}

function generateCatalogueNumber(rng: Rng): string {
  return String(rng.int(0, 99999)).padStart(5, '0')
}

const NAME_TEMPLATES: ReadonlyArray<(rng: Rng) => string> = [
  (rng) => `${generateCatalogueCode(rng)}-${generateCatalogueNumber(rng)}`,
  (rng) => `${generateProperName(rng)} ${rng.pick(ADORNMENTS)}`,
  (rng) => `${rng.pick(ADORNMENTS)} ${generateProperName(rng)}`,
  (rng) => `${generateProperName(rng)} ${rng.pick(ROMAN_NUMERALS)}`,
  (rng) => `New ${generateProperName(rng)}`,
  (rng) => `${generateProperName(rng)}-${generateCatalogueNumber(rng).slice(1)}`,
]

export function generateWorldName(rng: Rng): string {
  return rng.pick(NAME_TEMPLATES)(rng)
}
